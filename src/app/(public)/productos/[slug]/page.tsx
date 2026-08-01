'use client'

// src/app/(public)/productos/[slug]/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useCallback, use } from 'react'
import { Star, Heart, Share2, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { LogoCafeIcon } from '@/components/ui/Icons/NavIcons'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { canIncrementSocialCount } from '@/lib/rateLimit'
import { getSocialCounts, incrementShares } from '@/lib/socialCounts'
import { getProductBySlug } from '@/server/actions/catalog.actions'
import type { ProductDetail, ProductGrindOption, ProductVariant } from '@/server/actions/catalog.actions'
import { EscudoDatos, CartaTostador, EscudoCompra } from '@/components/product/EscudoDatos'
import styles from './page.module.css'

interface SelectedVariant {
  id?: string
  weightGrams: number | null
  grindType?: string | null
  price: number
  sizeValue?: string
  label?: string
}

const FALLBACK_PRODUCT: ProductDetail = {
  id: '',
  slug: '',
  title: 'Producto no encontrado',
  vendor: { name: '', slug: '' },
  price: 0,
  comparePrice: null,
  currency: 'USD',
  description: 'Este producto no está disponible actualmente.',
  cuppingScore: null,
  roastLevel: 'medium',
  origin: { country: '', region: '', farm: '' },
  process: '',
  variety: '',
  elevation: '',
  flavorNotes: [],
  images: ['/images/products/placeholder-1.jpg'],
  category: '',
  sizeOptions: [],
  variants: [],
  grindOptions: [],
  rating: 0,
  reviewCount: 0,
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getProductBySlug(slug)
      setProduct(data || { ...FALLBACK_PRODUCT, slug, id: slug })
      setLoading(false)
    }
    load()
  }, [slug])

  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant | null>(null)
  const [selectedGrind, setSelectedGrind] = useState<ProductGrindOption | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [favorites, setFavorites] = useState(20)
  const [shares, setShares] = useState(0)

  useEffect(() => {
    const counts = getSocialCounts(slug)
    setFavorites(counts.favorites)
    setShares(counts.shares)
  }, [slug])

  const findVariant = useCallback(
    (weightGrams: number | null, grindType: string | null): ProductVariant | null => {
      return product?.variants?.find((v) => v.weightGrams === weightGrams && v.grindType === grindType) ?? null
    },
    [product]
  )

  useEffect(() => {
    if (!product) return
    setActiveImage(0)
    const firstSize = product.sizeOptions.find((s) => s.available) || null
    const firstGrind = product.grindOptions.find((g) => g.available) || null
    const match = firstSize && firstGrind ? findVariant(firstSize.weightGrams, firstGrind.id) : null
    setSelectedVariant(
      match || firstSize
        ? {
            id: match?.id ?? firstSize?.value ?? '',
            weightGrams: match?.weightGrams ?? firstSize?.weightGrams ?? null,
            grindType: match?.grindType ?? null,
            price: match?.price ?? firstSize?.price ?? 0,
            sizeValue: firstSize?.value,
            label: firstSize?.label,
          }
        : null
    )
    setSelectedGrind(firstGrind)
    setQuantity(1)
    setFavorites(20)
    setShares(100)
  }, [product, findVariant])

  const { addToCart } = useCart()

  if (loading || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando producto...</div>
      </div>
    )
  }

  if (!product.id) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>Producto no encontrado</div>
      </div>
    )
  }

  const handleSelectSize = (sizeValue: string) => {
    const size = product.sizeOptions.find((s) => s.value === sizeValue)
    if (!size) return
    const match = findVariant(size.weightGrams, selectedGrind?.id ?? null)
    setSelectedVariant(match || size ? { ...match, ...size, id: match?.id ?? `size-${sizeValue}`, sizeValue } : null)
  }

  const handleSelectGrind = (grindId: string) => {
    const grind = product.grindOptions.find((g) => g.id === grindId)
    if (!grind) return
    setSelectedGrind(grind)
    const currentSize = selectedVariant?.weightGrams ?? product.sizeOptions.find((s) => s.available)?.weightGrams ?? null
    const match = findVariant(currentSize, grindId)
    setSelectedVariant(match ?? { price: selectedVariant?.price ?? product.price, weightGrams: currentSize })
  }

  const handleShare = () => {
    if (!canIncrementSocialCount(product.id)) return
    const newShares = incrementShares(product.id)
    setShares(newShares)
    const shareData = {
      title: product.title,
      text: `Descubre ${product.title} en Cafe Seleccion`,
      url: window.location.href,
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share(shareData).catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedGrind) return
    addToCart(
      {
        id: `${product.id}-${selectedVariant.id ?? selectedVariant.sizeValue}-${selectedGrind.id}`,
        productId: product.id,
        variantId: selectedVariant.id ?? selectedVariant.sizeValue ?? '',
        title: product.title,
        variantTitle: `${selectedVariant.label || selectedVariant.sizeValue || ''} • ${selectedGrind.label}`,
        priceInCents: selectedVariant.price,
        currency: product.currency,
        imageUrl: product.images[0] ?? '',
      },
      quantity
    )
  }
  
  const hasDiscount = product.comparePrice && product.comparePrice > (selectedVariant?.price ?? product.price)

  const handleQuantityChange = (delta: number) => {
    const newVal = quantity + delta
    if (newVal >= 1 && newVal <= 10) setQuantity(newVal)
  }

  return (
    <div key={product.id} className={styles.container}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link 
          href="/catalogo" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-ink-secondary)',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
          }}
        >
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>
      </div>

      {/* GALERÍA */}
      <section className={styles.gallery} aria-label="Galería de imágenes">
        <div className={styles.mainImageWrapper}>
          <Image
            src={product.images[activeImage] || product.images[0] || ''}
            alt={`${product.title} - Imagen ${activeImage + 1}`}
            fill
            priority
            className={styles.mainImage}
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        </div>
        <div className={styles.thumbnailGrid}>
          {product.images.map((img: string, idx: number) => (
            <button
              key={idx}
              className={`${styles.thumbnailWrapper} ${activeImage === idx ? styles.active : ''}`}
              onClick={() => setActiveImage(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              aria-pressed={activeImage === idx}
            >
              <Image
                src={img}
                alt=""
                fill
                className={styles.thumbnail}
                sizes="150px"
              />
            </button>
          ))}
        </div>
      </section>

      {/* DETALLES Y COMPRA */}
      <section className={styles.details} aria-label="Detalles del producto">
        <div className={styles.header}>
          <span className={styles.vendor}>
            {product.vendor.name}
          </span>
          <h1 className={styles.title}>{product.title}</h1>
          
          <div className={styles.meta}>
            {product.cuppingScore && (
              <Badge variant="gold" icon={<LogoCafeIcon size={28} strokeWidth={1} />}>
                SCA {product.cuppingScore}
              </Badge>
            )}
            <div className={styles.metaItem} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Heart size={14} fill="var(--terra-500)" color="var(--terra-500)" />
                <span style={{ color: 'var(--terra-600)', fontWeight: 'var(--font-weight-bold)' }}>{favorites}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} fill="var(--gold-500)" color="var(--gold-500)" />
                <span style={{ color: 'var(--gold-600)', fontWeight: 'var(--font-weight-bold)' }}>{shares}</span>
              </span>
              <button
                onClick={handleShare}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-ink-tertiary)', padding: '2px 4px',
                  display: 'inline-flex', alignItems: 'center',
                }}
                title="Compartir producto"
                aria-label="Compartir producto"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>

          {product.category && (
            <div style={{
              marginTop: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: product.category === 'Café Orgánico' ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
              color: product.category === 'Café Orgánico' ? 'var(--forest-600)' : 'var(--color-ink-secondary)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span>{product.category === 'Café Orgánico' ? '🌱' : <LogoCafeIcon size={32} strokeWidth={1} />}</span>
              {product.category}
            </div>
          )}
          
          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatPrice(selectedVariant?.price ?? product.price, product.currency)}</span>
            {hasDiscount && (
              <span className={styles.comparePrice}>{formatPrice(product.comparePrice!, product.currency)}</span>
            )}
          </div>
        </div>

        {/* ============================================================
            ESCUDO DE DATOS — VERSIÓN PREVIEW (reversible)
            Replica de styledk/producto.html. Para revertir: eliminar
            este bloque y borrar src/components/product/EscudoDatos.
            ============================================================ */}
        <h2 className={styles.caracteristicasTitle}>Características</h2>
        <EscudoDatos
          data={[
            {
              label: 'Origen',
              value: `${product.origin.country}${product.origin.region ? `, ${product.origin.region}` : ''}`,
            },
            ...(product.origin.farm ? [{ label: 'Finca', value: product.origin.farm }] : []),
            { label: 'Variedad', value: product.variety },
            { label: 'Elevación', value: product.elevation },
            { label: 'Proceso', value: product.process },
            {
              label: 'Tueste',
              value:
                product.roastLevel === 'light'
                  ? 'Ligero'
                  : product.roastLevel === 'medium'
                    ? 'Medio'
                    : 'Oscuro',
            },
            ...(product.cuppingScore
              ? [{ label: 'Puntuación', value: `${product.cuppingScore} puntos SCA` }]
              : []),
            { label: 'Notas', value: product.flavorNotes.join(', ') },
          ]}
        />

        {/* CARTA DEL TOSTADOR — VERSIÓN PREVIEW (reversible) */}
        <CartaTostador text={product.description} roaster={product.vendor.name} />

        {/* SECCIÓN DE COMPRA — VERSIÓN PREVIEW (reversible) */}
        {selectedVariant && selectedGrind && (
          <EscudoCompra
            sizes={product.sizeOptions}
            grinds={product.grindOptions}
            selectedSizeValue={selectedVariant?.sizeValue}
            selectedGrindId={selectedGrind?.id}
            quantity={quantity}
            price={selectedVariant?.price ?? product.price}
            currency={product.currency}
            onSelectSize={handleSelectSize}
            onSelectGrind={handleSelectGrind}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* CARACTERÍSTICAS */}
        <div className={styles.features}>
          <div className={styles.featureItem}>
            <span className={styles.featureLabel}>Origen</span>
            <span className={styles.featureValue}>{product.origin.country}{product.origin.region ? `, ${product.origin.region}` : ''}</span>
          </div>
          {product.origin.farm && (
            <div className={styles.featureItem}>
              <span className={styles.featureLabel}>Finca</span>
              <span className={styles.featureValue}>{product.origin.farm}</span>
            </div>
          )}
          <div className={styles.featureItem}>
            <span className={styles.featureLabel}>Proceso</span>
            <span className={styles.featureValue}>{product.process}</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureLabel}>Variedad</span>
            <span className={styles.featureValue}>{product.variety}</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureLabel}>Elevación</span>
            <span className={styles.featureValue}>{product.elevation}</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureLabel}>Tueste</span>
            <span className={styles.featureValue}>
              {product.roastLevel === 'light' ? 'Ligero' : product.roastLevel === 'medium' ? 'Medio' : 'Oscuro'}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
