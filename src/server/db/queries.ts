import type { Prisma } from '@prisma/client'

export const productCardInclude = {
  origin: { select: { country: true, region: true } },
  vendor: { select: { storeName: true } },
  category: { select: { name: true } },
  variants: {
    where: { status: 'active' },
    orderBy: { priceInCents: 'asc' as const }
  },
  images: {
    where: { mediaType: 'image' },
    orderBy: { position: 'asc' as const },
  },
  flavorNotes: { select: { note: true } }
} satisfies Prisma.ProductInclude

type ProductCardRaw = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>

export interface ProductCard {
  id: string
  slug: string
  title: string
  shortDescription: string | null
  imageUrl: string
  imageAlt: string
  images: string[]
  origin: { country: string; region: string | null }
  vendor: { name: string }
  price: number
  comparePrice: number | null
  currency: string
  roastLevel: string
  cuppingScore: number | null
  avgRating: number
  reviewCount: number
  flavorNotes: string[]
  isNew: boolean
  isLimited: boolean
  isOrganic: boolean
  category: string | null
}

export function mapToProductCard(p: ProductCardRaw): ProductCard {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    imageUrl: p.images[0]?.url || '/images/products/placeholder-1.jpg',
    imageAlt: p.images[0]?.alt || `${p.title} — bolsa de café`,
    images: p.images.map(img => img.url),
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
  }
}