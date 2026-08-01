'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, MapPin, ShoppingBag } from 'lucide-react'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { Drawer } from '@/components/ui/Drawer/Drawer'
import type { ProductCardData } from '../ProductCard'
import styles from './ProductDrawer.module.css'

interface ProductDrawerProps {
  isOpen: boolean
  onClose: () => void
  product: ProductCardData
  onAddToCart?: (productId: string) => void
}

export function ProductDrawer({ isOpen, onClose, product, onAddToCart }: ProductDrawerProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  async function handleAddToCart() {
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
    <Drawer isOpen={isOpen} onClose={onClose} title={product.title} position="bottom">
      <div className={styles.wrap}>
        <div className={styles.imageWrap}>
          <Image
            src={getImageUrl(product.imageUrl, { width: 800 })}
            alt={product.imageAlt}
            fill
            className={styles.image}
            sizes="100vw"
          />
        </div>

        <div className={styles.tags}>
          {product.cuppingScore && (
            <span className={`${styles.tag} ${styles.score}`}>SCA {product.cuppingScore}</span>
          )}
          {product.flavorNotes.slice(0, 2).map((note) => (
            <span key={note} className={styles.tag}>{note}</span>
          ))}
        </div>

        <div className={styles.origin}>
          <MapPin size={14} />
          {product.origin.region ? `${product.origin.region}, ` : ''}{product.origin.country}
        </div>

        <p className={styles.description}>
          {product.shortDescription || product.category || `Tueste ${product.roastLevel === 'light' ? 'ligero' : product.roastLevel === 'medium' ? 'medio' : 'oscuro'} perfecto para resaltar las notas de origen.`}
        </p>

        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatPrice(product.price, product.currency)}</span>
            {product.comparePrice != null && product.comparePrice > product.price && (
              <span className={styles.comparePrice}>{formatPrice(product.comparePrice, product.currency)}</span>
            )}
          </div>
          <button
            type="button"
            className={styles.buyButton}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            <ShoppingBag size={18} />
            {isAdding ? 'Agregando...' : 'Agregar al carrito'}
          </button>
        </div>

        <Link className={styles.fullLink} href={`/productos/${product.slug}`} onClick={onClose}>
          Ver ficha completa
          <ArrowRight size={16} />
        </Link>
      </div>
    </Drawer>
  )
}
