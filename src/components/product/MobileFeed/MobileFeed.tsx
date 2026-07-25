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

  // Intersection Observer — 1 sola instancia para todos los slides
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setActiveIndex(index)
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      }
    )

    const slides = container.querySelectorAll('[data-index]')
    for (const slide of slides) observer.observe(slide)

    return () => observer.disconnect()
  }, [products])

  // Renderizar solo slide activo ± 1 para reducir DOM
  const start = Math.max(0, activeIndex - 1)
  const end = Math.min(products.length - 1, activeIndex + 1)
  const visibleProducts = products.slice(start, end + 1)
  const offsetStart = start

  return (
    <div className={styles.feedContainer} ref={containerRef}>
      <div style={{ height: `${offsetStart * 100}vh` }} />
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
      <div style={{ height: `${(products.length - 1 - end) * 100}vh` }} />
    </div>
  )
}
