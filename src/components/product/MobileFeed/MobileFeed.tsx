'use client'

// src/components/product/MobileFeed/MobileFeed.tsx
import { useEffect, useRef, useState } from 'react'
import { MobileFeedSlide } from './MobileFeedSlide'
import type { ProductCardData } from '../ProductCard'
import styles from './MobileFeed.module.css'

interface MobileFeedProps {
  products: ProductCardData[]
  onAddToCart?: (productId: string) => void
}

export function MobileFeed({ products, onAddToCart }: MobileFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Scroll handler — calcula el slide activo por posición (sin IntersectionObserver)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateActiveIndex = () => {
      const step = container.clientHeight
      if (step <= 0) return
      const index = Math.round(container.scrollTop / step)
      setActiveIndex(Math.min(Math.max(index, 0), products.length - 1))
    }

    updateActiveIndex()
    container.addEventListener('scroll', updateActiveIndex, { passive: true })
    return () => container.removeEventListener('scroll', updateActiveIndex)
  }, [products.length])

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
              onAddToCart={onAddToCart}
            />
          </div>
        )
      })}
      <div style={{ height: `${(products.length - 1 - end) * 100}%` }} />
    </div>
  )
}
