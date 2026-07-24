import { cache } from './node-cache'

export function rateLimit(key: string, maxAttempts: number, windowSeconds: number): boolean {
  const cacheKey = `ratelimit:${key}`
  const current = (cache.get<number>(cacheKey) ?? 0) + 1

  if (current === 1) {
    cache.set(cacheKey, current, windowSeconds)
  } else {
    cache.set(cacheKey, current)
  }

  return current <= maxAttempts
}