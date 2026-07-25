'use client'

import { Tag } from '@phosphor-icons/react'

interface ProductBadgesSectionProps {
  isNew: boolean
  isLimited: boolean
  isOrganic: boolean
  isPublicity: boolean
  onToggle: (key: 'isNew' | 'isLimited' | 'isOrganic' | 'isPublicity') => void
}

export function ProductBadgesSection({ isNew, isLimited, isOrganic, isPublicity, onToggle }: ProductBadgesSectionProps) {
  const badges = [
    { key: 'isNew' as const, label: 'Nuevo', color: 'var(--gold-500)', value: isNew },
    { key: 'isLimited' as const, label: 'Edición limitada', color: 'var(--terra-500)', value: isLimited },
    { key: 'isOrganic' as const, label: 'Orgánico', color: 'var(--forest-500)', value: isOrganic },
    { key: 'isPublicity' as const, label: 'Publicidad', color: 'var(--color-interactive)', value: isPublicity },
  ]

  return (
    <div style={{
      padding: 'var(--space-4) var(--space-5)',
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--color-border-default)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Tag size={16} weight="fill" /> Badges</span>
      {badges.map(({ key, label, color, value }) => (
        <label key={key} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          cursor: 'pointer', fontSize: 'var(--text-sm)',
        }}>
          <input
            type="checkbox"
            checked={value}
            onChange={() => onToggle(key)}
          />
          <span style={{
            color: value ? color : undefined,
            fontWeight: value ? 'var(--font-weight-semibold)' : undefined,
          }}>{label}</span>
        </label>
      ))}
    </div>
  )
}