// src/server/services/vendor.service.ts
// Servicio de marcas (vendors): resuelve y asegura el vendor de un usuario.

import { prisma } from '@/server/db/client'
import { slugify } from '@/lib/utils'

export async function getUserVendor(userId: string) {
  return prisma.vendor.findFirst({
    where: { userId, deletedAt: null },
    select: { id: true, storeName: true, slug: true, status: true },
  })
}

/**
 * Asegura que el usuario tenga una marca (vendor) para poder publicar productos.
 * Si no tiene, la crea con datos derivados de su perfil. Idempotente.
 */
export async function ensureUserVendor(
  userId: string,
  user?: { firstName?: string; lastName?: string }
) {
  const existing = await getUserVendor(userId)
  if (existing) return existing

  const baseName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
  const base = slugify(baseName || 'tienda') || 'tienda'
  const slug = `${base}-${userId.slice(0, 8)}`

  return prisma.vendor.create({
    data: {
      userId,
      storeName: baseName || 'Nueva marca',
      slug,
      shortDescription: 'Tienda de café',
      country: 'CO',
      city: 'Bogotá',
      status: 'active',
    },
    select: { id: true, storeName: true, slug: true, status: true },
  })
}
