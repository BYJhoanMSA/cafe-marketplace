'use client'

// src/app/(public)/favoritos/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/context/FavoritesContext'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Trash2, ArrowLeft } from 'lucide-react'
import { HeartIcon, LogoCafeIcon } from '@/components/ui/Icons/NavIcons'
import styles from './page.module.css'

export default function FavoritosPage() {
  const { favorites, toggleFavorite } = useFavorites()
  const { addToCart } = useCart()

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', minHeight: '70vh' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link 
          href="/catalogo" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-ink-secondary)',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-primary)', color: 'var(--color-ink-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <HeartIcon size={28} stroke="var(--terra-500)" strokeWidth={2} />
          Mis Favoritos ({favorites.length})
        </h1>
        <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-base)' }}>
          Tus cafés de especialidad guardados para comprar después.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-12) var(--space-4)', 
          backgroundColor: 'var(--color-bg-secondary)', 
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-default)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}>
          <LogoCafeIcon size={112} strokeWidth={1} stroke="var(--color-ink-secondary)" />
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: 'var(--text-xl)' }}>Aún no tienes favoritos guardados</h2>
          <p style={{ color: 'var(--color-ink-secondary)', maxWidth: '400px', margin: 0 }}>
            Explora nuestro catálogo de origen y presiona el corazón en los cafés que quieras guardar.
          </p>
          <Link
            href="/catalogo"
            style={{
              padding: 'var(--space-3) var(--space-6)',
              backgroundColor: 'var(--color-interactive)',
              color: 'var(--color-ink-inverted)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-semibold)',
              marginTop: 'var(--space-2)'
            }}
          >
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: 'var(--space-6)' 
        }}>
          {favorites.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border-default)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ position: 'relative', height: '200px', width: '100%' }}>
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <button
                  onClick={() => toggleFavorite(item)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--terra-500)'
                  }}
                  title="Quitar de favoritos"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1, gap: 'var(--space-2)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)', textTransform: 'uppercase' }}>
                  {item.originRegion ? `${item.originRegion}, ` : ''}{item.originCountry} • {item.vendorName}
                </div>
                
                <Link 
                  href={`/productos/${item.slug}`} 
                  style={{ 
                    textDecoration: 'none', 
                    color: 'var(--color-ink-primary)', 
                    fontWeight: 'var(--font-weight-bold)',
                    fontSize: 'var(--text-md)',
                    lineHeight: '1.3'
                  }}
                >
                  {item.title}
                </Link>

                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                    {formatPrice(item.price, item.currency)}
                  </span>

                  <button
                    onClick={() => addToCart({
                      id: item.id,
                      productId: item.id,
                      title: item.title,
                      priceInCents: item.price,
                      currency: item.currency,
                      imageUrl: item.imageUrl,
                    })}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-2) var(--space-4)',
                      backgroundColor: 'var(--color-interactive)',
                      color: 'var(--color-ink-inverted)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--text-xs)',
                      cursor: 'pointer'
                    }}
                  >
                    <ShoppingBag size={14} />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
