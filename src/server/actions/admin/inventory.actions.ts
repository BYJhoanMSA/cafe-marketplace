'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db/client'
import { requireRole } from '@/server/middleware/auth.middleware'

export async function getVariants(page = 1, limit = 50) {
  await requireRole(['admin', 'vendor'])

  const [variants, total] = await Promise.all([
    prisma.variant.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            vendor: {
              select: { storeName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.variant.count()
  ])

  return { variants, total, page, limit }
}

export async function getProductsForSelect() {
  await requireRole(['admin', 'vendor'])

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
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

export async function createVariant(data: any) {
  await requireRole(['admin', 'vendor'])

  try {
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
  await requireRole(['admin', 'vendor'])

  try {
    const result = await prisma.variant.createMany({
      data: items,
      skipDuplicates: true,
    })
    revalidatePath('/admin/inventario')
    return { success: true, count: result.count }
  } catch (error: any) {
    console.error('Error creating variants in bulk:', error)
    return { success: false, error: error.message || 'Error al crear variantes' }
  }
}

export async function updateVariant(id: string, data: any) {
  await requireRole(['admin', 'vendor'])

  try {
    const variant = await prisma.variant.update({
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
    return { success: true, variant }
  } catch (error: any) {
    console.error('Error updating variant:', error)
    return { success: false, error: error.message || 'Error al actualizar la variante' }
  }
}
