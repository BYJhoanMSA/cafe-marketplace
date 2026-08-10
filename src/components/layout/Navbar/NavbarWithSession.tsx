'use client'

// src/components/layout/Navbar/NavbarWithSession.tsx
// Wrapper cliente que obtiene la sesión con useSession() y la pasa al Navbar.
// Sustituye el `await auth()` del layout servidor para mantener las páginas
// públicas estáticas (ISR) y evitar el streaming dinámico por request.

import { useSession } from 'next-auth/react'
import { Navbar } from './Navbar'

export function NavbarWithSession() {
  const { data: session } = useSession()
  return <Navbar userName={session?.user?.name ?? null} />
}
