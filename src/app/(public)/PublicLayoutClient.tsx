'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { PillBarProvider } from '@/components/ui/PillSelector/PillBarContext'
import { PillBarWrapper } from '@/components/ui/PillSelector/PillBarWrapper'
import { FLAVOR_ITEMS } from '@/components/ui/PillSelector/PillSelector.data'
import styles from './PublicLayoutClient.module.css'

export function PublicLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Inicio y Catálogo ya montan su propio PillBarWrapper; el global solo se
  // renderiza en el resto de páginas y únicamente en la versión móvil.
  const hasOwnBar = pathname === '/' || pathname.startsWith('/catalogo')

  return (
    <PillBarProvider>
      {children}
      {!hasOwnBar && (
        <div className={styles.mobileOnly}>
          <PillBarWrapper items={FLAVOR_ITEMS} activeId="coffee" />
        </div>
      )}
    </PillBarProvider>
  )
}
