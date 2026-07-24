'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
      href="/catalogo"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        height: '280px',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        textDecoration: 'none',
      }}
      aria-label={`${label} — ${count} cafés disponibles`}
    >
      {hasImages && images[imgIndex] ? (
        <Image
          src={images[imgIndex]!}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover', transition: 'opacity 0.6s ease' }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, var(--neutral-700), var(--neutral-900))',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(transparent 50%, rgba(15,12,10,0.9))',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'var(--text-xl)',
            color: 'var(--neutral-0)',
            margin: 0,
          }}
        >
          {label}
        </h3>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--gold-300)',
            fontWeight: 'var(--font-weight-medium)',
            margin: 0,
          }}
        >
          {count} cafés
        </p>
      </div>
    </Link>
  )
}
