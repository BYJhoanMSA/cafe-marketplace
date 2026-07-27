'use client'

// src/components/cart/CartDrawer.tsx
import Image from 'next/image'
import { Drawer } from '@/components/ui/Drawer/Drawer'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { useCart } from '@/context/CartContext'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'
import { formatPrice } from '@/lib/utils'
import { Trash2, ShoppingBag } from 'lucide-react'
import { LogoCafeIcon } from '@/components/ui/Icons/NavIcons'
import styles from './CartDrawer.module.css'

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotalInCents,
  } = useCart()

  const currency = items[0]?.currency || 'USD'
  const whatsappUrl = buildWhatsAppOrderUrl(items, subtotalInCents, currency)

  return (
    <Drawer isOpen={isCartOpen} onClose={closeCart} title="Tu Carrito de Compras" position="right">
      <div className={styles.container}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><LogoCafeIcon size={112} strokeWidth={1} /></span>
            <h3 className={styles.emptyTitle}>Tu carrito está vacío</h3>
            <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)' }}>
              Explora nuestra selección de granos de especialidad y añade tus favoritos.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={60}
                      height={60}
                      className={styles.itemImage}
                    />
                  ) : (
                    <div className={styles.itemImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={24} style={{ color: 'var(--color-ink-tertiary)' }} />
                    </div>
                  )}

                  <div className={styles.itemDetails}>
                    <span className={item.deleted ? styles.itemTitleDeleted : styles.itemTitle}>
                      {item.deleted ? 'Producto eliminado' : item.title}
                    </span>
                    {item.deleted ? (
                      <span className={styles.itemVariantDeleted}>Este producto ya no está disponible</span>
                    ) : (
                      <>
                        {item.variantTitle && (
                          <span className={styles.itemVariant}>{item.variantTitle}</span>
                        )}
                        <span className={styles.itemPrice}>
                          {formatPrice(item.priceInCents * item.quantity, item.currency)}
                        </span>
                      </>
                    )}
                  </div>

                  <div className={styles.itemActions}>
                    {!item.deleted && (
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(qty) => updateQuantity(item.id, qty)}
                        min={1}
                        max={99}
                      />
                    )}
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.id)}
                      title="Eliminar producto"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Total Estimado:</span>
                <span className={styles.summaryTotal}>
                  {formatPrice(subtotalInCents, currency)}
                </span>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                {/* SVG Icon de WhatsApp */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Pagar Pedido (WhatsApp)
              </a>
            </div>
          </>
        )}
      </div>
    </Drawer>
  )
}
