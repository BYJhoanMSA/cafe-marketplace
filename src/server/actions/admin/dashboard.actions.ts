'use server'

import { prisma } from '@/server/db/client'
import { auth } from '@/lib/auth'

export async function getDashboardStats() {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  try {
    // Total de ingresos (asumimos estado 'paid')
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { totalInCents: true },
      where: { paymentStatus: 'paid' }
    })
    const totalRevenue = totalRevenueResult._sum.totalInCents || 0

    // Pedidos pendientes
    const pendingOrdersCount = await prisma.order.count({
      where: { status: 'pending' }
    })

    // Productos activos
    const activeProductsCount = await prisma.product.count({
      where: { status: 'active', deletedAt: null }
    })

    // Nuevos usuarios (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const newUsersCount = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        role: 'customer'
      }
    })

    return {
      success: true,
      data: {
        totalRevenue,
        pendingOrdersCount,
        activeProductsCount,
        newUsersCount
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { success: false, error: 'Failed to fetch stats' }
  }
}

export async function getRecentOrders() {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  try {
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        displayId: true,
        customerFirstName: true,
        customerLastName: true,
        totalInCents: true,
        status: true,
        createdAt: true,
      }
    })
    return { success: true, data: orders }
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return { success: false, error: 'Failed to fetch recent orders' }
  }
}
