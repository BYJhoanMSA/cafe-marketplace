'use client'

import { CoffeeBean } from '@phosphor-icons/react'

const FLAVOR_NOTE_OPTIONS = [
  'Frambuesa', 'Durazno', 'Jazmín', 'Bergamota', 'Limón',
  'Panela', 'Caramelo', 'Manzana', 'Chocolate', 'Mora',
  'Fermentado', 'Cacao', 'Floral', 'Avellanado', 'Cítrico', 'Miel'
]

interface FlavorNotePickerProps {
  selected: string[]
  onToggle: (note: string) => void
}

export function FlavorNotePicker({ selected, onToggle }: FlavorNotePickerProps) {
  return (
    <div style={{
      padding: 'var(--space-5)',
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--color-border-default)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }}>
      <h3 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)' }}>
        <CoffeeBean size={18} weight="fill" /> Perfil Sensorial (Notas de Sabor)
      </h3>
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
        Selecciona las notas que caracterizan este café (se usarán para los filtros del catálogo):
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        {FLAVOR_NOTE_OPTIONS.map((note) => {
          const isSelected = selected.includes(note)
          return (
            <button
              type="button"
              key={note}
              onClick={() => onToggle(note)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-pill)',
                border: isSelected ? '1px solid var(--color-interactive)' : '1px solid var(--color-border-default)',
                backgroundColor: isSelected ? 'var(--color-interactive-light, rgba(37,99,235,0.1))' : 'var(--color-bg-primary)',
                color: isSelected ? 'var(--color-interactive)' : 'var(--color-ink-secondary)',
                fontWeight: isSelected ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
              }}
            >
              {isSelected ? '✓ ' : ''}{note}
            </button>
          )
        })}
      </div>
    </div>
  )
}