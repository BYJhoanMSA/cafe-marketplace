// src/server/middleware/auth.middleware.ts
// Helpers centralizados de autorización.
// - API Routes: requireAuth / requireAdmin lanzan Response de error.
// - Server Actions: requireRole / requirePermission / requireProductAccess
//   lanzan Error('Forbidden'); captura con isForbiddenError() para responder 403.
// - Cron: requireCronSecret valida el header Authorization.

import { auth } from '@/lib/auth'
import { apiError } from '@/lib/utils'
import { canAccessProduct, type Permission, hasPermission } from '@/server/auth/roles'

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
 * Verifica que el usuario tenga rol de administrador (Administrador General).
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

/**
 * Para Server Actions: verifica que el usuario tenga un rol permitido.
 * Uso: const session = await requireRole(['admin', 'vendor'])
 * Lanza Error (no Response) porque Server Actions manejan errores como objetos.
 */
export async function requireRole(allowedRoles: string[]) {
  const session = await auth()
  if (!session?.user || !allowedRoles.includes(session.user.role ?? '')) {
    throw new Error('Forbidden')
  }
  return session
}

/**
 * Para Server Actions: verifica que el usuario tenga UN permiso específico.
 * Uso: const session = await requirePermission(PERMISSIONS.PRODUCT_UPDATE_OWN)
 */
export async function requirePermission(permission: Permission) {
  const session = await auth()
  if (!session?.user || !hasPermission(session.user.role, permission)) {
    throw new Error('Forbidden')
  }
  return session
}

/**
 * Para Server Actions: verifica que el usuario pueda operar sobre un producto
 * del propietario `ownerId` (propio o Administrador General).
 * Uso: const session = await requireProductAccess(product.createdById)
 */
export async function requireProductAccess(ownerId: string | null | undefined) {
  const session = await auth()
  if (!session?.user || !canAccessProduct(session.user, ownerId)) {
    throw new Error('Forbidden')
  }
  return session
}

/** Error estándar de autorización lanzado por las Server Actions. */
export function isForbiddenError(error: unknown): boolean {
  return error instanceof Error && error.message === 'Forbidden'
}

/** Respuesta estándar 403 para Server Actions. */
export function forbiddenResponse(
  message = 'No tienes permisos para realizar esta acción'
): { success: false; error: string; status: 403 } {
  return { success: false, error: message, status: 403 }
}
