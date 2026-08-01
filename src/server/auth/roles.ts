// src/server/auth/roles.ts
// =============================================================================
// Sistema centralizado de roles y permisos (RBAC).
// -----------------------------------------------------------------------------
// Arquitectura orientada a permisos: cada acción del backend pide UN permiso
// (p.ej. `products:update:own`) y aquí se resuelve qué roles lo tienen.
// Agregar un rol futuro (editor, moderador, supervisor, vendedor...) se reduce
// a añadir una entrada en ROLE_PERMISSIONS. No hay que tocar los controladores.
// =============================================================================

export const ROLES = {
  ADMIN: 'admin', // Administrador General: acceso completo al sistema
  VENDOR: 'vendor', // Usuario registrado: administra SOLO sus propios productos
  CUSTOMER: 'customer', // Comprador en la tienda
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// =============================================================================
// Permisos disponibles
// =============================================================================

export const PERMISSIONS = {
  // Productos
  PRODUCT_CREATE: 'products:create',
  PRODUCT_READ_OWN: 'products:read:own',
  PRODUCT_READ_ALL: 'products:read:all',
  PRODUCT_UPDATE_OWN: 'products:update:own',
  PRODUCT_UPDATE_ALL: 'products:update:all',
  PRODUCT_DELETE_OWN: 'products:delete:own',
  PRODUCT_DELETE_ALL: 'products:delete:all',
  PRODUCT_MANAGE_PUBLICITY: 'products:manage:publicity', // toggle "Publicidad"

  // Variantes
  VARIANT_MANAGE_OWN: 'variants:manage:own',
  VARIANT_MANAGE_ALL: 'variants:manage:all',

  // Marcas / Vendors
  VENDOR_CREATE: 'vendors:create',
  VENDOR_READ_OWN: 'vendors:read:own',
  VENDOR_READ_ALL: 'vendors:read:all',
  VENDOR_UPDATE_OWN: 'vendors:update:own',
  VENDOR_UPDATE_ALL: 'vendors:update:all',

  // Pedidos
  ORDER_READ: 'orders:read',
  ORDER_UPDATE: 'orders:update',

  // Usuarios y configuración
  USER_MANAGE: 'users:manage',
  SETTINGS_MANAGE: 'settings:manage',
  DASHBOARD_VIEW: 'dashboard:view',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// =============================================================================
// Mapa de permisos por rol
// =============================================================================

const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  // Usuario registrado: puede crear, ver, editar y eliminar SUS propios
  // productos y sus variantes. NO ve pedidos, usuarios, ni "Publicidad".
  [ROLES.VENDOR]: [
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ_OWN,
    PERMISSIONS.PRODUCT_UPDATE_OWN,
    PERMISSIONS.PRODUCT_DELETE_OWN,
    PERMISSIONS.VARIANT_MANAGE_OWN,
    PERMISSIONS.VENDOR_READ_OWN,
    PERMISSIONS.VENDOR_UPDATE_OWN,
    PERMISSIONS.DASHBOARD_VIEW,
  ],

  [ROLES.CUSTOMER]: [],
}

export function getRolePermissions(role: string | null | undefined): readonly Permission[] {
  if (!role) return []
  return ROLE_PERMISSIONS[role] ?? []
}

export function hasPermission(
  role: string | null | undefined,
  permission: Permission
): boolean {
  return getRolePermissions(role).includes(permission)
}

// =============================================================================
// Helpers de autorización (puros: reciben la sesión, no la leen)
// =============================================================================

export interface SessionUserLike {
  id?: string
  role?: string | null
}

/** ¿El usuario es el Administrador General? */
export function isGeneralAdmin(user: SessionUserLike | null | undefined): boolean {
  return user?.role === ROLES.ADMIN
}

/**
 * ¿Puede el usuario operar sobre un producto del propietario `ownerId`?
 * El admin puede sobre cualquier producto; los demás solo sobre los propios.
 */
export function canAccessProduct(
  user: SessionUserLike | null | undefined,
  ownerId: string | null | undefined
): boolean {
  if (!user?.id) return false
  if (isGeneralAdmin(user)) return true
  return user.id === ownerId
}

/** ¿El usuario puede gestionar la marca del vendedor `vendorUserId`? */
export function canAccessVendor(
  user: SessionUserLike | null | undefined,
  vendorUserId: string | null | undefined
): boolean {
  if (!user?.id) return false
  if (isGeneralAdmin(user)) return true
  return user.id === vendorUserId
}
