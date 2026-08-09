'use client'

// src/components/product/ProductCard/ProductCard.tsx
// Card de producto para la vista de catálogo desktop.
// Mobile usa MobileProductSlide (feed TikTok vertical).

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, ShoppingBag, Star, Share2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { LogoCafeIcon } from '@/components/ui/Icons/NavIcons'
import { formatPrice, truncate, getImageUrl } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { incrementSocialCount } from '@/server/actions/social.actions'
import { ProductQuickView } from '@/components/product/ProductQuickView'
import styles from './ProductCard.module.css'

// ================================================================
// Tipos
// ================================================================
export interface ProductCardData {
  id: string
  slug: string
  title: string
  shortDescription?: string | null
  imageUrl: string
  imageAlt: string
  images: string[]
  origin: {
    country: string
    region?: string | null
  }
  vendor: {
    name: string
  }
  price: number        // en centavos
  comparePrice?: number | null // en centavos
  currency: string
  roastLevel: string
  cuppingScore?: number | null
  avgRating: number
  reviewCount: number
  flavorNotes: string[]
  isNew?: boolean
  isLimited?: boolean
  isOrganic?: boolean
  category?: string | null
  isFavorited?: boolean
  sharesCount?: number
  favoritesCount?: number
}

interface ProductCardProps {
  product: ProductCardData
  onAddToCart?: (productId: string) => void
  onToggleFavorite?: (productId: string) => void
  priority?: boolean // Para LCP — solo para las primeras cards
}

// ================================================================
// Helpers
// ================================================================
function RoastLevelLabel({ level }: { level: string }) {
  const labels: Record<string, string> = {
    'light': 'Ligero',
    'medium-light': 'Med. Ligero',
    'medium': 'Medio',
    'medium-dark': 'Med. Oscuro',
    'dark': 'Oscuro',
  }
  return <>{labels[level] ?? level}</>
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
          stroke={star <= Math.round(rating) ? 'currentColor' : 'var(--neutral-300)'}
        />
      ))}
    </span>
  )
}

// ================================================================
// Componente principal
// ================================================================
export function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  priority = false,
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  const isFavorited = isFavorite(product.id)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [favorites, setFavorites] = useState(product.favoritesCount ?? 0)
  const [shares, setShares] = useState(product.sharesCount ?? 0)
  const [sharedToast, setSharedToast] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  useEffect(() => {
    setFavorites(product.favoritesCount ?? 0)
    setShares(product.sharesCount ?? 0)
  }, [product.id, product.favoritesCount, product.sharesCount])

  const hasDiscount = product.comparePrice && product.comparePrice > product.price

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault() // Evitar navegación (la card es un link)
    e.stopPropagation()
    if (isAddingToCart) return
    setIsAddingToCart(true)

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

    setIsAddingToCart(false)
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const shareData = {
      title: product.title,
      text: `Descubre ${product.title} en Cafe Seleccion`,
      url: typeof window !== 'undefined' ? window.location.origin + `/productos/${product.slug}` : '',
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share(shareData).catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url)
      setSharedToast(true)
      setTimeout(() => setSharedToast(false), 2000)
    }

    incrementSocialCount(product.id, 'shares').then((res) => {
      setShares(res.count)
    })
  }

  async function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isFavorited) {
      incrementSocialCount(product.id, 'favorites').then((res) => {
        setFavorites(res.count)
      })
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
    await onToggleFavorite?.(product.id)
  }

  return (
    <Link
      href={`/productos/${product.slug}`}
      className={styles.card}
      aria-label={`Ver ${product.title}`}
    >
      {/* ---- IMAGEN ---- */}
      <div className={styles.imageWrapper}>
        <Image
          src={getImageUrl(product.imageUrl, { width: 400 })}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.image}
          priority={priority}
        />

        {/* Badges superiores */}
        <div className={styles.imageBadges}>
          <div className={styles.badgeGroup}>
            {product.isNew && <Badge variant="gold">Nuevo</Badge>}
            {product.isLimited && <Badge variant="terra">Edición limitada</Badge>}
            {product.isOrganic && <Badge variant="forest">Orgánico</Badge>}
          </div>
        </div>

        {/* Botón de favorito */}
        <button
          className={`${styles.favoriteButton} ${isFavorited ? styles.isFavorited : ''}`}
          onClick={handleToggleFavorite}
          aria-label={isFavorited ? `Quitar ${product.title} de favoritos` : `Agregar ${product.title} a favoritos`}
          aria-pressed={isFavorited}
        >
          <Heart
            size={16}
            fill={isFavorited ? 'currentColor' : 'none'}
            strokeWidth={2}
          />
        </button>

        {/* Cupping score */}
        {product.cuppingScore && (
          <div className={styles.cuppingScore} aria-label={`Cupping score: ${product.cuppingScore} puntos`}>
            <LogoCafeIcon size={28} strokeWidth={1} /> {product.cuppingScore}
          </div>
        )}
      </div>

      {/* ---- CONTENIDO ---- */}
      <div className={styles.content}>
        {/* Origen + Tostador */}
        <div className={styles.meta}>
          <span className={styles.origin}>
            {product.origin.country}
            {product.origin.region && `, ${product.origin.region}`}
          </span>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.vendor}>{product.vendor.name}</span>
        </div>

        {/* Nombre */}
        <h3 className={styles.title}>
          {product.title}
        </h3>

        {/* Notas de sabor */}
        {product.flavorNotes.length > 0 && (
          <div className={styles.flavorNotes} aria-label="Notas de sabor">
            {product.flavorNotes.slice(0, 3).map((note) => (
              <Badge key={note} variant="default">
                {note}
              </Badge>
            ))}
          </div>
        )}

        {/* Métrica Social */}
        <div className={styles.socialMetrics}>
          <div className={styles.metricGroup}>
            <span className={styles.metric}>
              <Heart size={12} fill="currentColor" strokeWidth={2} className={styles.metricFavorites} />
              <span className={`${styles.metricValue} ${styles.metricFavorites}`}>{favorites}</span>
            </span>
            <span className={styles.metric}>
              <Star size={12} fill="currentColor" strokeWidth={2} className={styles.metricShares} />
              <span className={`${styles.metricValue} ${styles.metricShares}`}>{shares}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className={styles.shareButton}
            title="Compartir producto"
            aria-label="Compartir producto"
          >
            <Share2 size={14} />
            {sharedToast ? '¡Copiado!' : ''}
          </button>
        </div>
      </div>

      {/* ---- FOOTER: Precio + CTA ---- */}
      <div className={styles.footer}>
        <div className={styles.priceBlock}>
          {hasDiscount && (
            <span className={styles.comparePrice}>
              {formatPrice(product.comparePrice!, product.currency)}
            </span>
          )}
          <p className={styles.price}>
            {formatPrice(product.price, product.currency)}
          </p>
          <span className={styles.priceLabel}>
            <RoastLevelLabel level={product.roastLevel} />
          </span>
        </div>

        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.quickViewButton}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setQuickViewOpen(true)
            }}
            aria-label={`Vista rápida de ${product.title}`}
            title="Vista rápida"
          >
            <Eye size={16} />
          </button>

          <button
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            aria-label={`Agregar ${product.title} al carrito`}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>

      <ProductQuickView
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onAddToCart={onAddToCart}
      />
    </Link>
  )
}

// ================================================================
// SKELETON — Para loading states sin CLS
// ================================================================
export function ProductCardSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Cargando producto">
      <div className={`${styles.skeletonImage} skeleton`} />
      <div className={styles.skeletonContent}>
        <div className="skeleton" style={{ height: '12px', width: '60%' }} />
        <div className="skeleton" style={{ height: '22px', width: '90%' }} />
        <div className="skeleton" style={{ height: '22px', width: '70%' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="skeleton" style={{ height: '20px', width: '60px', borderRadius: '999px' }} />
          <div className="skeleton" style={{ height: '20px', width: '70px', borderRadius: '999px' }} />
        </div>
        <div className="skeleton" style={{ height: '14px', width: '40%' }} />
      </div>
    </div>
  )
}
