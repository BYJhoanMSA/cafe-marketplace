'use client'

// src/components/product/MobileFeed/TurismoFeedSlide.tsx
// Slide vertical (estilo TikTok) para un recorrido de turismo intercalado en el
// feed del catálogo móvil. Comparte el lenguaje visual de MobileFeedSlide pero
// con datos de turismo: sin carrito/favoritos; Reservar por WhatsApp + detalles.

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Users, MessageCircle, Share2, ArrowRight } from 'lucide-react'
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

export function TurismoFeedSlide({ recorrido, isActive, settled, seen, onOpenTurismo }: TurismoFeedSlideProps) {
  const showHighQuality = isActive && settled
  const showCachedCover = seen && !showHighQuality
  const hasDiscount = !!recorrido.precioOriginal && recorrido.precioOriginal > recorrido.precio

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
      <div className={styles.imageContainer} onClick={onOpenTurismo}>
        {showHighQuality ? (
          <Image
            src={getImageUrl(recorrido.imagen, { width: 1000 })}
            alt={recorrido.nombre}
            fill
            priority
            className={styles.image}
            sizes="100vw"
            placeholder={seen ? 'empty' : 'blur'}
            blurDataURL={IMAGE_BLUR_PLACEHOLDER}
          />
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
        <div className={styles.overlayTop} />
        <div className={styles.overlayBottom} />
      </div>

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