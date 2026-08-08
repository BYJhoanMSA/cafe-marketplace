'use server'

import { prisma } from '@/server/db/client'
import { productCardInclude, mapToProductCard, type ProductCard } from '@/server/db/queries'
import { getGrindTypes, getVariantSizes } from './settings.actions'
import { withCache, invalidateCacheByPrefix, invalidateCache } from '@/server/cache/node-cache'
import type { GrindTypeOption } from './settings.actions'
import type { Prisma } from '@prisma/client'

export interface CatalogFilters {
  origin?: string
  altitude?: string
  flavorNote?: string
  process?: string
}

export interface ProductSizeOption {
  value: string
  label: string
  weightGrams: number | null
  price: number
  available: boolean
}

export interface ProductGrindOption {
  id: string
  label: string
  available: boolean
}

export interface ProductVariant {
  id: string
  weightGrams: number | null
  grindType: string | null
  price: number
  inStock: boolean
}

export interface ProductDetail {
  id: string
  slug: string
  title: string
  vendor: { name: string; slug: string }
  price: number
  comparePrice: number | null
  currency: string
  description: string
  cuppingScore: number | null
  roastLevel: string
  origin: { country: string; region: string; farm: string }
  process: string
  variety: string
  elevation: string
  flavorNotes: string[]
  images: string[]
  category: string
  sizeOptions: ProductSizeOption[]
  variants: ProductVariant[]
  grindOptions: ProductGrindOption[]
  rating: number
  reviewCount: number
  favoritesCount: number
  sharesCount: number
}

function parseAltitudeRange(filterRange: string): { min: number; max: number } | null {
  if (filterRange.endsWith('+')) {
    const min = parseInt(filterRange.replace('+', ''), 10)
    return isNaN(min) ? null : { min, max: Infinity }
  }
  const sep = filterRange.indexOf('-')
  if (sep === -1) return null
  const min = parseInt(filterRange.slice(0, sep), 10)
  const max = parseInt(filterRange.slice(sep + 1), 10)
  return isNaN(min) || isNaN(max) ? null : { min, max }
}

function getAltitudeNumbers(masl: string): number[] {
  return (masl.match(/\d+/g) || []).map(Number)
}

function altitudeMatchesFilter(altitudeMasl: string | null, filterRange: string): boolean {
  const range = parseAltitudeRange(filterRange)
  if (!range) return false

  if (range.min === 0 && range.max !== Infinity) {
    if (!altitudeMasl) return true
    const values = getAltitudeNumbers(altitudeMasl)
    if (values.length === 0) return true
    return values.some(v => v >= range.min && v <= range.max)
  }

  if (!altitudeMasl) return false
  const values = getAltitudeNumbers(altitudeMasl)
  if (values.length === 0) return false
  return values.some(v => v >= range.min && v <= range.max)
}

export async function getActiveProducts(filters?: CatalogFilters, options?: { take?: number; skip?: number }) {
  const cacheKey = filters
    ? `products:${filters.origin ?? ''}:${filters.altitude ?? ''}:${filters.flavorNote ?? ''}:${filters.process ?? ''}`
    : 'products:all'

  return withCache(cacheKey, async () => {
    try {
      const take = options?.take ?? 50
      const skip = options?.skip ?? 0
      const where: Prisma.ProductWhereInput = {
        status: 'active',
        deletedAt: null,
        variants: {
          some: { status: 'active' }
        }
      }

      if (filters?.origin) {
        where.origin = { slug: filters.origin }
      }

      if (filters?.flavorNote) {
        where.flavorNotes = { some: { note: { equals: filters.flavorNote } } }
      }

      if (filters?.process) {
        where.processingMethod = filters.process
      }

      let products = await prisma.product.findMany({
        where,
        include: productCardInclude,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      })

      if (filters?.altitude) {
        products = products.filter(p => altitudeMatchesFilter(p.altitudeMasl, filters.altitude!))
      }

      return products.map(mapToProductCard)
    } catch (error) {
      console.error('Error fetching active products:', error)
      return []
    }
  }, 300)
}

export async function invalidateProductsCache() {
  invalidateCacheByPrefix('products:')
}

export async function invalidateProductCache(slug: string) {
  invalidateCache(`product:${slug}`)
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return withCache(`product:${slug}`, async () => {
    try {
      const [p, grindTypes, variantSizes] = await Promise.all([
        prisma.product.findFirst({
          where: {
            slug,
            status: 'active',
            deletedAt: null,
          },
          include: {
            origin: true,
            vendor: { select: { storeName: true, slug: true } },
            category: { select: { name: true } },
            variants: {
              where: { status: 'active' },
              orderBy: { position: 'asc' }
            },
            images: {
              where: { mediaType: 'image' },
              orderBy: { position: 'asc' }
            },
            flavorNotes: { select: { note: true } }
          }
        }),
        getGrindTypes().catch(() => [] as GrindTypeOption[]),
        getVariantSizes().catch(() => [])
      ])

      if (!p || p.variants.length === 0) return null

      const lowestPriceVariant = [...p.variants].sort((a, b) => a.priceInCents - b.priceInCents)[0] as (typeof p.variants)[number]

      // Todas las versiones de tamaño y molienda (catálogo de settings),
      // marcando disponibilidad real en las variantes del producto.
      const availableWeights = new Set(p.variants.map(v => v.weightGrams))
      const availableGrinds = new Set(p.variants.map(v => v.grindType).filter(Boolean))

      const seenWeights = new Set<number | null>()
      const sizeOptions: ProductSizeOption[] = []
      for (const s of variantSizes) {
        const weight = s.grams
        seenWeights.add(weight)
        const v = p.variants.find(vv => vv.weightGrams === weight)
        sizeOptions.push({
          value: String(weight),
          label: s.label,
          weightGrams: weight,
          price: v?.priceInCents ?? lowestPriceVariant.priceInCents,
          available: availableWeights.has(weight),
        })
      }
      // Pesos presentes en el producto que no están en el catálogo de settings
      for (const v of p.variants) {
        const key = v.weightGrams ?? 0
        if (seenWeights.has(key)) continue
        seenWeights.add(key)
        sizeOptions.push({
          value: String(key),
          label: v.title.split(' - ')[0] || `${v.weightGrams}g`,
          weightGrams: v.weightGrams,
          price: v.priceInCents,
          available: true,
        })
      }

      const grindOptions: ProductGrindOption[] = grindTypes.map(g => ({
        id: g.value,
        label: g.label,
        available: availableGrinds.has(g.value),
      }))
      // Moliendas presentes en el producto que no están en el catálogo de settings
      for (const v of p.variants) {
        if (v.grindType && !grindTypes.some(g => g.value === v.grindType)) {
          grindOptions.push({ id: v.grindType, label: v.grindType, available: true })
        }
      }

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        vendor: { name: p.vendor.storeName, slug: p.vendor.slug },
        price: lowestPriceVariant.priceInCents,
        comparePrice: lowestPriceVariant.comparePriceInCents || null,
        currency: lowestPriceVariant.currency,
        description: p.description,
        cuppingScore: p.cuppingScore ? Number(p.cuppingScore) : null,
        roastLevel: p.roastLevel,
        origin: {
          country: p.origin.country,
          region: p.origin.region || '',
          farm: p.farmName || ''
        },
        process: p.processingMethod,
        variety: p.varietal || '',
        elevation: p.altitudeMasl || '',
        flavorNotes: p.flavorNotes.map(fn => fn.note),
        images: p.images.map(img => img.url),
        category: p.category?.name || '',
        sizeOptions,
        variants: p.variants.map(v => ({
          id: v.id,
          weightGrams: v.weightGrams,
          grindType: v.grindType,
          price: v.priceInCents,
          inStock: true,
        })),
        grindOptions,
        rating: Number(p.avgRating),
        reviewCount: p.reviewCount,
        favoritesCount: p.favoritesCount,
        sharesCount: p.sharesCount,
      }
    } catch (error) {
      console.error('Error fetching product by slug:', error)
      return null
    }
  }, 600)
}

export async function getHomepageOrigins() {
  return withCache('homepage:origins', async () => {
    try {
    const origins = await prisma.origin.findMany({
      where: {
        products: {
          some: {
            status: 'active',
            deletedAt: null,
            isPublicity: true,
            variants: { some: { status: 'active' } },
          }
        }
      },
      select: {
        region: true,
        country: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: {
                status: 'active',
                deletedAt: null,
                variants: { some: { status: 'active' } },
              }
            }
          }
        },
        products: {
          where: {
            status: 'active',
            deletedAt: null,
            isPublicity: true,
            variants: { some: { status: 'active' } },
          },
          select: {
            images: {
              where: { mediaType: 'image' },
              orderBy: { position: 'asc' },
              take: 1,
              select: { url: true },
            }
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }
      },
      orderBy: { region: 'asc' },
      take: 4,
    })

    return origins.map(o => ({
      label: o.region || o.country,
      slug: o.slug,
      count: o._count.products,
      images: o.products.flatMap(p => p.images.map(img => img.url).filter((u): u is string => !!u)),
    }))
  } catch (error) {
    console.error('Error fetching homepage origins:', error)
    return []
  }
  }, 600) // Cache 10 min
}

export async function getAvailableCatalogFilters() {
  return withCache('catalog:filters', async () => {
    try {
    // 1. Obtener orígenes y notas de sabor en paralelo
    const [origins, flavorNotes] = await Promise.all([
      prisma.origin.findMany({
        where: {
          products: {
            some: {
              status: 'active',
              deletedAt: null,
                variants: {
                  some: {
                    status: 'active',
                  }
                }
            }
          }
        },
        select: {
          id: true,
          region: true,
          country: true,
          slug: true
        },
        orderBy: {
          region: 'asc'
        }
      }),
      prisma.productFlavorNote.findMany({
        where: {
          product: {
            status: 'active',
            deletedAt: null,
          }
        },
        select: {
          note: true
        },
        distinct: ['note']
      })
    ])

    return {
      success: true,
      origins: origins.map(o => ({ label: o.region || o.country, value: o.slug })),
      flavorNotes: flavorNotes.map(f => f.note)
    }
  } catch (error) {
    console.error('Error fetching catalog filters:', error)
    return {
      success: false,
      origins: [
        { label: 'Huila', value: 'huila' },
        { label: 'Nariño', value: 'narino' },
        { label: 'Tolima', value: 'tolima' },
        { label: 'Quindío', value: 'quindio' }
      ],
      flavorNotes: ['Frutal', 'Chocolatoso', 'Floral', 'Cítrico', 'Caramelo']
    }
  }
  }, 600) // Cache 10 min
}

// =============================================================================
// Tostaderías / Marcas públicas
// =============================================================================

export interface PublicVendor {
  id: string
  storeName: string
  slug: string
  shortDescription: string | null
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
  city: string | null
  country: string | null
  website: string | null
  instagram: string | null
  certifications: string | null
  avgRating: number
  reviewCount: number
  totalSold: number
  productCount: number
}

const vendorPublicSelect = {
  id: true,
  storeName: true,
  slug: true,
  shortDescription: true,
  description: true,
  logoUrl: true,
  bannerUrl: true,
  city: true,
  country: true,
  website: true,
  instagram: true,
  certifications: true,
  avgRating: true,
  reviewCount: true,
  totalSold: true,
} as const

function mapPublicVendor(v: {
  id: string
  storeName: string
  slug: string
  shortDescription: string | null
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
  city: string | null
  country: string | null
  website: string | null
  instagram: string | null
  certifications: string | null
  avgRating: unknown
  reviewCount: number
  totalSold: number
  _count: { products: number }
}): PublicVendor {
  return {
    id: v.id,
    storeName: v.storeName,
    slug: v.slug,
    shortDescription: v.shortDescription,
    description: v.description,
    logoUrl: v.logoUrl,
    bannerUrl: v.bannerUrl,
    city: v.city,
    country: v.country,
    website: v.website,
    instagram: v.instagram,
    certifications: v.certifications,
    avgRating: Number(v.avgRating),
    reviewCount: v.reviewCount,
    totalSold: v.totalSold,
    productCount: v._count.products,
  }
}

export async function getPublicVendors(): Promise<PublicVendor[]> {
  return withCache('vendors:public', async () => {
    try {
      const vendors = await prisma.vendor.findMany({
        where: {
          status: 'active',
          products: {
            some: {
              status: 'active',
              deletedAt: null,
              variants: { some: { status: 'active' } },
            },
          },
        },
        select: {
          ...vendorPublicSelect,
          _count: {
            select: {
              products: {
                where: {
                  status: 'active',
                  deletedAt: null,
                  variants: { some: { status: 'active' } },
                },
              },
            },
          },
        },
        orderBy: { storeName: 'asc' },
      })
      return vendors.map(mapPublicVendor)
    } catch (error) {
      console.error('Error fetching public vendors:', error)
      return []
    }
  }, 600)
}

export async function getPublicVendorBySlug(slug: string): Promise<(PublicVendor & { products: ProductCard[] }) | null> {
  return withCache(`vendor:${slug}`, async () => {
    try {
      const vendor = await prisma.vendor.findFirst({
        where: { slug, status: 'active' },
        select: {
          ...vendorPublicSelect,
          _count: {
            select: {
              products: {
                where: {
                  status: 'active',
                  deletedAt: null,
                  variants: { some: { status: 'active' } },
                },
              },
            },
          },
          products: {
            where: {
              status: 'active',
              deletedAt: null,
              variants: { some: { status: 'active' } },
            },
            include: productCardInclude,
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!vendor) return null

      return {
        ...mapPublicVendor(vendor),
        products: vendor.products.map(mapToProductCard),
      }
    } catch (error) {
      console.error('Error fetching public vendor by slug:', error)
      return null
    }
  }, 600)
}

// =============================================================================
// Detalle de un origen (región cafetera) con sus cafés activos
// =============================================================================

export interface OriginDetail {
  id: string
  slug: string
  country: string
  region: string | null
  subregion: string | null
  description: string | null
  imageUrl: string | null
  products: ProductCard[]
}

export async function getOriginBySlug(slug: string): Promise<OriginDetail | null> {
  return withCache(`origin:${slug}`, async () => {
    try {
      const origin = await prisma.origin.findFirst({
        where: { slug, isActive: true },
        select: {
          id: true,
          slug: true,
          country: true,
          region: true,
          subregion: true,
          description: true,
          imageUrl: true,
          products: {
            where: {
              status: 'active',
              deletedAt: null,
              variants: { some: { status: 'active' } },
            },
            include: productCardInclude,
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!origin) return null

      return {
        id: origin.id,
        slug: origin.slug,
        country: origin.country,
        region: origin.region,
        subregion: origin.subregion,
        description: origin.description,
        imageUrl: origin.imageUrl,
        products: origin.products.map(mapToProductCard),
      }
    } catch (error) {
      console.error('Error fetching origin by slug:', error)
      return null
    }
  }, 600)
}
