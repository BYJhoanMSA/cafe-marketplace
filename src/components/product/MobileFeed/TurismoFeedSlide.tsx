'use client'

// src/components/product/MobileFeed/TurismoFeedSlide.tsx
// Slide vertical (estilo TikTok) para un recorrido de turismo intercalado en el
// feed del catálogo móvil. Comparte el lenguaje visual de MobileFeedSlide pero
// con datos de turismo: sin carrito/favoritos; Reservar por WhatsApp + detalles.
// Incluye carrusel horizontal de imágenes (swipe, flechas y dots) igual que los
// slides de café.

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Clock, Users, MessageCircle, Share2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getImageUrl, IMAGE_BLUR_PLACEHOLDER, formatPesos, normalizeWhatsAppNumber } from '@/lib/utils'
import type { RecorridoTuristicoCard } from '@/server/actions/turismo.actions'
import styles from './MobileFeed.module.css'

interface TurismoFeedSlideProps {
  recorrido: RecorridoTuristicoCard
  isActive: boolean
  settled: boolean
  seen: boolean
  onOpenTurismo: () => void
}

const SWIPE_THRESHOLD = 60

export function TurismoFeedSlide({ recorrido, isActive, settled, seen, onOpenTurismo }: TurismoFeedSlideProps) {
  const showHighQuality = isActive && settled
  const showCachedCover = seen && !showHighQuality
  const hasDiscount = !!recorrido.precioOriginal && recorrido.precioOriginal > recorrido.precio

  const images = [
    recorrido.imagen,
    ...recorrido.imagenes.filter((url) => url && url !== recorrido.imagen),
  ]

  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isDragging = useRef(false)
  const dragOffsetX = useRef(0)
  const suppressClick = useRef(false)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveImageIndex(0)
  }, [recorrido.id])

  const goToIndex = useCallback((index: number, animated: boolean) => {
    if (!stripRef.current) return
    stripRef.current.style.transition = animated ? 'transform 0.35s cubic-bezier(0.15, 0.75, 0.25, 1)' : 'none'
    stripRef.current.style.transform = `translateX(${-index * 100}vw)`
  }, [])

  useEffect(() => {
    goToIndex(activeImageIndex, true)
  }, [activeImageIndex, goToIndex])

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    if (!touch) return
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    isDragging.current = false
    dragOffsetX.current = 0
  }

  function handleTouchMove(e: React.TouchEvent) {
    const touch = e.touches[0]
    if (!touch) return
    const dx = touch.clientX - touchStartX.current
    const dy = Math.abs(touch.clientY - touchStartY.current)

    if (!isDragging.current && Math.abs(dx) > 10 && Math.abs(dx) > dy) {
      isDragging.current = true
    }

    if (isDragging.current) {
      e.preventDefault()
      dragOffsetX.current = dx
      if (stripRef.current) {
        stripRef.current.style.transition = 'none'
        stripRef.current.style.transform = `translateX(${(-activeImageIndex * 100) + (dx / window.innerWidth * 100)}vw)`
      }
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const touch = e.changedTouches[0]

    if (isDragging.current) {
      const dx = dragOffsetX.current

      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx > 0 && activeImageIndex > 0) {
          setActiveImageIndex((prev) => prev - 1)
        } else if (dx < 0 && activeImageIndex < images.length - 1) {
          setActiveImageIndex((prev) => prev + 1)
        } else {
          goToIndex(activeImageIndex, true)
        }
      } else {
        goToIndex(activeImageIndex, true)
      }

      isDragging.current = false
      dragOffsetX.current = 0
      return
    }

    if (touch) {
      const dx = touch.clientX - touchStartX.current
      const dy = touch.clientY - touchStartY.current
      const target = e.target as HTMLElement
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && !target.closest('a, button')) {
        suppressClick.current = true
        onOpenTurismo()
      }
    }

    dragOffsetX.current = 0
  }

  function handleImageClick() {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    onOpenTurismo()
  }

  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeImageIndex > 0) setActiveImageIndex((prev) => prev - 1)
  }, [activeImageIndex])

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeImageIndex < images.length - 1) setActiveImageIndex((prev) => prev + 1)
  }, [activeImageIndex, images.length])

  const phone =
    normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573008717377') ?? '573008717377'
  const whatsappMsg = encodeURIComponent(
    `🌟 ¡Hola! Me interesa el recorrido "${recorrido.nombre}" (${recorrido.region}, ${recorrido.municipio}). ¿Me comparten más información y disponibilidad?`
  )
  const whatsappUrl = `https://wa.me/${phone}?text=${whatsappMsg}`

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation()
    const shareData = {
      title: recorrido.nombre,
      text: `Descubre ${recorrido.nombre} en Cafe Seleccion`,
      url: `${window.location.origin}/turismo/${recorrido.slug}`,
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share(shareData).catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url)
    }
  }

  return (
    <div className={styles.slide}>
      <div
        className={styles.imageContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleImageClick}
      >
        {showHighQuality ? (
          <div className={styles.imageStrip} ref={stripRef}>
            {images.map((img, idx) => (
              <div key={idx} className={styles.imageStripItem}>
                <Image
                  src={getImageUrl(img, { width: 1000 })}
                  alt={idx === 0 ? recorrido.nombre : `${recorrido.nombre} - Imagen ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  className={styles.image}
                  sizes="100vw"
                  placeholder={seen ? 'empty' : 'blur'}
                  blurDataURL={IMAGE_BLUR_PLACEHOLDER}
                />
              </div>
            ))}
          </div>
        ) : showCachedCover ? (
          <Image
            src={getImageUrl(recorrido.imagen, { width: 1000 })}
            alt={recorrido.nombre}
            fill
            className={styles.image}
            sizes="100vw"
            placeholder="empty"
          />
        ) : (
          <Image
            src={getImageUrl(recorrido.imagen, { width: 200 })}
            alt={recorrido.nombre}
            fill
            className={styles.image}
            sizes="100vw"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_PLACEHOLDER}
          />
        )}

        {showHighQuality && images.length > 1 && (
          <>
            {activeImageIndex > 0 && (
              <button
                className={`${styles.navArrow} ${styles.navArrowLeft}`}
                onClick={handlePrevImage}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {activeImageIndex < images.length - 1 && (
              <button
                className={`${styles.navArrow} ${styles.navArrowRight}`}
                onClick={handleNextImage}
                aria-label="Siguiente imagen"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </>
        )}

        <div className={styles.overlayTop} />
        <div className={styles.overlayBottom} />
      </div>

      {showHighQuality && images.length > 1 && (
        <div className={styles.imageDots}>
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.imageDot} ${idx === activeImageIndex ? styles.imageDotActive : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx) }}
              aria-label={`Imagen ${idx + 1} de ${images.length}`}
            />
          ))}
        </div>
      )}

      <div className={styles.header}>
        <span className={styles.vendorBadge}>
          <span className={styles.vendorAvatar}>T</span>
          Turismo · {recorrido.region}
        </span>
      </div>

      <div className={styles.actionsSidebar}>
        <button className={styles.actionButton} onClick={handleShare}>
          <div className={styles.actionIconBox}>
            <Share2 size={24} />
          </div>
          <span className={styles.actionLabel}>Compartir</span>
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.actionButton}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.actionIconBox}>
            <MessageCircle size={24} />
          </div>
          <span className={styles.actionLabel}>Reservar</span>
        </a>
      </div>

      <div className={styles.content}>
        <div className={styles.tags}>
          {recorrido.destacado && <span className={styles.tag}>Destacado</span>}
          {recorrido.dificultad && (
            <span className={styles.tag}>
              {recorrido.dificultad === 'baja'
                ? 'Baja dificultad'
                : recorrido.dificultad === 'media'
                  ? 'Media dificultad'
                  : 'Alta dificultad'}
            </span>
          )}
        </div>

        <Link href={`/turismo/${recorrido.slug}`} style={{ textDecoration: 'none' }}>
          <h2 className={styles.title}>{recorrido.nombre}</h2>
          <div className={styles.origin}>
            <MapPin size={14} />
            {recorrido.municipio}
            {recorrido.vereda ? ` · ${recorrido.vereda}` : ''}
          </div>
          <p className={styles.description}>{recorrido.descripcionCorta}</p>
        </Link>

        <div className={styles.turismoFacts}>
          {recorrido.duracion && (
            <span className={styles.turismoFact}>
              <Clock size={14} />
              {recorrido.duracion}
            </span>
          )}
          {recorrido.capacidad && (
            <span className={styles.turismoFact}>
              <Users size={14} />
              {recorrido.capacidad} personas
            </span>
          )}
        </div>

        <div className={`${styles.buySection} ${styles.turismoBuySection}`}>
          <div className={styles.priceBlock}>
            {hasDiscount && (
              <span className={styles.comparePrice}>{formatPesos(recorrido.precioOriginal!)}</span>
            )}
            <span className={styles.price}>{formatPesos(recorrido.precio)}</span>
          </div>
          <div className={styles.turismoActions}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waButton}
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle size={18} />
              Reservar
            </a>
            <Link href={`/turismo/${recorrido.slug}`} className={styles.detailsButton}>
              Ver detalles
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
