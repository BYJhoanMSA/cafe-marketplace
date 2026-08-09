'use client'

// src/components/product/ProductQuickView/ProductQuickView.tsx
// Vista rápida: abre un modal con la info clave del producto desde el
// catálogo (desktop) sin salir de la página.

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { LogoCafeIcon } from '@/components/ui/Icons/NavIcons'
import { formatPrice, getImageUrl } from '@/lib/utils'
import type { ProductCardData } from '@/components/product/ProductCard'
import styles from './ProductQuickView.module.css'

interface ProductQuickViewProps {
  product: ProductCardData
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (productId: string) => void
}

export function ProductQuickView({ product, isOpen, onClose, onAddToCart }: ProductQuickViewProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  async function handleAddToCart() {
    if (isAddingToCart) return
    setIsAddingToCart(true)
    await onAddToCart?.(product.id)
    setIsAddingToCart(false)
  }

  const hasDiscount = product.comparePrice && product.comparePrice > product.price

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.title} size="lg">
      <div className={styles.layout}>
        {/* ---- Imagen ---- */}
        <div className={styles.imageWrapper}>
          <Image
            src={getImageUrl(product.imageUrl, { width: 600 })}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={styles.image}
          />

          {product.cuppingScore && (
            <div className={styles.cuppingScore} aria-label={`Cupping score: ${product.cuppingScore} puntos`}>
              <LogoCafeIcon size={24} strokeWidth={1} /> {product.cuppingScore}
            </div>
          )}
        </div>

        {/* ---- Detalles ---- */}
        <div className={styles.details}>
          <div className={styles.badges}>
            {product.isNew && <Badge variant="gold">Nuevo</Badge>}
            {product.isLimited && <Badge variant="terra">Edición limitada</Badge>}
            {product.isOrganic && <Badge variant="forest">Orgánico</Badge>}
          </div>

          <p className={styles.meta}>
            {product.origin.country}
            {product.origin.region && `, ${product.origin.region}`}
            <span className={styles.metaDot} aria-hidden="true" />
            {product.vendor.name}
          </p>

          <h3 className={styles.title}>{product.title}</h3>

          <div className={styles.priceBlock}>
            {hasDiscount && (
              <span className={styles.comparePrice}>
                {formatPrice(product.comparePrice!, product.currency)}
              </span>
            )}
            <p className={styles.price}>
              {formatPrice(product.price, product.currency)}
            </p>
          </div>

          {product.flavorNotes.length > 0 && (
            <div className={styles.flavorNotes} aria-label="Notas de sabor">
              {product.flavorNotes.map((note) => (
                <Badge key={note} variant="default">
                  {note}
                </Badge>
              ))}
            </div>
          )}

          {product.shortDescription && (
            <p className={styles.description}>{product.shortDescription}</p>
          )}

          <div className={styles.actions}>
            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              aria-label={`Agregar ${product.title} al carrito`}
            >
              <ShoppingBag size={18} />
              {isAddingToCart ? 'Agregando…' : 'Agregar al carrito'}
            </button>

            <Link href={`/productos/${product.slug}`} className={styles.fullLink} onClick={onClose}>
              Ver ficha completa →
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  )
}
