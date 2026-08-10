'use client'

// src/components/providers/SessionProvider.tsx
// Provider de Auth.js para el lado cliente. Permite que Navbar/Footer lean la
// sesión con `useSession()` SIN volver dinámico el layout público (que antes
// llamaba `await auth()` en el servidor, forzando render dinámico + streaming
// en cada request y causando respuestas truncadas bajo memoria/CPU limitadas).

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
