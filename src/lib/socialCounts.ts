// src/lib/socialCounts.ts

const SOCIAL_COUNTS_PREFIX = 'cafe_social_cnt_'

interface SocialCounts {
  favorites: number
  shares: number
}

export function getSocialCounts(productId: string): SocialCounts {
  if (typeof window === 'undefined') return { favorites: 20, shares: 100 }
  try {
    const raw = localStorage.getItem(SOCIAL_COUNTS_PREFIX + productId)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { favorites: 20, shares: 100 }
}

export function incrementFavorites(productId: string): number {
  const counts = getSocialCounts(productId)
  counts.favorites += 1
  try {
    localStorage.setItem(SOCIAL_COUNTS_PREFIX + productId, JSON.stringify(counts))
  } catch {}
  return counts.favorites
}

export function incrementShares(productId: string): number {
  const counts = getSocialCounts(productId)
  counts.shares += 1
  try {
    localStorage.setItem(SOCIAL_COUNTS_PREFIX + productId, JSON.stringify(counts))
  } catch {}
  return counts.shares
}