'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, MessageCircle, Share2, ShoppingBag, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { canIncrementSocialCount } from '@/lib/rateLimit'
import { getSocialCounts, incrementFavorites, incrementShares } from '@/lib/socialCounts'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { ReviewDrawer } from './ReviewDrawer'
import type { ProductCardData } from '../ProductCard'
import styles from './MobileFeed.module.css'

interface MobileFeedSlideProps {
  product: ProductCardData
  isActive: boolean
  onAddToCart?: (productId: string) => void
}

const SWIPE_THRESHOLD = 60

export function MobileFeedSlide({ product, isActive, onAddToCart }: MobileFeedSlideProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [favorites, setFavorites] = useState(20)
  const [shares, setShares] = useState(100)
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  const isFavorited = isFavorite(product.id)

const imageUrls: string[] = product.images?.length ? product.images : [product.imageUrl]
const allMedia = product.videoUrl
  ? [{ type: 'video' as const, url: product.videoUrl }, ...imageUrls.map(u => ({ type: 'image' as const, url: u }))]
  : imageUrls.map(u => ({ type: 'image' as const, url: u }))

const [activeMediaIndex, setActiveMediaIndex] = useState(0)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isDragging = useRef(false)
  const dragOffsetX = useRef(0)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const counts = getSocialCounts(product.id)
    setFavorites(counts.favorites)
    setShares(counts.shares)
  }, [product.id])

  useEffect(() => {
    setActiveMediaIndex(0)
  }, [product.id, product.videoUrl])

  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (!videoRef.current || !product.videoUrl) return
    if (isActive && activeMediaIndex === 0) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
    }
  }, [isActive, activeMediaIndex, product.videoUrl])

  const optimizedImage = isActive
    ? getImageUrl(product.imageUrl, { width: 500, quality: 80 })
    : getImageUrl(product.imageUrl, { width: 300, quality: 60 })

  const goToIndex = useCallback((index: number, animated: boolean) => {
    if (!stripRef.current) return
    stripRef.current.style.transition = animated ? 'transform 0.35s cubic-bezier(0.15, 0.75, 0.25, 1)' : 'none'
    stripRef.current.style.transform = `translateX(${-index * 100}vw)`
  }, [])

  useEffect(() => {
    goToIndex(activeMediaIndex, true)
  }, [activeMediaIndex, goToIndex])

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
        stripRef.current.style.transform = `translateX(${(-activeMediaIndex * 100) + (dx / window.innerWidth * 100)}vw)`
      }
    }
  }

  function handleTouchEnd() {
    if (!isDragging.current) return

    const dx = dragOffsetX.current

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx > 0 && activeMediaIndex > 0) {
        setActiveMediaIndex((prev) => prev - 1)
      } else if (dx < 0 && activeMediaIndex < allMedia.length - 1) {
        setActiveMediaIndex((prev) => prev + 1)
      } else {
        goToIndex(activeMediaIndex, true)
      }
    } else {
      goToIndex(activeMediaIndex, true)
    }

    isDragging.current = false
    dragOffsetX.current = 0
  }

  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeMediaIndex > 0) setActiveMediaIndex((prev) => prev - 1)
  }, [activeMediaIndex])

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeMediaIndex < allMedia.length - 1) setActiveMediaIndex((prev) => prev + 1)
  }, [activeMediaIndex, allMedia.length])

  function handleToggleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isFavorited && canIncrementSocialCount(product.id)) {
      const newFavs = incrementFavorites(product.id)
      setFavorites(newFavs)
    }
    toggleFavorite({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      currency: product.currency,
      imageUrl: product.imageUrl,
      vendorName: product.vendor.name,
      originCountry: product.origin.country,
      originRegion: product.origin.region,
    })
  }

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation()
    if (!canIncrementSocialCount(product.id)) return
    const newShares = incrementShares(product.id)
    setShares(newShares)
    const shareData = {
      title: product.title,
      text: `Descubre ${product.title} en Cafe Seleccion`,
      url: `${window.location.origin}/productos/${product.slug}`,
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share(shareData).catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url)
    }
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    if (isAdding) return
    setIsAdding(true)
    if (onAddToCart) {
      await onAddToCart(product.id)
    } else {
      addToCart({
        id: product.id,
        productId: product.id,
        title: product.title,
        priceInCents: product.price,
        currency: product.currency,
        imageUrl: product.imageUrl,
      })
    }
    setIsAdding(false)
  }

  return (
    <div className={styles.slide}>
      <div
        className={styles.imageContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.imageStrip} ref={stripRef}>
          {allMedia.map((media, idx) => (
            <div key={idx} className={styles.imageStripItem}>
              {media.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={media.url}
                  muted
                  loop
                  playsInline
                  className={styles.image}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Image
                  src={getImageUrl(media.url, { width: 500, quality: 80 })}
                  alt={idx === 0 ? product.imageAlt : `${product.title} - Imagen ${idx + 1}`}
                  fill
                  priority={isActive && idx === 0}
                  className={styles.image}
                  sizes="100vw"
                />
              )}
            </div>
          ))}
        </div>

        {allMedia.length > 1 && (
          <>
            {activeMediaIndex > 0 && (
              <button
                className={`${styles.navArrow} ${styles.navArrowLeft}`}
                onClick={handlePrevImage}
                aria-label="Anterior"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {activeMediaIndex < allMedia.length - 1 && (
              <button
                className={`${styles.navArrow} ${styles.navArrowRight}`}
                onClick={handleNextImage}
                aria-label="Siguiente"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </>
        )}
        <div className={styles.overlayTop} />
        <div className={styles.overlayBottom} />
      </div>

      {allMedia.length > 1 && (
        <div className={styles.imageDots}>
          {allMedia.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.imageDot} ${idx === activeMediaIndex ? styles.imageDotActive : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(idx) }}
              aria-label={`Media ${idx + 1} de ${allMedia.length}`}
            />
          ))}
        </div>
      )}

      <div className={styles.header}>
        <Link href={`/tostadores/${product.vendor.name.toLowerCase()}`} className={styles.vendorBadge}>
          <div className={styles.vendorAvatar}>
            {product.vendor.name.charAt(0)}
          </div>
          {product.vendor.name}
        </Link>
      </div>

      <div className={styles.actionsSidebar}>
        <button 
          className={`${styles.actionButton} ${isFavorited ? styles.favorited : ''}`}
          onClick={handleToggleFavorite}
        >
          <div className={styles.actionIconBox}>
            <Heart fill={isFavorited ? 'currentColor' : 'none'} size={24} />
          </div>
          <span className={styles.actionLabel}>{favorites}</span>
        </button>

        <button className={styles.actionButton} onClick={(e) => { e.stopPropagation(); setReviewsOpen(true) }}>
          <div className={styles.actionIconBox}>
            <MessageCircle size={24} />
          </div>
          <span className={styles.actionLabel}>Ver</span>
        </button>

        <button className={styles.actionButton} onClick={handleShare}>
          <div className={styles.actionIconBox}>
            <Share2 size={24} />
          </div>
          <span className={styles.actionLabel}>{shares}</span>
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.tags}>
          {product.cuppingScore && (
            <span className={`${styles.tag} ${styles.score}`}>SCA {product.cuppingScore}</span>
          )}
          {product.flavorNotes.slice(0, 2).map((note) => (
            <span key={note} className={styles.tag}>{note}</span>
          ))}
        </div>

        <Link href={`/productos/${product.slug}`} style={{ textDecoration: 'none' }}>
          <h2 className={styles.title}>{product.title}</h2>
          
          <div className={styles.origin}>
            <MapPin size={14} />
            {product.origin.region ? `${product.origin.region}, ` : ''}{product.origin.country}
          </div>

          <p className={styles.description}>
            {product.shortDescription || product.category || `Tueste ${product.roastLevel === 'light' ? 'ligero' : product.roastLevel === 'medium' ? 'medio' : 'oscuro'} perfecto para resaltar las notas de origen.`}
          </p>
        </Link>

        <div className={styles.buySection}>
          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatPrice(product.price, product.currency)}</span>
          </div>
          <button 
            className={styles.buyButton}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            <ShoppingBag size={18} />
            {isAdding ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>

      <ReviewDrawer
        isOpen={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        productName={product.title}
      />
    </div>
  )
}