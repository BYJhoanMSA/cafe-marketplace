'use server'

// src/server/actions/taste-profile.actions.ts
// Guarda el perfil de sabor del usuario (quiz de 2 minutos) y devuelve
// recomendaciones por afinidad:
//   - Coincidencia de tueste, acidez y cuerpo
//   - Notas de sabor del producto (tabla normalizada)
//   - Búsqueda en título, descripción y descripción corta
//   - Búsqueda en reseñas aprobadas del producto
// Cada recomendación incluye un motivo en lenguaje natural y el perfil
// detectado se describe con un pequeño texto personalizado.

import { auth } from '@/lib/auth'
import { prisma } from '@/server/db/client'
import { TasteProfileSchema } from '@/server/validators/user.schema'
import type { Prisma } from '@prisma/client'

export interface TasteProfileInput {
  roastPreference: string
  acidityPreference: string
  bodyPreference: string
  flavorNotes: string[]
  brewMethods: string[]
}

export interface CoffeeRecommendation {
  id: string
  slug: string
  title: string
  imageUrl: string
  price: number
  currency: string
  reason: string
}

// ================================================================
// Diccionarios de lenguaje natural
// ================================================================
const ROAST_LABELS: Record<string, string> = {
  light: 'ligero',
  'medium-light': 'medio-ligero',
  medium: 'medio',
  'medium-dark': 'medio-oscuro',
  dark: 'oscuro',
}

// Preferencia de acidez → métodos de proceso afines
// (washed tiende a más acidez; natural/honey a menos)
const ACIDITY_PROCESS: Record<string, string> = {
  low: 'natural',
  medium: 'honey',
  high: 'washed',
}

// Preferencia de cuerpo → métodos de proceso afines
const BODY_PROCESS: Record<string, string> = {
  light: 'washed',
  medium: 'honey',
  full: 'natural',
}

// Vecinos de tueste (tueste exacto + alternativas cercanas)
const ROAST_NEIGHBORS: Record<string, string[]> = {
  light: ['light', 'medium-light'],
  'medium-light': ['medium-light', 'light', 'medium'],
  medium: ['medium', 'medium-light', 'medium-dark'],
  'medium-dark': ['medium-dark', 'medium', 'dark'],
  dark: ['dark', 'medium-dark'],
}

// ================================================================
// Scoring por afinidad
// ================================================================
interface ScoredProduct {
  score: number
  matchedNotes: string[]
  matchedRoast: boolean
  matchedAcidity: boolean
  matchedBody: boolean
  id: string
  slug: string
  title: string
  roastLevel: string
  processingMethod: string
  cuppingScore: number | null
  shortDescription: string | null
  description: string
  imageUrl: string
  price: number
  currency: string
  reviewCount: number
  avgRating: number
}

const RECOMMENDATION_INCLUDE = {
  flavorNotes: { select: { note: true } },
  reviews: {
    where: { status: 'approved' },
    select: { title: true, body: true },
    take: 20,
  },
  variants: {
    where: { status: 'active' },
    orderBy: { priceInCents: 'asc' as const },
  },
  images: {
    where: { mediaType: 'image' },
    orderBy: { position: 'asc' as const },
    take: 1,
  },
} satisfies Prisma.ProductInclude

type RecommendationProduct = Prisma.ProductGetPayload<{ include: typeof RECOMMENDATION_INCLUDE }>

function scoreProduct(product: RecommendationProduct, profile: TasteProfileInput): ScoredProduct {
  const title = (product.title ?? '').toLowerCase()
  const description = (product.description ?? '').toLowerCase()
  const shortDescription = (product.shortDescription ?? '').toLowerCase()
  const notes = profile.flavorNotes.map((n) => n.toLowerCase())

  let score = 0
  const matchedNotes: string[] = []

  // 1. Tueste: coincidencia exacta y vecinos cercanos
  const wantedRoasts = ROAST_NEIGHBORS[profile.roastPreference] ?? []
  const isExactRoast = wantedRoasts[0] === product.roastLevel
  const matchedRoast = wantedRoasts.includes(product.roastLevel)
  if (isExactRoast) score += 30
  else if (matchedRoast) score += 15

  // 2. Notas de sabor normalizadas (tabla ProductFlavorNote)
  const productNoteList: string[] = (product.flavorNotes ?? []).map((fn: { note: string }) =>
    fn.note.toLowerCase()
  )
  for (const note of notes) {
    if (productNoteList.includes(note)) {
      score += 12
      matchedNotes.push(note)
    }
  }

  // 3. Búsqueda en título, descripción y descripción corta
  const textHaystack = `${title} ${description} ${shortDescription}`
  for (const note of notes) {
    if (textHaystack.includes(note) && !matchedNotes.includes(note)) {
      score += 8
      matchedNotes.push(note)
    }
  }

  // 4. Búsqueda en reseñas aprobadas
  const reviewText = (product.reviews ?? [])
    .map((r: { title: string | null; body: string | null }) =>
      `${r.title ?? ''} ${r.body ?? ''}`.toLowerCase()
    )
    .join(' ')
  for (const note of notes) {
    if (reviewText.includes(note) && !matchedNotes.includes(note)) {
      score += 5
      matchedNotes.push(note)
    }
  }

  // 5. Acidez ↔ método de proceso
  const matchedAcidity =
    Boolean(profile.acidityPreference) &&
    product.processingMethod === ACIDITY_PROCESS[profile.acidityPreference]
  if (matchedAcidity) score += 10

  // 6. Cuerpo ↔ método de proceso / tueste
  const matchedBody =
    Boolean(profile.bodyPreference) &&
    product.processingMethod === BODY_PROCESS[profile.bodyPreference]
  if (matchedBody) score += 10

  // 7. Bonificación por calificación y cupping
  if (product.cuppingScore && Number(product.cuppingScore) >= 87) score += 5
  if (Number(product.avgRating) >= 4.5) score += 3

  return {
    score,
    matchedNotes: matchedNotes.slice(0, 4),
    matchedRoast,
    matchedAcidity,
    matchedBody,
    id: product.id,
    slug: product.slug,
    title: product.title,
    roastLevel: product.roastLevel,
    processingMethod: product.processingMethod,
    cuppingScore: product.cuppingScore ? Number(product.cuppingScore) : null,
    shortDescription: product.shortDescription,
    description: product.description,
    imageUrl: product.images?.[0]?.url || '/images/products/placeholder-1.jpg',
    price: product.variants?.[0]?.priceInCents ?? 0,
    currency: product.variants?.[0]?.currency ?? 'USD',
    reviewCount: product.reviewCount,
    avgRating: Number(product.avgRating),
  }
}

// Motivo en lenguaje natural para cada recomendación
function buildReason(scored: ScoredProduct, profile: TasteProfileInput): string {
  const reasons: string[] = []

  if (scored.matchedRoast) {
    const wanted = ROAST_NEIGHBORS[profile.roastPreference] ?? []
    if (wanted[0] === scored.roastLevel) {
      reasons.push(`su tueste ${ROAST_LABELS[scored.roastLevel] ?? scored.roastLevel} es justo lo que buscas`)
    } else {
      reasons.push(`su tueste ${ROAST_LABELS[scored.roastLevel] ?? scored.roastLevel} es cercano a tu preferencia`)
    }
  }

  if (scored.matchedNotes.length > 0) {
    reasons.push(`tiene las notas ${scored.matchedNotes.slice(0, 3).join(', ')} que te encantan`)
  } else if (scored.description) {
    const snippet = scored.description
      .split(/[.;]\s?/)
      .find((s) => s.trim().length > 0)
    if (snippet) reasons.push(`su perfil en taza encaja con tu paladar`)
  }

  if (scored.matchedAcidity) {
    reasons.push(`su nivel de acidez se ajusta a tu preferencia`)
  }

  if (scored.matchedBody) {
    reasons.push(`su cuerpo es el que disfrutas`)
  }

  if (reasons.length === 0) {
    reasons.push('es un café de especialidad bien valorado que queremos que pruebes')
  }

  return reasons.slice(0, 2).join(', ') + '.'
}

export async function getRecommendations(input: TasteProfileInput): Promise<CoffeeRecommendation[]> {
  try {
    const notes = input.flavorNotes.map((n) => n.toLowerCase())

    // Traer el catálogo activo con todo lo necesario para el scoring.
    // Se evalúa en memoria: catálogo pequeño (MVP) y texto libre.
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        variants: { some: { status: 'active' } },
      },
      include: RECOMMENDATION_INCLUDE,
      take: 100,
    })

    const scored = products
      .map((p) => scoreProduct(p, input))
      .filter((s) => s.score > 0 || notes.length === 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return b.avgRating - a.avgRating
      })

    return scored.slice(0, 6).map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      imageUrl: s.imageUrl,
      price: s.price,
      currency: s.currency,
      reason: buildReason(s, input),
    }))
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
}

export async function saveTasteProfile(input: TasteProfileInput) {
  const parsed = TasteProfileSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Perfil de sabor inválido' }
  }

  try {
    const session = await auth()
    if (!session?.user) {
      // Sin sesión: guardar las preferencias en una cookie para usarlas
      // como recomendación puntual (sin persistir en BD).
      return { success: true, guest: true }
    }

    const data = parsed.data

    await prisma.tasteProfile.upsert({
      where: { userId: session.user.id },
      update: {
        roastPreference: data.roastPreference ?? null,
        acidityPreference: data.acidityPreference ?? null,
        bodyPreference: data.bodyPreference ?? null,
        completedAt: new Date(),
        flavorNotes: {
          deleteMany: {},
          create: data.flavorNotes.map((note) => ({ note })),
        },
        brewMethods: {
          deleteMany: {},
          create: data.brewMethods.map((method) => ({ method })),
        },
      },
      create: {
        userId: session.user.id,
        roastPreference: data.roastPreference ?? null,
        acidityPreference: data.acidityPreference ?? null,
        bodyPreference: data.bodyPreference ?? null,
        completedAt: new Date(),
        flavorNotes: {
          create: data.flavorNotes.map((note) => ({ note })),
        },
        brewMethods: {
          create: data.brewMethods.map((method) => ({ method })),
        },
      },
    })

    return { success: true, guest: false }
  } catch (error) {
    console.error('Error saving taste profile:', error)
    return { success: false, error: 'Error al guardar tu perfil de sabor' }
  }
}
