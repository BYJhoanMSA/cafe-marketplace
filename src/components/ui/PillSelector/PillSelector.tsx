'use client'

import type { PillSelectorProps } from './PillSelector.types'
import styles from './PillSelector.module.css'

export function PillSelector({ items, activeId, onSelect, className }: PillSelectorProps) {
  const handleClick = (item: PillSelectorProps['items'][number]) => {
    if (onSelect) {
      onSelect(item)
    } else if (item.href) {
      window.location.href = item.href
    }
  }

  return (
    <div className={`${styles.container}${className ? ` ${className}` : ''}`} role="group" aria-label="Seleccionar">
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            className={`${styles.pill}${isActive ? ` ${styles.active}` : ''}`}
            onClick={() => handleClick(item)}
            aria-label={item.label}
            aria-pressed={isActive}
            disabled={item.disabled}
            type="button"
          >
            <img src={item.icon} alt={item.label} width={50} height={50} />
            <span className={styles.label}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
