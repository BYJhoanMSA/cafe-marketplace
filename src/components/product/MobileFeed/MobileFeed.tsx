'use client'

// src/components/product/MobileFeed/MobileFeed.tsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MobileFeedSlide } from './MobileFeedSlide'
import { getImageUrl } from '@/lib/utils'
import type { ProductCardData } from '../ProductCard'
import styles from './MobileFeed.module.css'

interface MobileFeedProps {
  products: ProductCardData[]
  onAddToCart?: (productId: string) => void
}

/** Tiempo sin scroll para considerar que el usuario se detuvo en un producto */
const SETTLE_DELAY_MS = 400

/** Máximo de slides montados en caché (estilo TikTok: los vistos no se destruyen) */
const MAX_CACHED_SLIDES = 12

/** Clave de sessionStorage para restaurar la posición del feed al volver del PDP */
const SCROLL_POS_KEY = 'catalogo-scroll-pos'

/** Lista de ids montados (ventana activa + vistos), ordenada por índice de producto */
function buildMountedList(prev: string[], activeIndex: number, products: ProductCardData[]): string[] {  const valid = new Set(products.map((p) => p.id))
  const indexOf = (id: string) => products.findIndex((p) => p.id === id)

  let list = prev.filter((id) => valid.has(id))

  const start = Math.max(0, activeIndex - 1)
  const end = Math.min(products.length - 1, activeIndex + 1)
  for (let i = start; i <= end; i++) {
    const product = products[i]
    if (product && !list.includes(product.id)) list.push(product.id)
  }

  // Desalojar los más lejanos al activo cuando se supera el tope (LRU por distancia)
  if (list.length > MAX_CACHED_SLIDES) {
    list = list
      .map((id) => ({ id, dist: Math.abs(indexOf(id) - activeIndex) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, MAX_CACHED_SLIDES)
      .map((x) => x.id)
  }

  return list.sort((a, b) => indexOf(a) - indexOf(b))
}

export function MobileFeed({ products, onAddToCart }: MobileFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [settled, setSettled] = useState(true)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mountedIds, setMountedIds] = useState<string[]>([])
  const [seen, setSeen] = useState<Set<string>>(() => new Set())
  const lastScrollSaveRef = useRef(0)

  // Restaurar la posición del feed al volver al catálogo (botón atrás o "Volver al catálogo").
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const saved = sessionStorage.getItem(SCROLL_POS_KEY)
    sessionStorage.removeItem(SCROLL_POS_KEY)
    if (saved != null) {
      const target = Number(saved)
      if (!Number.isNaN(target) && target > 0) {
        const apply = () => container.scrollTo(0, target)
        apply()
        requestAnimationFrame(apply)
      }
    }
  }, [])

  // Guardar la posición final al desmontar (navegación al PDP).
  useEffect(() => {
    const container = containerRef.current
    return () => {
      if (!container) return
      try {
        sessionStorage.setItem(SCROLL_POS_KEY, String(container.scrollTop))
      } catch {}
    }
  }, [])

  // Scroll handler — calcula el slide activo y marca cuándo el usuario se detiene
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const step = container.clientHeight
      if (step <= 0) return
      const index = Math.round(container.scrollTop / step)
      setActiveIndex(Math.min(Math.max(index, 0), products.length - 1))

      const now = Date.now()
      if (now - lastScrollSaveRef.current > 150) {
        lastScrollSaveRef.current = now
        try {
          sessionStorage.setItem(SCROLL_POS_KEY, String(container.scrollTop))
        } catch {}
      }

      setSettled(false)
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current)
      settleTimerRef.current = setTimeout(() => setSettled(true), SETTLE_DELAY_MS)
    }

    handleScroll()
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current)
    }
  }, [products.length])

  // Precargar portada a alta calidad de los slides vecinos para el upgrade instantáneo
  useEffect(() => {
    const preload = (product: ProductCardData) => {
      const src = getImageUrl(product.imageUrl, { width: 1000 })
      const img = new Image()
      img.src = src
    }
    const prev = products[activeIndex - 1]
    const next = products[activeIndex + 1]
    if (prev) preload(prev)
    if (next) preload(next)
  }, [activeIndex, products])

  // Marcar como "visto" cuando el usuario se detiene en el producto (calidad alta mostrada)
  useEffect(() => {
    if (!settled) return
    const product = products[activeIndex]
    if (product && !seen.has(product.id)) {
      setSeen((prev) => new Set(prev).add(product.id))
    }
  }, [settled, activeIndex, products, seen])

  // Render cache estilo TikTok: una vez montado, el slide se mantiene hasta ser desalojado
  const desired = buildMountedList(mountedIds, activeIndex, products)
  if (desired.join(',') !== mountedIds.join(',')) {
    setMountedIds(desired)
  }

  const indexOf = (id: string) => products.findIndex((p) => p.id === id)
  const firstIndex = mountedIds.length ? indexOf(mountedIds[0]!) : 0
  const lastIndex = mountedIds.length ? indexOf(mountedIds[mountedIds.length - 1]!) : -1

  return (
    <div className={styles.feedContainer} ref={containerRef}>
      <div style={{ height: `${firstIndex * 100}%` }} />
      {mountedIds.map((id) => {
        const realIndex = indexOf(id)
        const product = products[realIndex]
        if (!product) return null
        return (
          <div key={id} className={styles.slide}>
            <MobileFeedSlide
              product={product}
              isActive={realIndex === activeIndex}
              settled={settled}
              seen={seen.has(id)}
              onAddToCart={onAddToCart}
            />
          </div>
        )
      })}
      <div style={{ height: `${(products.length - 1 - lastIndex) * 100}%` }} />
    </div>
  )
}
