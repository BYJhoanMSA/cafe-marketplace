'use server'

// src/server/actions/social.actions.ts
// Contadores sociales GLOBALES (favoritos y compartidos).
// - Cualquier persona (registrada o no) puede incrementar el contador.
// - Límite: 1 vez por día por producto (controlado con cookie del navegador).

import { cookies } from 'next/headers'
import { prisma } from '@/server/db/client'
import { invalidateProductsCache } from './catalog.actions'

export type SocialType = 'favorites' | 'shares'

// Prefijo de cookie por producto+tipo (marca el día del último voto)
const DAILY_COOKIE_PREFIX = 'cafe_social_'

function todayStamp(): string {
  // Formato YYYY-MM-DD en hora local del navegador lo maneja el cliente;
  // acá usamos UTC para la comparación servidor-contador.
  return new Date().toISOString().slice(0, 10)
}

export interface SocialIncrementResult {
  count: number
  counted: boolean // true si se incrementó en esta llamada
}

export async function getSocialCountsForProduct(
  productId: string
): Promise<{ favorites: number; shares: number }> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { favoritesCount: true, sharesCount: true },
  })
  if (!product) return { favorites: 0, shares: 0 }
  return { favorites: product.favoritesCount, shares: product.sharesCount }
}

/**
 * Incrementa el contador social de un producto.
 * Solo cuenta 1 vez por día por navegador (controlado por cookie).
 * Devuelve el nuevo valor y si la llamada realmente incrementó o no.
 */
export async function incrementSocialCount(
  productId: string,
  type: SocialType
): Promise<SocialIncrementResult> {
  const cookieStore = await cookies()
  const cookieName = `${DAILY_COOKIE_PREFIX}${productId}_${type}`
  const today = todayStamp()

  // Si ya votó hoy en este navegador, no incrementar (devolver total actual)
  if (cookieStore.get(cookieName)?.value === today) {
    const existing = await getSocialCountsForProduct(productId)
    return { count: existing[type], counted: false }
  }

  const data =
    type === 'favorites'
      ? { favoritesCount: { increment: 1 } }
      : { sharesCount: { increment: 1 } }

  const product = await prisma.product.update({
    where: { id: productId },
    data,
    select: { favoritesCount: true, sharesCount: true },
  })

  // Registrar el voto de hoy para este navegador (vence en 2 días)
  cookieStore.set(cookieName, today, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 2, // 48h: cubre 2 días solapados por zonas horarias
  })

  // Invalidar caches del catálogo para que el resto vea el nuevo total
  invalidateProductsCache()

  const count = type === 'favorites' ? product.favoritesCount : product.sharesCount
  return { count, counted: true }
}