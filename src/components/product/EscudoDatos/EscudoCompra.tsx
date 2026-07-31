'use client'

// src/components/product/EscudoDatos/EscudoCompra.tsx
// VERSIÓN PREVIEW (reversible) — Escudo de compra replicado de styledk/producto.html:
// tondos de cata para tamaños y moliendas + reserva (cantidad y botón dorado).

import styles from './EscudoDatos.module.css'
import { formatPrice } from '@/lib/utils'

export interface EscudoSizeOption {
  value: string
  label: string
  weightGrams: number | null
  price: number
  available?: boolean
}

export interface EscudoGrindOption {
  id: string
  label: string
  available?: boolean
}

interface EscudoCompraProps {
  sizes: EscudoSizeOption[]
  grinds: EscudoGrindOption[]
  selectedSizeValue?: string
  selectedGrindId?: string
  quantity: number
  price: number
  currency: string
  onSelectSize: (value: string) => void
  onSelectGrind: (id: string) => void
  onQuantityChange: (delta: number) => void
  onAddToCart: () => void
}

function BeanGlyph({ double = false, size = 26 }: { double?: boolean; size?: number }) {
  return double ? (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 34"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      className={styles.tondoGlyph}
      aria-hidden="true"
    >
      <ellipse cx="14" cy="17" rx="10" ry="13" />
      <path d="M14 5 Q9 16 14 29" />
      <ellipse cx="42" cy="17" rx="10" ry="13" />
      <path d="M42 5 Q37 16 42 29" />
    </svg>
  ) : (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 34"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={styles.tondoGlyph}
      aria-hidden="true"
    >
      <ellipse cx="14" cy="17" rx="10" ry="13" />
      <path d="M14 5 Q9 16 14 29" />
    </svg>
  )
}

export function EscudoCompra({
  sizes,
  grinds,
  selectedSizeValue,
  selectedGrindId,
  quantity,
  price,
  currency,
  onSelectSize,
  onSelectGrind,
  onQuantityChange,
  onAddToCart,
}: EscudoCompraProps) {
  const availableSizes = sizes.filter((s) => s.available !== false)
  const availableGrinds = grinds.filter((g) => g.available !== false)
  const activeSizeValue = selectedSizeValue ?? (availableSizes.length === 1 ? availableSizes[0]?.value : undefined)
  const activeGrindId = selectedGrindId ?? (availableGrinds.length === 1 ? availableGrinds[0]?.id : undefined)

  return (
    <div className={styles.escudoCompra}>
      {/* Grupo 1 — Tamaños */}
      <div className={styles.tondosGroup}>
        <p className={styles.tondosTitle}>Tamaño</p>
        <div className={styles.tondosRow}>
          {sizes.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`${styles.tondo} ${s.available === false ? styles.tondoDisabled : ''} ${activeSizeValue === s.value ? styles.tondoActive : ''}`}
              onClick={() => onSelectSize(s.value)}
              disabled={s.available === false}
              aria-pressed={activeSizeValue === s.value}
              aria-disabled={s.available === false}
            >
              <BeanGlyph size={20} />
              <strong>{s.label}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Grupo 2 — Moliendas */}
      <div className={styles.tondosGroup}>
        <p className={styles.tondosTitle}>Molienda</p>
        <div className={styles.tondosRow}>
          {grinds.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`${styles.tondo} ${g.available === false ? styles.tondoDisabled : ''} ${activeGrindId === g.id ? styles.tondoActive : ''}`}
              onClick={() => onSelectGrind(g.id)}
              disabled={g.available === false}
              aria-pressed={activeGrindId === g.id}
              aria-disabled={g.available === false}
            >
              <BeanGlyph size={20} double />
              <strong>{g.label}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Reserva — cantidad + precio + botón */}
      <div className={styles.reserva}>
        <div className={styles.reservaField}>
          <label htmlFor="cantidad-obra">Cantidad</label>
          <div className={styles.reservaCantidad} id="cantidad-obra">
            <button
              type="button"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= 10}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.reservaField}>
          <label htmlFor="precio-obra">Precio</label>
          <span className={styles.reservaPrecio} id="precio-obra">
            {formatPrice(price, currency)}
          </span>
        </div>

        <button type="button" className={styles.reservaBtn} onClick={onAddToCart}>
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}
