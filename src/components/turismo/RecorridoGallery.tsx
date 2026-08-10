'use client'

// src/components/turismo/RecorridoGallery.tsx
// Carrusel de fotos del recorrido con auto-roll (crossfade + Ken Burns),
// flechas, indicadores y miniaturas clicables. Pausa al pasar el mouse.

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import styles from './RecorridoGallery.module.css'

interface RecorridoGalleryProps {
  imagenes: string[]
  nombre: string
}

const INTERVAL = 5000

export function RecorridoGallery({ imagenes, nombre }: RecorridoGalleryProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const count = imagenes.length
  const showControls = count > 1

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % count) + count) % count)
    },
    [count]
  )

  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // Auto-roll: se reinicia con cada cambio de índice (manual o automático)
  useEffect(() => {
    if (paused || count <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL)
    return () => clearInterval(t)
  }, [paused, count, index])

  return (
    <div
      className={styles.wrapper}
      role="region"
      aria-roledescription="carrusel"
      aria-label={`Galería de ${nombre}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Vista principal */}
      <div className={styles.viewport}>
        {imagenes.map((url, i) => (
          <div
            key={i}
            className={`${styles.slide} ${i === index ? styles.slideActive : ''}`}
            aria-hidden={i !== index}
          >
            <Image
              src={getImageUrl(url, { width: 1200 })}
              alt={`${nombre} — imagen ${i + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`${styles.slideImage} ${i === index ? styles.slideImageActive : ''}`}
              priority={i === 0}
              loading={i === 0 ? undefined : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Flechas */}
      {showControls && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={prev}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={next}
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={22} />
          </button>

          {/* Botón pausa/reproducir */}
          <button
            type="button"
            className={styles.playButton}
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Reproducir carrusel' : 'Pausar carrusel'}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </>
      )}

      {/* Miniaturas */}
      {showControls && (
        <div className={styles.thumbnails} role="tablist" aria-label="Miniaturas">
          {imagenes.map((url, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.thumbnail} ${i === index ? styles.thumbnailActive : ''}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === index}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={getImageUrl(url, { width: 160 })}
                alt=""
                fill
                sizes="80px"
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
