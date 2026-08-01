'use server'

import { prisma } from '@/server/db/client'
import {
  requireRole,
  requirePermission,
  forbiddenResponse,
  isForbiddenError,
} from '@/server/middleware/auth.middleware'
import { PERMISSIONS } from '@/server/auth/roles'

export async function getDashboardStats() {
  const session = await requireRole(['admin', 'vendor'])

  try {
    const isAdmin = session.user.role === 'admin'
    const productWhere = isAdmin
      ? { deletedAt: null }
      : { deletedAt: null, createdById: session.user.id }

    const [activeProductsCount] = await Promise.all([
      prisma.product.count({ where: { ...productWhere, status: 'active' } }),
    ])

    // Métricas sensibles (ingresos, pedidos, usuarios) SOLO para el admin
    if (!isAdmin) {
      return {
        success: true,
        data: {
          activeProductsCount,
          totalRevenue: null,
          pendingOrdersCount: null,
          newUsersCount: null,
        },
      }
    }

    const [totalRevenueResult, pendingOrdersCount, newUsersCount] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalInCents: true },
        where: { paymentStatus: 'paid' }
      }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          role: 'customer'
        }
      }),
    ])

    return {
      success: true,
      data: {
        totalRevenue: totalRevenueResult._sum.totalInCents || 0,
        pendingOrdersCount,
        activeProductsCount,
        newUsersCount,
      },
    }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error fetching dashboard stats:', error)
    return { success: false, error: 'Failed to fetch stats' }
  }
}

export async function getRecentOrders() {
  // Pedidos: exclusivo del Administrador General por ahora
  await requirePermission(PERMISSIONS.ORDER_READ)

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
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error fetching recent orders:', error)
    return { success: false, error: 'Failed to fetch recent orders' }
  }
}
