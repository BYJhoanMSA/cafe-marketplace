'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db/client'
import {
  requireRole,
  requirePermission,
  isForbiddenError,
  forbiddenResponse,
} from '@/server/middleware/auth.middleware'
import { PERMISSIONS, canAccessProduct } from '@/server/auth/roles'
import { slugify } from '@/lib/utils'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { deleteFromCloudinary, cloudinaryConfigured } from '@/lib/cloudinary'
import { z } from 'zod'
import { invalidateProductsCache, invalidateProductCache } from '@/server/actions/catalog.actions'
import { getUserVendor, ensureUserVendor } from '@/server/services/vendor.service'

const ProductSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().max(255).optional(),
  description: z.string().min(1),
  shortDescription: z.string().max(500).nullable().optional(),
  vendorId: z.string().optional(),
  categoryId: z.string().optional(),
  originId: z.string().optional(),
  regionName: z.string().optional(),
  status: z.string().default('draft'),
  roastLevel: z.string().min(1),
  processingMethod: z.string().min(1),
  altitudeMasl: z.string().nullable().optional(),
  varietal: z.string().nullable().optional(),
  farmName: z.string().nullable().optional(),
  producerName: z.string().nullable().optional(),
  cuppingScore: z.union([z.string(), z.number()]).nullable().optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isLimited: z.boolean().default(false),
  isOrganic: z.boolean().default(false),
  isPublicity: z.boolean().default(false),
  isFairTrade: z.boolean().default(false),
  images: z.array(z.object({
    url: z.string(),
    alt: z.string(),
    position: z.number(),
  })).default([]),
  imageUrls: z.array(z.string()).default([]),
  flavorNotes: z.array(z.string()).default([]),
  variants: z.array(z.any()).default([]),
}).passthrough()

// =============================================================================
// Helpers privados
// =============================================================================

/**
 * Resuelve el vendor al que se asociará el producto según el rol:
 * - admin: usa el vendorId enviado (si existe) o su propio vendor.
 * - resto: SIEMPRE su propio vendor (se crea automáticamente si no tiene).
 */
async function resolveVendorId(session: { user: { id: string; role?: string } }, requestedVendorId?: string): Promise<{ vendorId: string; storeName: string } | null> {
  if (session.user.role === 'admin' && requestedVendorId) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: requestedVendorId },
      select: { id: true, storeName: true },
    })
    if (vendor) return { vendorId: vendor.id, storeName: vendor.storeName }
  }

  const own = await getUserVendor(session.user.id)
  if (own) return { vendorId: own.id, storeName: own.storeName }

  if (session.user.role === 'admin') {
    const first = await prisma.vendor.findFirst({
      where: { deletedAt: null },
      select: { id: true, storeName: true },
    })
    if (first) return { vendorId: first.id, storeName: first.storeName }
    return null
  }

  const created = await ensureUserVendor(session.user.id)
  return { vendorId: created.id, storeName: created.storeName }
}

// =============================================================================
// GET /admin/productos — listado respetando permisos
// =============================================================================

export async function getAdminProducts(page = 1, limit = 50) {
  const session = await requireRole(['admin', 'vendor'])

  const isAdmin = session.user.role === 'admin'
  const where: { deletedAt: null; createdById?: string } = { deletedAt: null }
  if (!isAdmin) {
    // Usuario normal: solo sus propios productos
    where.createdById = session.user.id
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        origin: true,
        vendor: true,
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where })
  ])

  return { products, total, page, limit }
}

export async function getAdminProductById(id: string) {
  const session = await requireRole(['admin', 'vendor'])

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: 'asc' } },
      flavorNotes: { select: { note: true } },
      origin: { select: { region: true } },
      createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  })

  if (!product) {
    return { success: false, error: 'Producto no encontrado', status: 404 as const }
  }

  if (!canAccessProduct(session.user, product.createdById)) {
    return forbiddenResponse()
  }

  return { success: true, product }
}

// =============================================================================
// POST /admin/productos — crear (owner se asigna desde la sesión)
// =============================================================================

export async function createProduct(data: Record<string, unknown>) {
  const session = await requirePermission(PERMISSIONS.PRODUCT_CREATE)

  const parsed = ProductSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos: ' + parsed.error.errors.map(e => e.message).join(', ') }
  }

  try {
    const defaultCategory = await prisma.category.findFirst({ where: { isActive: true } })
    if (!defaultCategory) {
      return { success: false, error: 'Faltan datos base (Category) en la DB.' }
    }

    const isAdmin = session.user.role === 'admin'

    // El propietario NUNCA viene del frontend; se deriva de la sesión.
    const createdById = session.user.id

    const vendor = await resolveVendorId(session, parsed.data.vendorId)
    if (!vendor) {
      return { success: false, error: 'No tienes una marca (vendor) asociada. Contacta al administrador.' }
    }

    const d = parsed.data as any

    // Gestionar Origen por Región
    let originId = d.originId
    if (!originId && d.regionName) {
      const regionSlug = slugify(`colombia-${d.regionName}`)
      const origin = await prisma.origin.upsert({
        where: { slug: regionSlug },
        update: { region: d.regionName },
        create: {
          country: 'Colombia',
          countryCode: 'CO',
          region: d.regionName,
          slug: regionSlug,
        }
      })
      originId = origin.id
    }

    if (!originId) {
      const defaultOrigin = await prisma.origin.findFirst()
      originId = defaultOrigin?.id ?? ''
    }

    // "Publicidad" es exclusivo del Administrador General
    const isPublicity = isAdmin ? (d.isPublicity ?? false) : false

    const product = await prisma.product.create({
      data: {
        title: d.title,
        slug: d.slug ?? '',
        description: d.description,
        status: d.status || 'draft',
        roastLevel: d.roastLevel || 'medium',
        processingMethod: d.processingMethod || 'washed',
        farmName: d.farmName || null,
        producerName: d.producerName || null,
        altitudeMasl: d.altitudeMasl || null,
        varietal: d.varietal || null,
        cuppingScore: d.cuppingScore ? Number(d.cuppingScore) : null,
        isFeatured: d.isFeatured ?? false,
        isNew: d.isNew ?? false,
        isLimited: d.isLimited ?? false,
        isOrganic: d.isOrganic ?? false,
        isPublicity,
        isFairTrade: d.isFairTrade ?? false,
        vendorId: vendor.vendorId,
        categoryId: d.categoryId || defaultCategory.id,
        originId: originId,
        createdById,
        flavorNotes: {
          create: (d.flavorNotes || []).map((note: string) => ({ note }))
        },
        // Guardar imágenes si vienen con el formulario
        ...(d.images && d.images.length > 0 ? {
          images: {
            create: d.images.map((img: any, i: number) => ({
              url: img.url,
              alt: img.alt || d.title,
              position: i,
              width: img.width || null,
              height: img.height || null,
              type: 'product',
            }))
          }
        } : {})
      }
    })

    revalidatePath('/admin/productos')
    revalidatePath('/catalogo')
    revalidatePath('/')
    invalidateProductsCache()
    return { success: true, product }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error creating product:', error)
    return { success: false, error: error.message || 'Error al crear producto' }
  }
}

// =============================================================================
// PUT/PATCH /admin/productos/:id — editar (propietario o admin)
// =============================================================================

export async function updateProduct(id: string, data: any) {
  const session = await requirePermission(PERMISSIONS.PRODUCT_UPDATE_OWN)

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, createdById: true, vendorId: true, isPublicity: true },
    })

    if (!existing) {
      return { success: false, error: 'Producto no encontrado', status: 404 as const }
    }

    // ¿El producto pertenece al usuario autenticado? Si no: ¿es admin? Si no: 403.
    if (!canAccessProduct(session.user, existing.createdById)) {
      return forbiddenResponse()
    }

    const isAdmin = session.user.role === 'admin'

    // El propietario es inmutable: nunca se actualiza desde el frontend
    delete data.createdById
    delete data.ownerId

    let originId = data.originId
    if (data.regionName) {
      const regionSlug = slugify(`colombia-${data.regionName}`)
      const origin = await prisma.origin.upsert({
        where: { slug: regionSlug },
        update: { region: data.regionName },
        create: {
          country: 'Colombia',
          countryCode: 'CO',
          region: data.regionName,
          slug: regionSlug,
        }
      })
      originId = origin.id
    }

    // Actualizar imágenes si vienen en la petición
    if (data.images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      if (data.images.length > 0) {
        await prisma.productImage.createMany({
          data: data.images.map((img: any, i: number) => ({
            productId: id,
            url: img.url,
            alt: img.alt || '',
            position: i,
            width: img.width || null,
            height: img.height || null,
            type: 'product',
          }))
        })
      }
    }

    // Actualizar notas de sabor
    if (data.flavorNotes !== undefined) {
      await prisma.productFlavorNote.deleteMany({ where: { productId: id } })
      if (data.flavorNotes.length > 0) {
        await prisma.productFlavorNote.createMany({
          data: data.flavorNotes.map((note: string) => ({ productId: id, note }))
        })
      }
    }

    // Vendor: admin puede asignar cualquier vendor; el resto conserva el suyo.
    let vendorId = existing.vendorId
    if (isAdmin && data.vendorId) {
      const target = await prisma.vendor.findUnique({ where: { id: data.vendorId } })
      if (target) vendorId = target.id
    } else if (!isAdmin) {
      const own = await getUserVendor(session.user.id)
      if (own) vendorId = own.id
    }

    // "Publicidad": solo el admin puede activarla; los demás se fuerzan a false.
    const isPublicity = isAdmin ? (data.isPublicity ?? existing.isPublicity) : false

    const product = await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        status: data.status,
        roastLevel: data.roastLevel,
        processingMethod: data.processingMethod,
        farmName: data.farmName || null,
        producerName: data.producerName || null,
        altitudeMasl: data.altitudeMasl || null,
        varietal: data.varietal || null,
        cuppingScore: data.cuppingScore ? parseFloat(data.cuppingScore) : null,
        isFeatured: data.isFeatured ?? false,
        isNew: data.isNew ?? false,
        isLimited: data.isLimited ?? false,
        isOrganic: data.isOrganic ?? false,
        isPublicity,
        vendorId,
        categoryId: data.categoryId,
        ...(originId ? { originId } : {}),
      }
    })

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${id}`)
    revalidatePath('/catalogo')
    revalidatePath('/')
    invalidateProductsCache()
    if (product.slug) invalidateProductCache(product.slug)
    return { success: true, product }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error updating product:', error)
    return { success: false, error: error.message || 'Error al actualizar producto' }
  }
}

// =============================================================================
// Archivar — propietario o admin
// =============================================================================

export async function archiveProduct(id: string) {
  const session = await requirePermission(PERMISSIONS.PRODUCT_UPDATE_OWN)

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, createdById: true },
    })

    if (!existing) {
      return { success: false, error: 'Producto no encontrado', status: 404 as const }
    }

    if (!canAccessProduct(session.user, existing.createdById)) {
      return forbiddenResponse()
    }

    await prisma.product.update({
      where: { id },
      data: { status: 'archived' }
    })

    revalidatePath('/admin/productos')
    invalidateProductsCache()
    return { success: true }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    return { success: false, error: 'Error al archivar el producto' }
  }
}

// =============================================================================
// DELETE /admin/productos/:id — eliminar (propietario o admin)
// =============================================================================

export async function deleteProduct(formData: FormData): Promise<void> {
  const session = await requirePermission(PERMISSIONS.PRODUCT_DELETE_OWN)

  const id = formData.get('productId') as string
  if (!id) return

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, createdById: true },
    })

    if (!product) return

    // Un usuario jamás puede eliminar productos de otro usuario
    if (!canAccessProduct(session.user, product.createdById)) {
      return
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true, lineItems: { take: 1 } }
    })

    if (!fullProduct) return

    for (const image of fullProduct.images) {
      const normalized = image.url.replace(/\\/g, '/')

      if (cloudinaryConfigured && normalized.includes('res.cloudinary.com')) {
        const publicIdMatch = normalized.match(/\/cafe\/(.+?)(?:-thumb)?\.(?:jpg|jpeg|png|webp|gif)(?:\?.*)?$/)
        if (publicIdMatch) {
          const base = `cafe/${publicIdMatch[1]}`
          await Promise.all([
            deleteFromCloudinary(base),
            deleteFromCloudinary(`${base}-thumb`),
          ])
        }
      }

      if (normalized.startsWith('/uploads/') && !normalized.includes('..') && !normalized.includes('~')) {
        const filePath = join(process.cwd(), 'public', normalized)
        try { await unlink(filePath) } catch { }
      }
    }

    // Obtener variantes del producto para limpiar carritos
    const variants = await prisma.variant.findMany({
      where: { productId: id },
      select: { id: true }
    })
    const variantIds = variants.map(v => v.id)

    if (variantIds.length > 0) {
      await prisma.cartItem.updateMany({
        where: { variantId: { in: variantIds } },
        data: { isDeleted: true, variantId: null }
      })
    }

    const hasOrders = fullProduct.lineItems.length > 0

    if (hasOrders) {
      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId: id } }),
        prisma.productFlavorNote.deleteMany({ where: { productId: id } }),
        prisma.productCertification.deleteMany({ where: { productId: id } }),
        prisma.favorite.deleteMany({ where: { productId: id } }),
        prisma.review.deleteMany({ where: { productId: id } }),
        prisma.product.update({
          where: { id },
          data: { deletedAt: new Date() }
        }),
      ])
    } else {
      await prisma.product.delete({ where: { id } })
    }

    revalidatePath('/admin/productos')
    invalidateProductsCache()
    return
  } catch (error: any) {
    if (isForbiddenError(error)) return
    console.error('Error deleting product:', error)
  }
}
