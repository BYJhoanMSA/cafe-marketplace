'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db/client'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function getAdminProducts() {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      category: true,
      origin: true,
      vendor: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return products
}

export async function createProduct(data: any) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  try {
    const defaultVendor = await prisma.vendor.findFirst()
    const defaultCategory = await prisma.category.findFirst()

    if (!defaultVendor || !defaultCategory) {
      return { success: false, error: 'Faltan datos base (Vendor, Category) en la DB.' }
    }

    // Gestionar Origen por Región
    let originId = data.originId
    if (!originId && data.regionName) {
      const regionSlug = slugify(`colombia-${data.regionName}`)
      const origin = await prisma.origin.upsert({
        where: { slug: regionSlug },
        update: { region: data.regionName },
        create: {
          country: 'Colombia',
          countryCode: 'CO',
          region: data.regionName,
          slug: regionSlug,
        }
      })
      originId = origin.id
    }

    if (!originId) {
      const defaultOrigin = await prisma.origin.findFirst()
      originId = defaultOrigin?.id
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        status: data.status || 'draft',
        roastLevel: data.roastLevel || 'medium',
        processingMethod: data.processingMethod || 'washed',
        farmName: data.farmName || null,
        producerName: data.producerName || null,
        altitudeMasl: data.altitudeMasl || null,
        varietal: data.varietal || null,
        cuppingScore: data.cuppingScore ? parseFloat(data.cuppingScore) : null,
        isFeatured: data.isFeatured ?? false,
        isNew: data.isNew ?? false,
        isLimited: data.isLimited ?? false,
        isOrganic: data.isOrganic ?? false,
        isPublicity: data.isPublicity ?? false,
        vendorId: data.vendorId || defaultVendor.id,
        categoryId: data.categoryId || defaultCategory.id,
        originId: originId,
        flavorNotes: {
          create: (data.flavorNotes || []).map((note: string) => ({ note }))
        },
        // Guardar imágenes si vienen con el formulario
        ...(data.images && data.images.length > 0 ? {
          images: {
            create: data.images.map((img: any, i: number) => ({
              url: img.url,
              alt: img.alt || data.title,
              position: i,
              width: img.width || null,
              height: img.height || null,
              type: 'product',
            }))
          }
        } : {})
      }
    })

    revalidatePath('/admin/productos')
    revalidatePath('/catalogo')
    revalidatePath('/')
    return { success: true, product }
  } catch (error: any) {
    console.error('Error creating product:', error)
    return { success: false, error: error.message || 'Error al crear producto' }
  }
}

export async function updateProduct(id: string, data: any) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  try {
    let originId = data.originId
    if (data.regionName) {
      const regionSlug = slugify(`colombia-${data.regionName}`)
      const origin = await prisma.origin.upsert({
        where: { slug: regionSlug },
        update: { region: data.regionName },
        create: {
          country: 'Colombia',
          countryCode: 'CO',
          region: data.regionName,
          slug: regionSlug,
        }
      })
      originId = origin.id
    }

    // Actualizar imágenes si vienen en la petición
    if (data.images !== undefined) {
      // Eliminar imágenes anteriores y reemplazar
      await prisma.productImage.deleteMany({ where: { productId: id } })
      if (data.images.length > 0) {
        await prisma.productImage.createMany({
          data: data.images.map((img: any, i: number) => ({
            productId: id,
            url: img.url,
            alt: img.alt || '',
            position: i,
            width: img.width || null,
            height: img.height || null,
            type: 'product',
          }))
        })
      }
    }

    // Actualizar notas de sabor
    if (data.flavorNotes !== undefined) {
      await prisma.productFlavorNote.deleteMany({ where: { productId: id } })
      if (data.flavorNotes.length > 0) {
        await prisma.productFlavorNote.createMany({
          data: data.flavorNotes.map((note: string) => ({ productId: id, note }))
        })
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        status: data.status,
        roastLevel: data.roastLevel,
        processingMethod: data.processingMethod,
        farmName: data.farmName || null,
        producerName: data.producerName || null,
        altitudeMasl: data.altitudeMasl || null,
        varietal: data.varietal || null,
        cuppingScore: data.cuppingScore ? parseFloat(data.cuppingScore) : null,
        isFeatured: data.isFeatured ?? false,
        isNew: data.isNew ?? false,
        isLimited: data.isLimited ?? false,
        isOrganic: data.isOrganic ?? false,
        isPublicity: data.isPublicity ?? false,
        vendorId: data.vendorId,
        categoryId: data.categoryId,
        ...(originId ? { originId } : {}),
      }
    })

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${id}`)
    revalidatePath('/catalogo')
    revalidatePath('/')
    return { success: true, product }
  } catch (error: any) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message || 'Error al actualizar producto' }
  }
}

export async function archiveProduct(id: string) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { status: 'archived' }
    })
    
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Error al archivar el producto' }
  }
}
