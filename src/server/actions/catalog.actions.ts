'use server'

import { prisma } from '@/server/db/client'
import { getGrindTypes, getVariantSizes } from './settings.actions'
import type { GrindTypeOption } from './settings.actions'
import type { Prisma } from '@prisma/client'

export interface CatalogFilters {
  origin?: string
  altitude?: string
  flavorNote?: string
  process?: string
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

export async function getActiveProducts(filters?: CatalogFilters) {
  try {
    const where: Prisma.ProductWhereInput = {
      status: 'active',
      deletedAt: null,
      variants: {
        some: {
          status: 'active',
        }
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
      orderBy: { createdAt: 'desc' }
    })

    if (filters?.altitude) {
      products = products.filter(p => altitudeMatchesFilter(p.altitudeMasl, filters.altitude!))
    }

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
    console.error('Error fetching active products:', error)
    return []
  }
}

export async function getProductBySlug(slug: string) {
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

    // Build unique size options from variants (grouped by weightGrams)
    const seenWeights = new Set<number | null>()
    const sizeOptions: { value: string; label: string; weightGrams: number | null; price: number }[] = []
    for (const v of p.variants) {
      const key = v.weightGrams ?? 0
      if (seenWeights.has(key)) continue
      seenWeights.add(key)
      const sizeLabel = variantSizes.find(s => s.grams === v.weightGrams)?.label || v.title.split(' - ')[0] || `${v.weightGrams}g`
      sizeOptions.push({
        value: String(key),
        label: sizeLabel,
        weightGrams: v.weightGrams,
        price: v.priceInCents,
      })
    }

    // Filter grind types to only those present in the product's variants
    const usedGrindValues = new Set(p.variants.map(v => v.grindType).filter(Boolean))
    const activeGrindOptions = grindTypes.filter(g => usedGrindValues.has(g.value))
    const grindOptions = activeGrindOptions.length > 0
      ? activeGrindOptions.map(g => ({ id: g.value, label: g.label }))
      : (usedGrindValues.size > 0
        ? [...usedGrindValues].map(v => ({ id: v!, label: v! }))
        : [{ id: 'whole-bean', label: 'En grano' }])

    const lowestPriceVariant = [...p.variants].sort((a, b) => a.priceInCents - b.priceInCents)[0] as (typeof p.variants)[number]

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
      reviewCount: p.reviewCount
    }
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return null
  }
}

export async function getHomepageOrigins() {
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
}

export async function getAvailableCatalogFilters() {
  try {
    // 1. Obtener orígenes que tengan productos activos
    const origins = await prisma.origin.findMany({
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
    })

    // 2. Obtener notas de sabor usadas en productos activos
    const flavorNotes = await prisma.productFlavorNote.findMany({
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
}
