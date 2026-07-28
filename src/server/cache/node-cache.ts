// src/server/cache/node-cache.ts
// =============================================================================
// Cache en memoria con node-cache
// =============================================================================
// IMPORTANTE: Esta cache es VOLÁTIL. Se pierde cuando el proceso de Node.js
// se reinicia (deploys, crashes). Solo para datos que pueden recalcularse.
// No guardar aquí datos críticos ni información de usuarios.
//
// Úsalo para:
//   - Resultados de búsqueda (5 min)
//   - Listados de categorías y orígenes (10 min)
//   - Conteo de productos por categoría (5 min)
// =============================================================================

import NodeCache from 'node-cache'

// TTL por defecto: 5 minutos. checkperiod: limpia keys expiradas cada 120s
// maxKeys: evita fugas de memoria con búsquedas únicas infinitas
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120, maxKeys: 500 })

export type CacheTTL = 60 | 300 | 600 | 1800 | 3600

/**
 * Obtiene un valor del cache o ejecuta la función factory para generarlo.
 * Patrón "Cache-Aside" (Lazy Loading)
 */
export async function withCache<T>(
  key: string,
  factory: () => Promise<T>,
  ttl: CacheTTL = 300
): Promise<T> {
  const cached = cache.get<T>(key)
  if (cached !== undefined) {
    return cached
  }

  const value = await factory()
  cache.set(key, value, ttl)
  return value
}

/**
 * Invalida una o varias keys del cache
 */
export function invalidateCache(keys: string | string[]): void {
  const keysArray = Array.isArray(keys) ? keys : [keys]
  cache.del(keysArray)
}

/**
 * Invalida todas las keys que empiecen con un prefijo dado
 * Útil para invalidar: invalidateCacheByPrefix('products:')
 */
export function invalidateCacheByPrefix(prefix: string): void {
  const allKeys = cache.keys()
  const matchingKeys = allKeys.filter((key) => key.startsWith(prefix))
  if (matchingKeys.length > 0) {
    cache.del(matchingKeys)
  }
}

export { cache }
