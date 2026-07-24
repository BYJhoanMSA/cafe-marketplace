// src/middleware.ts
// Middleware de Next.js — se ejecuta en el Edge antes de cada request
// Protege rutas privadas y redirige usuarios no autenticados

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/cuenta', '/checkout', '/admin']

// Rutas exclusivas de administrador
const ADMIN_ROUTES = ['/admin']

// Rutas que NO deben estar disponibles si el usuario ya está autenticado
const AUTH_ROUTES = ['/auth/login', '/auth/registro']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Obtener la sesión actual
  const session = await auth()

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Si intenta acceder a ruta protegida sin sesión → redirigir a login
  if (isProtected && !session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si intenta acceder a ruta de admin sin ser admin → 403
  if (isAdminRoute && session?.user?.role !== 'admin') {
    return new NextResponse('Acceso denegado', { status: 403 })
  }

  // Si ya está autenticado e intenta entrar a login/registro → redirigir a cuenta
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/cuenta', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Aplicar el middleware solo a estas rutas (excluye _next, api, assets)
  matcher: [
    '/cuenta/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/registro',
  ],
}
