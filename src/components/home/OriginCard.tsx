'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './OriginCard.module.css'

interface OriginCardProps {
  label: string
  slug: string
  count: number
  images: string[]
}

export function OriginCard({ label, slug, count, images }: OriginCardProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const hasImages = images.length > 0

  useEffect(() => {
    if (!hasImages) return
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [images, hasImages])

  return (
    <Link
      href={`/origenes/${slug}`}
      className={styles.card}
      aria-label={`${label} — ${count} cafés disponibles`}
    >
      {hasImages && images[imgIndex] ? (
        <Image
          src={images[imgIndex]!}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.image}
        />
      ) : (
        <div className={styles.imageFallback} aria-hidden="true" />
      )}
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <h3 className={styles.title}>{label}</h3>
        <p className={styles.count}>{count} cafés</p>
      </div>
    </Link>
  )
}
