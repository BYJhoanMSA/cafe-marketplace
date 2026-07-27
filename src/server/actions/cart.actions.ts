'use server'

import { prisma } from '@/server/db/client'

export async function checkProductsExist(productIds: string[]): Promise<Set<string>> {
  if (productIds.length === 0) return new Set()

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, deletedAt: null },
    select: { id: true },
  })

  return new Set(products.map(p => p.id))
}
