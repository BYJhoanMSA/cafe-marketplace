import { cache } from './node-cache'

export function rateLimit(key: string, maxAttempts: number, windowSeconds: number): boolean {
  const cacheKey = `ratelimit:${key}`
  const current = (cache.get<number>(cacheKey) ?? 0) + 1

  cache.set(cacheKey, current, windowSeconds)

  return current <= maxAttempts
}