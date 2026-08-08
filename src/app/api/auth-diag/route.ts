// src/app/api/auth-diag/route.ts
// Diagnóstico temporal del runtime de Auth.js (para depurar el error de
// configuración en producción). Devuelve solo metadatos, nunca el secret.
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

function fileHasSecret(p: string): string {
  try {
    if (!fs.existsSync(p)) return '(no existe)'
    const c = fs.readFileSync(p, 'utf8')
    const m = c.match(/^AUTH_SECRET\s*=\s*(.*)$/m)
    const v = m && m[1] ? m[1].trim().replace(/^["']|["']$/g, '') : ''
    return v ? `SÍ (len=${v.length})` : 'AUTH_SECRET ausente/vacío en el archivo'
  } catch (e) {
    return `error: ${(e as Error).message}`
  }
}

export function GET() {
  const cwd = process.cwd()
  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  const dbUrl = process.env.DATABASE_URL || ''
  return NextResponse.json({
    cwd,
    authSecretSet: Boolean(authSecret),
    authSecretLen: authSecret ? authSecret.length : 0,
    databaseUrlSet: Boolean(process.env.DATABASE_URL),
    databaseUrlHost: dbUrl.match(/@([^:/]+)/)?.[1] ?? '(ninguno)',
    cronSecretSet: Boolean(process.env.CRON_SECRET),
    cloudinaryCloudSet: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    authUrl: process.env.AUTH_URL ?? '(no definido)',
    authTrustHost: process.env.AUTH_TRUST_HOST ?? '(no definido)',
    nodeEnv: process.env.NODE_ENV,
    rootEnvFile: fileHasSecret(path.join(cwd, '.env.production.local')),
    standaloneEnvFile: fileHasSecret(path.join(cwd, '.next', 'standalone', '.env.production.local')),
  })
}
