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
import type { Prisma } from '@prisma/client'

// =============================================================================
// GET /admin/inventario — variantes respetando permisos
// =============================================================================

export async function getVariants(page = 1, limit = 50) {
  const session = await requireRole(['admin', 'vendor'])

  const isAdmin = session.user.role === 'admin'
  // Usuario normal: solo variantes de SUS productos
  const productFilter: Prisma.ProductWhereInput | undefined = isAdmin
    ? undefined
    : { createdById: session.user.id }

  const [variants, total] = await Promise.all([
    prisma.variant.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            createdById: true,
            vendor: {
              select: { storeName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      ...(productFilter ? { where: { product: productFilter } } : {}),
    }),
    prisma.variant.count({ ...(productFilter ? { where: { product: productFilter } } : {}) }),
  ])

  return { variants, total, page, limit }
}

export async function getProductsForSelect() {
  const session = await requireRole(['admin', 'vendor'])

  const where: Prisma.ProductWhereInput = { deletedAt: null }
  if (session.user.role !== 'admin') {
    where.createdById = session.user.id
  }

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: 'asc'
    }
  })

  return products
}

export async function getAdminVariantById(id: string) {
  const session = await requireRole(['admin', 'vendor'])

  const variant = await prisma.variant.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, title: true, createdById: true } },
    },
  })

  if (!variant) {
    return { success: false, error: 'Variante no encontrada', status: 404 as const }
  }

  if (!canAccessProduct(session.user, variant.product.createdById)) {
    return forbiddenResponse()
  }

  return { success: true, variant }
}

// =============================================================================
// POST /admin/inventario — crear variante (solo sobre producto propio)
// =============================================================================

export async function createVariant(data: any) {
  const session = await requirePermission(PERMISSIONS.VARIANT_MANAGE_OWN)

  try {
    // Verificar que el producto pertenezca al usuario (o sea admin)
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, createdById: true },
    })

    if (!product) {
      return { success: false, error: 'Producto no encontrado', status: 404 as const }
    }

    if (!canAccessProduct(session.user, product.createdById)) {
      return forbiddenResponse()
    }

    const existingSku = await prisma.variant.findUnique({
      where: { sku: data.sku }
    })

    if (existingSku) {
      return { success: false, error: 'El SKU ya está registrado para otra variante' }
    }

    const variant = await prisma.variant.create({
      data: {
        productId: data.productId,
        sku: data.sku,
        title: data.title,
        weightGrams: data.weightGrams ? parseInt(data.weightGrams, 10) : null,
        grindType: data.grindType || 'whole-bean',
        priceInCents: Math.round(parseFloat(data.price) * 100),
        comparePriceInCents: data.comparePrice ? Math.round(parseFloat(data.comparePrice) * 100) : null,
        stockQuantity: parseInt(data.stockQuantity, 10) || 0,
        lowStockAlert: parseInt(data.lowStockAlert, 10) || 5,
        status: data.status || 'active',
      }
    })

    revalidatePath('/admin/inventario')
    return { success: true, variant }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error creating variant:', error)
    return { success: false, error: error.message || 'Error al crear la variante' }
  }
}

export async function createVariantsBulk(
  items: Array<{
    productId: string
    sku: string
    title: string
    weightGrams: number | null
    grindType: string
    priceInCents: number
    stockQuantity: number
    status: string
  }>
) {
  const session = await requirePermission(PERMISSIONS.VARIANT_MANAGE_OWN)

  try {
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'No hay variantes para crear' }
    }

    // Verificar que TODOS los productos pertenezcan al usuario (o admin)
    const productIds = [...new Set(items.map(i => i.productId))]
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, createdById: true },
    })

    const ownedIds = new Set(products.filter(p => canAccessProduct(session.user, p.createdById)).map(p => p.id))
    if (ownedIds.size !== productIds.length) {
      return forbiddenResponse()
    }

    const result = await prisma.variant.createMany({
      data: items,
      skipDuplicates: true,
    })
    revalidatePath('/admin/inventario')
    return { success: true, count: result.count }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error creating variants in bulk:', error)
    return { success: false, error: error.message || 'Error al crear variantes' }
  }
}

// =============================================================================
// PATCH /admin/inventario/:id — actualizar variante (propietario o admin)
// =============================================================================

export async function updateVariant(id: string, data: any) {
  const session = await requirePermission(PERMISSIONS.VARIANT_MANAGE_OWN)

  try {
    const variant = await prisma.variant.findUnique({
      where: { id },
      include: { product: { select: { id: true, createdById: true } } },
    })

    if (!variant) {
      return { success: false, error: 'Variante no encontrada', status: 404 as const }
    }

    if (!canAccessProduct(session.user, variant.product.createdById)) {
      return forbiddenResponse()
    }

    // Si cambia de producto, validar también la propiedad del nuevo
    if (data.productId && data.productId !== variant.productId) {
      const target = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { id: true, createdById: true },
      })
      if (!target) {
        return { success: false, error: 'Producto no encontrado', status: 404 as const }
      }
      if (!canAccessProduct(session.user, target.createdById)) {
        return forbiddenResponse()
      }
    }

    const updated = await prisma.variant.update({
      where: { id },
      data: {
        productId: data.productId,
        sku: data.sku,
        title: data.title,
        weightGrams: data.weightGrams ? parseInt(data.weightGrams, 10) : null,
        grindType: data.grindType,
        priceInCents: Math.round(parseFloat(data.price) * 100),
        comparePriceInCents: data.comparePrice ? Math.round(parseFloat(data.comparePrice) * 100) : null,
        stockQuantity: parseInt(data.stockQuantity, 10) || 0,
        lowStockAlert: parseInt(data.lowStockAlert, 10) || 5,
        status: data.status,
      }
    })

    revalidatePath('/admin/inventario')
    return { success: true, variant: updated }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error updating variant:', error)
    return { success: false, error: error.message || 'Error al actualizar la variante' }
  }
}
