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
 * Si no tiene, la crea con el nombre de perfil del usuario. Idempotente.
 */
export async function ensureUserVendor(userId: string, userName?: string) {
  const existing = await getUserVendor(userId)
  if (existing) return existing

  const baseName = (userName ?? '').trim() || 'Nueva marca'
  const base = slugify(baseName) || 'tienda'
  const slug = `${base}-${userId.slice(0, 8)}`

  return prisma.vendor.create({
    data: {
      userId,
      storeName: baseName,
      slug,
      shortDescription: 'Tienda de café',
      country: 'CO',
      city: 'Bogotá',
      status: 'active',
    },
    select: { id: true, storeName: true, slug: true, status: true },
  })
}
