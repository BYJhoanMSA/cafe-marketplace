// src/server/middleware/auth.middleware.ts
// Helpers para proteger API Routes (no el middleware de Next.js)
// Uso: const session = await requireAuth(request)

import { auth } from '@/lib/auth'
import { apiError } from '@/lib/utils'

/**
 * Verifica que el request tenga sesión activa.
 * Lanza una Response de error 401 si no está autenticado.
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw apiError('No autorizado. Inicia sesión para continuar.', 401)
  }
  return session
}

/**
 * Verifica que el usuario tenga rol de administrador.
 * Lanza una Response de error 403 si no es admin.
 */
export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== 'admin') {
    throw apiError('Acceso denegado. Se requieren permisos de administrador.', 403)
  }
  return session
}

/**
 * Verifica el secreto de los endpoints de cron jobs.
 * Uso: en /api/cron/* para que solo Hostinger pueda llamarlos.
 */
export function requireCronSecret(request: Request): void {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token || token !== process.env.CRON_SECRET) {
    throw apiError('No autorizado', 401)
  }
}
