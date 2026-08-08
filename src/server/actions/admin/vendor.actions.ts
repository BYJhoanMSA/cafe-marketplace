'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db/client'
import {
  requireRole,
  requirePermission,
  isForbiddenError,
  forbiddenResponse,
} from '@/server/middleware/auth.middleware'
import { PERMISSIONS, canAccessVendor } from '@/server/auth/roles'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

const VendorSchema = z.object({
  storeName: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  shortDescription: z.string().max(500).nullable().optional(),
  country: z.string().max(2).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  instagram: z.string().max(100).nullable().optional(),
  website: z.string().max(255).nullable().optional(),
  status: z.string().max(20).default('active'),
})

// =============================================================================
// GET /admin/marcas — listado respetando permisos
// =============================================================================

export async function getAdminVendors(page = 1, limit = 50) {
  const session = await requireRole(['admin', 'vendor'])

  const where: Prisma.VendorWhereInput = { deletedAt: null }
  if (session.user.role !== 'admin') {
    // Usuario normal: solo su propia marca
    where.userId = session.user.id
  }

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    }),
    prisma.vendor.count({ where })
  ])

  return { vendors, total, page, limit }
}

export async function getAdminVendorById(id: string) {
  const session = await requireRole(['admin', 'vendor'])

  const vendor = await prisma.vendor.findUnique({ where: { id } })

  if (!vendor) {
    return { success: false, error: 'Marca no encontrada', status: 404 as const }
  }

  if (!canAccessVendor(session.user, vendor.userId)) {
    return forbiddenResponse()
  }

  return { success: true, vendor }
}

// =============================================================================
// POST /admin/marcas — crear marca (solo admin)
// =============================================================================

export async function createVendor(data: z.infer<typeof VendorSchema>) {
  const session = await requirePermission(PERMISSIONS.VENDOR_CREATE)

  const parsed = VendorSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos: ' + parsed.error.errors.map(e => e.message).join(', ') }
  }

  try {
    const existing = await prisma.vendor.findUnique({
      where: { slug: parsed.data.slug }
    })

    if (existing) {
      return { success: false, error: 'El slug ya está en uso' }
    }

    const vendor = await prisma.vendor.create({
      data: {
        userId: session.user.id,
        storeName: parsed.data.storeName,
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription,
        country: parsed.data.country,
        city: parsed.data.city,
        instagram: parsed.data.instagram,
        website: parsed.data.website,
        status: parsed.data.status || 'active',
      }
    })

    revalidatePath('/admin/marcas')
    return { success: true, vendor }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error creating vendor:', error)
    return { success: false, error: error.message || 'Error al crear marca' }
  }
}

// =============================================================================
// PATCH /admin/marcas/:id — actualizar (propietario o admin)
// =============================================================================

export async function updateVendor(id: string, data: z.infer<typeof VendorSchema>) {
  const session = await requirePermission(PERMISSIONS.VENDOR_UPDATE_OWN)

  try {
    const existing = await prisma.vendor.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    })

    if (!existing) {
      return { success: false, error: 'Marca no encontrada', status: 404 as const }
    }

    if (!canAccessVendor(session.user, existing.userId)) {
      return forbiddenResponse()
    }

    const isAdmin = session.user.role === 'admin'

    // Solo el Administrador General puede aprobar/suspender marcas.
    // Un vendor NO puede autopromoverse a "active" (aprobación).
    const status = isAdmin ? data.status : existing.status

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        storeName: data.storeName,
        slug: data.slug,
        shortDescription: data.shortDescription,
        country: data.country,
        city: data.city,
        instagram: data.instagram,
        website: data.website,
        status,
      },
    })

    // Sincronizar el rol del usuario según el estado de su marca:
    // - active   → rol "vendor" (puede acceder a su panel)
    // - pending/suspended → rol "customer" (sin acceso al panel)
    if (isAdmin && data.status && data.status !== existing.status) {
      const owner = await prisma.user.findUnique({
        where: { id: existing.userId },
        select: { id: true, role: true },
      })

      if (owner) {
        if (data.status === 'active' && owner.role === 'customer') {
          await prisma.user.update({
            where: { id: owner.id },
            data: { role: 'vendor' },
          })
        } else if (data.status !== 'active' && owner.role === 'vendor') {
          await prisma.user.update({
            where: { id: owner.id },
            data: { role: 'customer' },
          })
        }
      }
    }

    revalidatePath('/admin/marcas')
    return { success: true, vendor }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error updating vendor:', error)
    return { success: false, error: error.message || 'Error al actualizar marca' }
  }
}
