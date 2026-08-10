'use server'

// src/server/actions/admin/user.actions.ts
// Gestión de Clientes, Usuarios Staff y Roles del panel administrativo.
// Exclusivo del Administrador General (permiso `users:manage`).
// La BD de producción no tiene tablas Role/Permission: los roles son un string
// en `users.role` ("customer" | "admin" | "vendor") y la matriz de permisos se
// define en código en `src/server/auth/roles.ts`.

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db/client'
import {
  requirePermission,
  isForbiddenError,
  forbiddenResponse,
} from '@/server/middleware/auth.middleware'
import { PERMISSIONS } from '@/server/auth/roles'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

const USER_STATUSES = ['active', 'inactive', 'banned'] as const
const STAFF_ROLES = ['admin', 'vendor'] as const

const StaffCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().trim().max(30).optional().nullable(),
  password: z.string().min(8).max(255),
  role: z.enum(STAFF_ROLES),
})

const StaffUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(30).optional().nullable(),
  role: z.enum(STAFF_ROLES),
  status: z.enum(USER_STATUSES),
})

// =============================================================================
// CLIENTES — listado con agregados (pedidos + total gastado)
// =============================================================================

export interface AdminCustomersParams {
  search?: string
  status?: string
  page?: number
  limit?: number
}

export async function getAdminCustomers(params?: AdminCustomersParams) {
  await requirePermission(PERMISSIONS.USER_MANAGE)

  const page = Math.max(1, params?.page ?? 1)
  const limit = Math.min(100, Math.max(1, params?.limit ?? 50))

  const where: Prisma.UserWhereInput = { role: 'customer', deletedAt: null }

  if (params?.status && params.status !== 'all' && (USER_STATUSES as readonly string[]).includes(params.status)) {
    where.status = params.status
  }

  if (params?.search?.trim()) {
    const s = params.search.trim()
    where.OR = [
      { email: { contains: s } },
      { firstName: { contains: s } },
      { lastName: { contains: s } },
      { phone: { contains: s } },
    ]
  }

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        orders: {
          where: { status: { not: 'cancelled' } },
          select: { totalInCents: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  const items = customers.map((c) => {
    const { orders, ...rest } = c
    return {
      ...rest,
      orderCount: orders.length,
      totalSpentInCents: orders.reduce((sum, o) => sum + o.totalInCents, 0),
    }
  })

  return { customers: items, total, page, limit }
}

// =============================================================================
// CLIENTE — detalle con direcciones, pedidos y conteos
// =============================================================================

export async function getAdminCustomer(id: string) {
  await requirePermission(PERMISSIONS.USER_MANAGE)

  const customer = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,
      role: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { favorites: true, reviews: true, carts: true } },
      addresses: {
        select: {
          id: true,
          label: true,
          address1: true,
          address2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          isDefault: true,
        },
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          displayId: true,
          status: true,
          paymentStatus: true,
          totalInCents: true,
          currency: true,
          createdAt: true,
        },
      },
    },
  })

  return customer
}

// =============================================================================
// ESTADO — bloquear / activar / desactivar un usuario
// =============================================================================

export async function setUserStatus(id: string, status: string) {
  const session = await requirePermission(PERMISSIONS.USER_MANAGE)

  if (!(USER_STATUSES as readonly string[]).includes(status)) {
    return { success: false, error: 'Estado no válido' }
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    })

    if (!target) {
      return { success: false, error: 'Usuario no encontrado', status: 404 as const }
    }
    if (target.id === session.user.id) {
      return forbiddenResponse('No puedes modificar tu propia cuenta')
    }
    if (target.role === 'admin') {
      return forbiddenResponse('No se puede bloquear a otro administrador')
    }

    await prisma.user.update({ where: { id }, data: { status } })

    revalidatePath('/admin/clientes')
    revalidatePath(`/admin/clientes/${id}`)
    revalidatePath('/admin/usuarios')
    revalidatePath(`/admin/usuarios/${id}`)
    return { success: true }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error al actualizar estado de usuario:', error)
    return { success: false, error: error.message || 'Error al actualizar el estado' }
  }
}

// =============================================================================
// STAFF — listado, detalle, creación y edición
// =============================================================================

export async function getAdminStaff() {
  await requirePermission(PERMISSIONS.USER_MANAGE)

  const staff = await prisma.user.findMany({
    where: { role: { in: ['admin', 'vendor'] }, deletedAt: null },
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      vendor: { select: { id: true, storeName: true, slug: true, status: true } },
    },
  })

  return { staff }
}

export async function getAdminUserById(id: string) {
  await requirePermission(PERMISSIONS.USER_MANAGE)

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      vendor: { select: { id: true, storeName: true, slug: true, status: true } },
    },
  })

  return user
}

export async function createStaffUser(data: z.infer<typeof StaffCreateSchema>) {
  await requirePermission(PERMISSIONS.USER_MANAGE)

  const parsed = StaffCreateSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Datos inválidos: ' + parsed.error.errors.map((e) => e.message).join(', '),
    }
  }

  try {
    const email = parsed.data.email.toLowerCase().trim()
    const phone = parsed.data.phone?.trim() || null

    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existingByEmail) {
      return { success: false, error: 'El email ya está en uso' }
    }

    if (phone) {
      const existingByPhone = await prisma.user.findFirst({
        where: { phone },
        select: { id: true },
      })
      if (existingByPhone) {
        return { success: false, error: 'El teléfono ya está en uso' }
      }
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(parsed.data.password, salt)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone,
        role: parsed.data.role,
        status: 'active',
      },
      select: { id: true, email: true, role: true },
    })

    revalidatePath('/admin/usuarios')
    return { success: true, user }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error al crear usuario staff:', error)
    return { success: false, error: error.message || 'Error al crear el usuario' }
  }
}

export async function updateStaffUser(id: string, data: z.infer<typeof StaffUpdateSchema>) {
  const session = await requirePermission(PERMISSIONS.USER_MANAGE)

  const parsed = StaffUpdateSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Datos inválidos: ' + parsed.error.errors.map((e) => e.message).join(', '),
    }
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    })
    if (!target) {
      return { success: false, error: 'Usuario no encontrado', status: 404 as const }
    }

    // El admin no puede cambiarse a sí mismo (rol o estado).
    if (target.id === session.user.id) {
      if (parsed.data.role !== 'admin' || parsed.data.status !== 'active') {
        return forbiddenResponse('No puedes modificar tu propio rol o estado')
      }
    }

    // Evitar quedarse sin administradores activos al degradar/banear un admin.
    if (target.role === 'admin' && (parsed.data.role !== 'admin' || parsed.data.status !== 'active')) {
      const adminCount = await prisma.user.count({
        where: { role: 'admin', status: 'active', deletedAt: null },
      })
      if (adminCount <= 1) {
        return {
          success: false,
          error: 'No se puede modificar: es la única cuenta administradora activa',
        }
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone?.trim() || null,
        role: parsed.data.role,
        status: parsed.data.status,
      },
      select: { id: true, email: true, role: true, status: true },
    })

    revalidatePath('/admin/usuarios')
    revalidatePath(`/admin/usuarios/${id}`)
    revalidatePath('/admin/clientes')
    revalidatePath('/admin/roles')
    return { success: true, user }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error al actualizar usuario staff:', error)
    return { success: false, error: error.message || 'Error al actualizar el usuario' }
  }
}

// =============================================================================
// CONTRASEÑA — resetear (solo otros usuarios, nunca la propia)
// =============================================================================

export async function resetStaffPassword(id: string, password: string) {
  const session = await requirePermission(PERMISSIONS.USER_MANAGE)

  if (!password || password.length < 8) {
    return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' }
  }

  try {
    const target = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!target) {
      return { success: false, error: 'Usuario no encontrado', status: 404 as const }
    }
    if (target.id === session.user.id) {
      return forbiddenResponse('No puedes resetear la contraseña de tu propia cuenta')
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)
    await prisma.user.update({ where: { id }, data: { passwordHash } })

    revalidatePath(`/admin/usuarios/${id}`)
    return { success: true }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error al resetear contraseña:', error)
    return { success: false, error: error.message || 'Error al resetear la contraseña' }
  }
}

// =============================================================================
// ROL — cambio rápido de rol (solo admin, con salvaguardas)
// =============================================================================

export async function setUserRole(id: string, role: string) {
  const session = await requirePermission(PERMISSIONS.USER_MANAGE)

  if (!['customer', 'admin', 'vendor'].includes(role)) {
    return { success: false, error: 'Rol no válido' }
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    })
    if (!target) {
      return { success: false, error: 'Usuario no encontrado', status: 404 as const }
    }
    if (target.id === session.user.id && role !== 'admin') {
      return forbiddenResponse('No puedes cambiar tu propio rol')
    }

    if (target.role === 'admin' && role !== 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin', status: 'active', deletedAt: null },
      })
      if (adminCount <= 1) {
        return {
          success: false,
          error: 'No se puede quitar el rol admin: es la única cuenta administradora activa',
        }
      }
    }

    await prisma.user.update({ where: { id }, data: { role } })

    revalidatePath('/admin/usuarios')
    revalidatePath('/admin/clientes')
    revalidatePath('/admin/roles')
    return { success: true }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error al cambiar el rol:', error)
    return { success: false, error: error.message || 'Error al cambiar el rol' }
  }
}

// =============================================================================
// ROLES — resumen derivado de la BD (conteos por rol) + staff para editar rol
// =============================================================================

export async function getRolesSummary() {
  await requirePermission(PERMISSIONS.USER_MANAGE)

  const grouped = await prisma.user.groupBy({
    by: ['role'],
    _count: { _all: true },
  })

  const counts: Record<string, number> = {}
  for (const g of grouped) {
    counts[g.role] = g._count._all
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: ['admin', 'vendor'] }, deletedAt: null },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      lastLoginAt: true,
    },
  })

  return { counts, staff }
}
