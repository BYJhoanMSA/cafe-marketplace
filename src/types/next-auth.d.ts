// src/types/next-auth.d.ts
// Extiende los tipos de NextAuth para incluir campos personalizados
// como `role` e `id` en el objeto Session.user

import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role?: string
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string
    role?: string
  }
}
