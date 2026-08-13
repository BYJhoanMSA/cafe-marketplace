// src/lib/catalog-feed.ts
// Mezcla de cafés y recorridos de turismo para el feed vertical (estilo TikTok)
// del catálogo móvil. Los cafés mantienen su orden; los recorridos se intercalan
// según la cadencia configurada (cada 3/4/5 cafés, o aleatorio). Cuando se agotan
// los cafés, los recorridos que sobren van al final del feed.

import type { ProductCardData } from '@/components/product/ProductCard'
import type { RecorridoTuristicoCard } from '@/server/actions/turismo.actions'
import type { FeedTurismoCadence } from '@/server/actions/settings.actions'

export type FeedItem =
  | { kind: 'product'; id: string; slug: string; data: ProductCardData }
  | { kind: 'turismo'; id: string; slug: string; data: RecorridoTuristicoCard }

/** PRNG determinístico (mulberry32) para que el orden aleatorio sea estable en el día */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Semilla estable por fecha: el orden "aleatorio" no cambia durante el día,
 *  manteniendo coherente la restauración de posición y la caché del feed. */
function daySeed(): number {
  const d = new Date()
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
  return h >>> 0
}

function interleaveFixed(coffees: FeedItem[], turismo: FeedItem[], n: number): FeedItem[] {
  const result: FeedItem[] = []
  let t = 0
  for (let i = 0; i < coffees.length; i++) {
    result.push(coffees[i]!)
    if ((i + 1) % n === 0 && t < turismo.length) {
      result.push(turismo[t++]!)
    }
  }
  // Cuando se agotan los cafés, los recorridos sobrantes van al final.
  while (t < turismo.length) result.push(turismo[t++]!)
  return result
}

function interleaveRandom(coffees: FeedItem[], turismo: FeedItem[]): FeedItem[] {
  const total = coffees.length + turismo.length
  const rnd = mulberry32(daySeed())
  const positions = new Set<number>()
  while (positions.size < turismo.length && positions.size < total) {
    positions.add(Math.floor(rnd() * total))
  }

  const result: FeedItem[] = []
  let c = 0
  let t = 0
  for (let i = 0; i < total; i++) {
    if (positions.has(i) && t < turismo.length) result.push(turismo[t++]!)
    else if (c < coffees.length) result.push(coffees[c++]!)
  }
  while (c < coffees.length) result.push(coffees[c++]!)
  while (t < turismo.length) result.push(turismo[t++]!)
  return result
}

export function buildFeedItems(
  products: ProductCardData[],
  recorridos: RecorridoTuristicoCard[],
  cadence: FeedTurismoCadence
): FeedItem[] {
  const coffees: FeedItem[] = products.map((p) => ({
    kind: 'product',
    id: p.id,
    slug: p.slug,
    data: p,
  }))

  if (recorridos.length === 0) return coffees

  // id prefijado para que nunca colisione con el id de un café
  const turismo: FeedItem[] = recorridos.map((r) => ({
    kind: 'turismo',
    id: `turismo-${r.id}`,
    slug: r.slug,
    data: r,
  }))

  if (cadence === 'random') return interleaveRandom(coffees, turismo)
  return interleaveFixed(coffees, turismo, Number(cadence))
}