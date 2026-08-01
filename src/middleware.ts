// src/middleware.ts
// Middleware de Next.js — se ejecuta en el Edge antes de cada request
// Protege rutas privadas y redirige usuarios no autenticados

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/cuenta', '/checkout', '/admin']

// Área de administración: accesible solo para admin o vendor
const ADMIN_AREA = '/admin'

// Subrutas exclusivas del Administrador General
const ADMIN_ONLY_ROUTES = [
  '/admin/pedidos',
  '/admin/clientes',
  '/admin/usuarios',
  '/admin/roles',
  '/admin/reportes',
  '/admin/configuraciones',
  '/admin/logs',
  '/admin/inicio',
]

// Rutas que NO deben estar disponibles si el usuario ya está autenticado
const AUTH_ROUTES = ['/auth/login', '/auth/registro']

const ALLOWED_ADMIN_ROLES = ['admin', 'vendor']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Obtener la sesión actual
  const session = await auth()
  const role = session?.user?.role

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )
  const isAdminArea = pathname.startsWith(ADMIN_AREA)
  const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Si intenta acceder a ruta protegida sin sesión → redirigir a login
  if (isProtected && !session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Área de administración: solo admin o vendor
  if (isAdminArea && session && !ALLOWED_ADMIN_ROLES.includes(role ?? '')) {
    return new NextResponse('Acceso denegado', { status: 403 })
  }

  // Subrutas exclusivas de admin (pedidos, usuarios, CMS, etc.)
  if (isAdminOnlyRoute && role !== 'admin') {
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
