'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db/client'
import { auth } from '@/lib/auth'

export async function getAdminOrders() {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: { email: true, firstName: true, lastName: true }
      },
      lineItems: true
    }
  })

  return orders
}

export async function getAdminOrderById(id: string) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, phone: true }
      },
      lineItems: {
        include: {
          product: {
            select: { slug: true }
          }
        }
      }
    }
  })

  return order
}

export async function updateOrderStatus(
  id: string, 
  data: { 
    status: string; 
    trackingNumber?: string; 
    shippingCarrier?: string; 
    trackingUrl?: string 
  }
) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  try {
    const updatePayload: any = {
      status: data.status,
    }

    if (data.trackingNumber) updatePayload.trackingNumber = data.trackingNumber
    if (data.shippingCarrier) updatePayload.shippingCarrier = data.shippingCarrier
    if (data.trackingUrl) updatePayload.trackingUrl = data.trackingUrl

    if (data.status === 'shipped' && !updatePayload.shippedAt) {
      updatePayload.shippedAt = new Date()
    } else if (data.status === 'delivered' && !updatePayload.deliveredAt) {
      updatePayload.deliveredAt = new Date()
    } else if (data.status === 'cancelled' && !updatePayload.cancelledAt) {
      updatePayload.cancelledAt = new Date()
    }

    const order = await prisma.order.update({
      where: { id },
      data: updatePayload
    })

    revalidatePath(`/admin/pedidos/${id}`)
    revalidatePath('/admin/pedidos')
    return { success: true, order }
  } catch (error: any) {
    console.error('Error updating order status:', error)
    return { success: false, error: error.message || 'Error al actualizar el estado del pedido' }
  }
}
