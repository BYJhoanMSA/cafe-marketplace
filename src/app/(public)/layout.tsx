// src/app/(public)/layout.tsx
// Layout de las páginas públicas — incluye Navbar y Footer
// Las rutas de admin y auth tienen su propio layout

import type { ReactNode } from 'react'
import { NavbarWithSession } from '@/components/layout/Navbar/NavbarWithSession'
import { Footer } from '@/components/layout/Footer'
import { PublicLayoutClient } from './PublicLayoutClient'

// NOTA: este layout es un Server Component sin ninguna lectura dinámica
// (sin cookies()/auth()/headers()), por lo que las páginas públicas se
// prerenderizan con ISR y se sirven desde caché en lugar de streamearse en
// cada request. La sesión se lee en el cliente (NavbarWithSession).
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <PublicLayoutClient>
      <NavbarWithSession />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </PublicLayoutClient>
  )
}
