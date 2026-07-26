'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { usePillBar } from './PillBarContext'
import { PillSelector } from './PillSelector'
import type { PillItem } from './PillSelector.types'
import styles from './PillBarWrapper.module.css'

export function PillBarWrapper({ items, activeId }: { items: PillItem[]; activeId: string }) {
  const router = useRouter()
  const { isOpen } = usePillBar()
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : items

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className={clsx(styles.bar, !isOpen && styles.hidden)}>
      <div className={styles.searchRow}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="¿Qué experiencia deseas probar?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Buscar por sabor"
        />
      </div>
      <PillSelector items={filtered} activeId={activeId} />
    </div>
  )
}
