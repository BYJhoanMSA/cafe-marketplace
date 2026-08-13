'use server'

import { prisma } from '@/server/db/client'
import { productCardInclude, mapToProductCard } from '@/server/db/queries'
import { withCache } from '@/server/cache/node-cache'
import type { Prisma } from '@prisma/client'

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productCardInclude
}>

export async function searchProducts(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return []

  return withCache(`search:${trimmed.toLowerCase()}`, async () => {
    try {

    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        OR: [
          { title: { search: trimmed } },
          { description: { search: trimmed } },
          { shortDescription: { contains: trimmed } },
          { farmName: { search: trimmed } },
          { producerName: { search: trimmed } },
          { varietal: { contains: trimmed } },
          { altitudeMasl: { contains: trimmed } },
          { processingMethod: { contains: trimmed } },
          { roastLevel: { contains: trimmed } },
          { harvestDate: { contains: trimmed } },
          { origin: { country: { contains: trimmed } } },
          { origin: { region: { contains: trimmed } } },
          { origin: { subregion: { contains: trimmed } } },
          { vendor: { storeName: { contains: trimmed } } },
          { category: { name: { contains: trimmed } } },
          { flavorNotes: { some: { note: { contains: trimmed } } } },
        ],
        variants: {
          some: {
            status: 'active',
          }
        }
      },
      include: productCardInclude,
      take: 20,
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }]
    }) as unknown as ProductWithRelations[]

    return products.map(mapToProductCard)
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
  }, 300) // Cache 5 min
}
