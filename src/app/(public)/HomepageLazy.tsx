// src/app/(public)/HomepageLazy.tsx
// Lazy-loaded sections for the homepage (below the fold)

import Link from 'next/link'
import { OriginCard } from '@/components/home/OriginCard'
import { getHomepageOrigins } from '@/server/actions/catalog.actions'
import { getHomepageSettings } from '@/server/actions/settings.actions'
import styles from './page.module.css'

export async function HomepageOrigins() {
  const origins = await getHomepageOrigins()

  if (origins.length === 0) {
    return (
      <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: 'var(--space-8)' }}>
        Pronto agregaremos más orígenes.
      </p>
    )
  }

  return (
    <div className={styles.originGrid}>
      {origins.map((origin) => (
        <OriginCard
          key={origin.slug}
          label={origin.label}
          slug={origin.slug}
          count={origin.count}
          images={origin.images}
        />
      ))}
    </div>
  )
}

export async function HomepageValues() {
  const config = await getHomepageSettings()

  return (
    <div className={styles.valueGrid}>
      {config.features.map((value) => (
        <div key={value.title} className={styles.valueCard}>
          <span className={styles.valueIcon} aria-hidden="true">
            {value.icon}
          </span>
          <h3 className={styles.valueTitle}>{value.title}</h3>
          <p className={styles.valueDesc}>{value.desc}</p>
        </div>
      ))}
    </div>
  )
}