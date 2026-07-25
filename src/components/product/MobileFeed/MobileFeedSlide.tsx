'use client'

// src/components/product/MobileFeed/MobileFeedSlide.tsx
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, ShoppingBag, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
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

export function MobileFeedSlide({ product, isActive, onAddToCart }: MobileFeedSlideProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [favorites, setFavorites] = useState(20)
  const [shares, setShares] = useState(100)
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  const isFavorited = isFavorite(product.id)

  useEffect(() => {
    const counts = getSocialCounts(product.id)
    setFavorites(counts.favorites)
    setShares(counts.shares)
  }, [product.id])

  useEffect(() => {
    const counts = getSocialCounts(product.id)
    setFavorites(counts.favorites)
    setShares(counts.shares)
  }, [product.id])

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
      {/* IMAGEN DE FONDO */}
      <div className={styles.imageContainer}>
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          priority={isActive}
          className={styles.image}
          sizes="100vw"
        />
        <div className={styles.overlayTop} />
        <div className={styles.overlayBottom} />
      </div>

      {/* HEADER: Tostador */}
      <div className={styles.header}>
        <Link href={`/tostadores/${product.vendor.name.toLowerCase()}`} className={styles.vendorBadge}>
          <div className={styles.vendorAvatar}>
            {product.vendor.name.charAt(0)}
          </div>
          {product.vendor.name}
        </Link>
      </div>

      {/* SIDEBAR: Acciones estilo TikTok */}
      <div className={styles.actionsSidebar}>
        {/* Favorito */}
        <button 
          className={`${styles.actionButton} ${isFavorited ? styles.favorited : ''}`}
          onClick={handleToggleFavorite}
        >
          <div className={styles.actionIconBox}>
            <Heart fill={isFavorited ? 'currentColor' : 'none'} size={24} />
          </div>
          <span className={styles.actionLabel}>{favorites}</span>
        </button>

        {/* Reseñas */}
        <button className={styles.actionButton} onClick={(e) => { e.stopPropagation(); setReviewsOpen(true) }}>
          <div className={styles.actionIconBox}>
            <MessageCircle size={24} />
          </div>
          <span className={styles.actionLabel}>Ver</span>
        </button>

        {/* Compartir */}
        <button className={styles.actionButton} onClick={handleShare}>
          <div className={styles.actionIconBox}>
            <Share2 size={24} />
          </div>
          <span className={styles.actionLabel}>{shares}</span>
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
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

        {/* BOTÓN DE COMPRA RÁPIDA */}
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
      
      {/* Swipe Horizontal Indicator (Variantes) - Mock visual por ahora */}
      <div className={styles.variantsIndicator}>
        <div className={`${styles.variantDot} ${styles.active}`} />
        <div className={styles.variantDot} />
        <div className={styles.variantDot} />
      </div>

      <ReviewDrawer
        isOpen={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        productName={product.title}
      />
    </div>
  )
}
