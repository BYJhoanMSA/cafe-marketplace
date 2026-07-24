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

  // Intersection Observer para detectar qué slide está activo
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // El índice se pasa mediante un atributo data-index en cada slide
            const index = Number(entry.target.getAttribute('data-index'))
            setActiveIndex(index)
          }
        })
      },
      {
        root: container,
        threshold: 0.6, // Se considera activo cuando >60% está visible
      }
    )

    const slides = container.querySelectorAll(`.${styles.slide}`)
    slides.forEach((slide) => observer.observe(slide))

    return () => observer.disconnect()
  }, [products])

  return (
    <div className={styles.feedContainer} ref={containerRef}>
      {products.map((product, index) => (
        <div key={product.id} data-index={index} className={styles.slide}>
          <MobileFeedSlide 
            product={product} 
            isActive={index === activeIndex}
            onAddToCart={onAddToCart}
          />
        </div>
      ))}
    </div>
  )
}
