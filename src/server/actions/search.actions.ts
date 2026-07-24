'use server'

import { prisma } from '@/server/db/client'
import type { Prisma } from '@prisma/client'

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    origin: { select: { country: true; region: true } }
    vendor: { select: { storeName: true } }
    category: { select: { name: true } }
    variants: { where: { status: string }; orderBy: { priceInCents: 'asc' } }
    images: { where: { mediaType: string }; orderBy: { position: 'asc' }; take: number }
    flavorNotes: { select: { note: true } }
  }
}>

export async function searchProducts(query: string) {
  try {
    const trimmed = query.trim()
    if (!trimmed) return []

    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        OR: [
          { title: { search: trimmed } },
          { description: { search: trimmed } },
          { farmName: { search: trimmed } },
          { producerName: { search: trimmed } },
          { origin: { country: { contains: trimmed } } },
          { origin: { region: { contains: trimmed } } },
          { vendor: { storeName: { contains: trimmed } } },
          { flavorNotes: { some: { note: { contains: trimmed } } } },
          { title: { contains: trimmed } },
          { description: { contains: trimmed } },
          { farmName: { contains: trimmed } },
          { producerName: { contains: trimmed } },
        ],
        variants: {
          some: {
            status: 'active',
          }
        }
      },
      include: {
        origin: { select: { country: true, region: true } },
        vendor: { select: { storeName: true } },
        category: { select: { name: true } },
        variants: {
          where: { status: 'active' },
          orderBy: { priceInCents: 'asc' }
        },
        images: {
          where: { mediaType: 'image' },
          orderBy: { position: 'asc' },
          take: 1
        },
        flavorNotes: { select: { note: true } }
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    }) as unknown as ProductWithRelations[]

    return products.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      shortDescription: p.shortDescription,
      imageUrl: p.images[0]?.url || '/images/products/placeholder-1.jpg',
      imageAlt: p.images[0]?.alt || `${p.title} — bolsa de café`,
      origin: { country: p.origin.country, region: p.origin.region },
      vendor: { name: p.vendor.storeName },
      price: p.variants[0]?.priceInCents || 0,
      comparePrice: p.variants[0]?.comparePriceInCents || null,
      currency: p.variants[0]?.currency || 'USD',
      roastLevel: p.roastLevel,
      cuppingScore: p.cuppingScore ? Number(p.cuppingScore) : null,
      avgRating: Number(p.avgRating),
      reviewCount: p.reviewCount,
      flavorNotes: p.flavorNotes.map(fn => fn.note),
      isNew: p.isNew,
      isLimited: p.isLimited,
      isOrganic: p.isOrganic,
      category: p.category?.name || null,
    }))
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}
