'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db/client'
import { auth } from '@/lib/auth'

export async function getVariants() {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  const variants = await prisma.variant.findMany({
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
    orderBy: {
      createdAt: 'desc'
    }
  })

  return variants
}

export async function getProductsForSelect() {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

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
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

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

export async function updateVariant(id: string, data: any) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

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
