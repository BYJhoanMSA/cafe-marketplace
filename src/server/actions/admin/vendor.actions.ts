'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db/client'
import { auth } from '@/lib/auth'

export async function getAdminVendors() {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  const vendors = await prisma.vendor.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: { email: true, firstName: true, lastName: true }
      }
    }
  })

  return vendors
}

export async function createVendor(data: any) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    throw new Error('Solo los administradores pueden crear marcas')
  }

  try {
    const existing = await prisma.vendor.findUnique({
      where: { slug: data.slug }
    })
    
    if (existing) {
      return { success: false, error: 'El slug ya está en uso' }
    }

    // Por MVP asociamos el Vendor al usuario admin que lo crea
    // En producción habría un selector de usuarios o se crearía una invitación
    const vendor = await prisma.vendor.create({
      data: {
        userId: session.user.id,
        storeName: data.storeName,
        slug: data.slug,
        shortDescription: data.shortDescription,
        country: data.country,
        city: data.city,
        instagram: data.instagram,
        website: data.website,
        status: data.status || 'active',
      }
    })

    revalidatePath('/admin/marcas')
    return { success: true, vendor }
  } catch (error: any) {
    console.error('Error creating vendor:', error)
    return { success: false, error: error.message || 'Error al crear marca' }
  }
}

export async function updateVendor(id: string, data: any) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  try {
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
        status: data.status,
      }
    })

    revalidatePath('/admin/marcas')
    return { success: true, vendor }
  } catch (error: any) {
    console.error('Error updating vendor:', error)
    return { success: false, error: error.message || 'Error al actualizar marca' }
  }
}
