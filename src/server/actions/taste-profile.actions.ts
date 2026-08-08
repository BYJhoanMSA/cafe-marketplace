'use server'

// src/server/actions/taste-profile.actions.ts
// Guarda el perfil de sabor del usuario (quiz de 2 minutos) y devuelve
// recomendaciones básicas en base a sus preferencias.

import { auth } from '@/lib/auth'
import { prisma } from '@/server/db/client'
import { TasteProfileSchema } from '@/server/validators/user.schema'

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

// Reglas simples de recomendación basadas en el perfil
function buildRecommendationQuery(profile: TasteProfileInput) {
  const roastLevel: Record<string, string> = {
    light: 'light',
    medium: 'medium',
    'medium-dark': 'medium-dark',
    dark: 'dark',
  }

  return {
    roast: roastLevel[profile.roastPreference] ?? undefined,
    flavorNotes: profile.flavorNotes.length > 0 ? profile.flavorNotes.slice(0, 3) : undefined,
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

export async function getRecommendations(input: TasteProfileInput): Promise<CoffeeRecommendation[]> {
  try {
    const q = buildRecommendationQuery(input)

    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        variants: { some: { status: 'active' } },
        ...(q.roast ? { roastLevel: q.roast } : {}),
        ...(q.flavorNotes
          ? { flavorNotes: { some: { note: { in: q.flavorNotes } } } }
          : {}),
      },
      include: {
        origin: { select: { country: true, region: true } },
        vendor: { select: { storeName: true } },
        variants: {
          where: { status: 'active' },
          orderBy: { priceInCents: 'asc' as const },
        },
        images: {
          where: { mediaType: 'image' },
          orderBy: { position: 'asc' as const },
          take: 1,
        },
      },
      take: 6,
    })

    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      imageUrl: p.images[0]?.url || '/images/products/placeholder-1.jpg',
      price: p.variants[0]?.priceInCents ?? 0,
      currency: p.variants[0]?.currency ?? 'USD',
      reason: `Por su tueste ${p.roastLevel}, notas ${input.flavorNotes.slice(0, 2).join(' y ') || 'balanceadas'} y su perfil en taza.`,
    }))
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
}
