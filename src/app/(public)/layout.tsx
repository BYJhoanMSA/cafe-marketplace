// src/app/(public)/layout.tsx
// Layout de las páginas públicas — incluye Navbar y Footer
// Las rutas de admin y auth tienen su propio layout

import type { ReactNode } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PublicLayoutClient } from './PublicLayoutClient'
import { auth } from '@/lib/auth'

export default async function PublicLayout({ children }: { children: ReactNode }) {
  // Obtener sesión del servidor para pasar datos al Navbar
  const session = await auth()

  return (
    <PublicLayoutClient>
      <Navbar
        userName={session?.user?.name ?? null}
      />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </PublicLayoutClient>
  )
}
