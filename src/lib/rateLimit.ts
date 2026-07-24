// src/lib/rateLimit.ts

const TEN_MINUTES_MS = 10 * 60 * 1000 // 10 minutos en milisegundos

/**
 * Verifica si un producto puede incrementar su contador social de favoritos.
 * Limita el incremento a 1 vez cada 10 minutos por navegador/dispositivo.
 */
export function canIncrementSocialCount(productId: string): boolean {
  if (typeof window === 'undefined') return false
  const key = `cafe_rate_limit_${productId}`
  const lastTime = localStorage.getItem(key)
  const now = Date.now()

  if (lastTime) {
    const elapsed = now - parseInt(lastTime, 10)
    if (elapsed < TEN_MINUTES_MS) {
      return false // Bloqueado: ya incrementó hace menos de 10 minutos
    }
  }

  localStorage.setItem(key, String(now))
  return true
}
