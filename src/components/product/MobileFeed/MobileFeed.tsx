'use client'

// src/components/product/MobileFeed/MobileFeed.tsx
import { useEffect, useRef, useState } from 'react'
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

export function MobileFeed({ products, onAddToCart }: MobileFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [settled, setSettled] = useState(true)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll handler — calcula el slide activo y marca cuándo el usuario se detiene
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const step = container.clientHeight
      if (step <= 0) return
      const index = Math.round(container.scrollTop / step)
      setActiveIndex(Math.min(Math.max(index, 0), products.length - 1))

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

  // Precargar la portada a alta calidad de los slides vecinos para el upgrade instantáneo
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

  // Renderizar solo slide activo ± 1 para reducir DOM
  const start = Math.max(0, activeIndex - 1)
  const end = Math.min(products.length - 1, activeIndex + 1)
  const visibleProducts = products.slice(start, end + 1)
  const offsetStart = start

  return (
    <div className={styles.feedContainer} ref={containerRef}>
      <div style={{ height: `${offsetStart * 100}%` }} />
      {visibleProducts.map((product, index) => {
        const realIndex = offsetStart + index
        return (
          <div key={product.id} data-index={realIndex} className={styles.slide}>
            <MobileFeedSlide 
              product={product} 
              isActive={realIndex === activeIndex}
              settled={settled}
              onAddToCart={onAddToCart}
            />
          </div>
        )
      })}
      <div style={{ height: `${(products.length - 1 - end) * 100}%` }} />
    </div>
  )
}
