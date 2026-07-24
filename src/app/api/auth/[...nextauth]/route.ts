// src/app/api/auth/[...nextauth]/route.ts
// Handler de Auth.js — gestiona todos los endpoints de autenticación:
// GET/POST /api/auth/signin
// GET/POST /api/auth/signout
// GET/POST /api/auth/callback/:provider
// GET      /api/auth/session
// GET      /api/auth/csrf
// GET      /api/auth/providers

import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
