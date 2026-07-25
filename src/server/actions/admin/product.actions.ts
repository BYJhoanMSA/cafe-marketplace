'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db/client'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

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

export async function getAdminProducts() {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      category: true,
      origin: true,
      vendor: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return products
}

export async function createProduct(data: Record<string, unknown>) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  const parsed = ProductSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos: ' + parsed.error.errors.map(e => e.message).join(', ') }
  }

  try {
    const defaultVendor = await prisma.vendor.findFirst()
    const defaultCategory = await prisma.category.findFirst()

    if (!defaultVendor || !defaultCategory) {
      return { success: false, error: 'Faltan datos base (Vendor, Category) en la DB.' }
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
        isPublicity: d.isPublicity ?? false,
        vendorId: d.vendorId || defaultVendor.id,
        categoryId: d.categoryId || defaultCategory.id,
        originId: originId,
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
    return { success: true, product }
  } catch (error: any) {
    console.error('Error creating product:', error)
    return { success: false, error: error.message || 'Error al crear producto' }
  }
}

export async function updateProduct(id: string, data: any) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  try {
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
      // Eliminar imágenes anteriores y reemplazar
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
        isPublicity: data.isPublicity ?? false,
        vendorId: data.vendorId,
        categoryId: data.categoryId,
        ...(originId ? { originId } : {}),
      }
    })

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${id}`)
    revalidatePath('/catalogo')
    revalidatePath('/')
    return { success: true, product }
  } catch (error: any) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message || 'Error al actualizar producto' }
  }
}

export async function archiveProduct(id: string) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { status: 'archived' }
    })
    
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Error al archivar el producto' }
  }
}

export async function deleteProduct(id: string) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, lineItems: { take: 1 } }
    })

    if (!product) {
      return { success: false, error: 'Producto no encontrado' }
    }

    // Eliminar archivos de imágenes del disco
    for (const image of product.images) {
      const normalized = image.url.replace(/\\/g, '/')
      if (normalized.startsWith('/uploads/') && !normalized.includes('..') && !normalized.includes('~')) {
        const filePath = join(process.cwd(), 'public', normalized)
        try { await unlink(filePath) } catch { }
      }
    }

    const hasOrders = product.lineItems.length > 0

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
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Error al eliminar el producto' }
  }
}
