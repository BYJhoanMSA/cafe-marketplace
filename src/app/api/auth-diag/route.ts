// src/app/api/_auth-diag/route.ts
// Diagnóstico temporal del runtime de Auth.js (para depurar el error de
// configuración en producción). Devuelve solo metadatos, nunca el secret.
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function safeUrl(v: string | undefined): string {
  if (!v) return '(no definido)'
  try {
    new URL(v)
    return 'OK'
  } catch {
    return 'INVÁLIDO'
  }
}

export function GET() {
  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  return NextResponse.json({
    authSecretSet: Boolean(authSecret),
    authSecretLen: authSecret ? authSecret.length : 0,
    authSecretNombre: process.env.AUTH_SECRET ? 'AUTH_SECRET' : process.env.NEXTAUTH_SECRET ? 'NEXTAUTH_SECRET' : '(ninguno)',
    databaseUrlSet: Boolean(process.env.DATABASE_URL),
    authUrl: safeUrl(process.env.AUTH_URL),
    authTrustHost: process.env.AUTH_TRUST_HOST ?? '(no definido)',
    nodeEnv: process.env.NODE_ENV,
    nextauthUrl: safeUrl(process.env.NEXTAUTH_URL),
  })
}
