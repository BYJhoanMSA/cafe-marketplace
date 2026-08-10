// src/app/(admin)/admin/roles/page.tsx
// Roles y permisos: matriz derivada de `src/server/auth/roles.ts` + conteos
// reales de la DB (`users.role`) + cambio rápido de rol por usuario.
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { RoleChangeSelect } from '@/components/admin/RoleChangeSelect'
import { getRolesSummary } from '@/server/actions/admin/user.actions'
import { ROLES, PERMISSIONS, getRolePermissions, type Permission } from '@/server/auth/roles'
import { formatRelativeDate } from '@/lib/utils'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'Roles | Panel Admin',
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  vendor: 'Vendor',
  customer: 'Cliente',
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Acceso completo al panel',
  vendor: 'Solo sus productos y marca',
  customer: 'Comprador en la tienda',
}

const PERMISSION_LABELS: Record<string, string> = {
  PRODUCT_CREATE: 'Crear productos',
  PRODUCT_READ_OWN: 'Ver productos propios',
  PRODUCT_READ_ALL: 'Ver todos los productos',
  PRODUCT_UPDATE_OWN: 'Editar productos propios',
  PRODUCT_UPDATE_ALL: 'Editar todos los productos',
  PRODUCT_DELETE_OWN: 'Eliminar productos propios',
  PRODUCT_DELETE_ALL: 'Eliminar todos los productos',
  PRODUCT_MANAGE_PUBLICITY: 'Gestionar publicidad',
  VARIANT_MANAGE_OWN: 'Gestionar variantes propias',
  VARIANT_MANAGE_ALL: 'Gestionar todas las variantes',
  VENDOR_CREATE: 'Crear marcas',
  VENDOR_READ_OWN: 'Ver marca propia',
  VENDOR_READ_ALL: 'Ver todas las marcas',
  VENDOR_UPDATE_OWN: 'Editar marca propia',
  VENDOR_UPDATE_ALL: 'Editar todas las marcas',
  ORDER_READ: 'Ver pedidos',
  ORDER_UPDATE: 'Actualizar pedidos',
  USER_MANAGE: 'Gestionar usuarios',
  SETTINGS_MANAGE: 'Gestionar configuración',
  DASHBOARD_VIEW: 'Ver dashboard',
  TURISMO_MANAGE: 'Gestionar turismo',
}

const MATRIX_ROLES = [ROLES.ADMIN, ROLES.VENDOR, ROLES.CUSTOMER]
const PERMISSION_ENTRIES = Object.entries(PERMISSIONS) as Array<[string, Permission]>

export default async function AdminRolesPage() {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    redirect('/admin')
  }

  const { counts, staff } = await getRolesSummary()

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Roles y Permisos</h1>
        <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-base)' }}>
          Los roles se guardan como string en <code>users.role</code> y su matriz de permisos está
          definida en <code>src/server/auth/roles.ts</code>. Cambiar un rol aquí afecta de inmediato
          los permisos de ese usuario.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {MATRIX_ROLES.map((role) => (
          <div
            key={role}
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{ROLE_LABELS[role] ?? role}</span>
              <Badge variant={role === ROLES.ADMIN ? 'gold' : role === ROLES.VENDOR ? 'forest' : 'default'}>
                {counts[role] ?? 0} usuarios
              </Badge>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', marginTop: 'var(--space-1)' }}>
              {ROLE_DESCRIPTIONS[role] ?? ''}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
        Matriz de permisos
      </h2>
      <div style={{
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        marginBottom: 'var(--space-8)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Permiso</th>
              {MATRIX_ROLES.map((role) => (
                <th key={role} style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'center' }}>
                  {ROLE_LABELS[role] ?? role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_ENTRIES.map(([key, perm]) => (
              <tr key={key} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)' }}>
                  <div>{PERMISSION_LABELS[key] ?? key}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)', fontFamily: 'monospace' }}>{perm}</div>
                </td>
                {MATRIX_ROLES.map((role) => {
                  const allowed = getRolePermissions(role).includes(perm)
                  return (
                    <td key={role} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: allowed ? 'var(--forest-500)' : 'var(--color-ink-tertiary)',
                          backgroundColor: allowed ? 'var(--forest-50)' : 'transparent',
                        }}
                      >
                        {allowed ? '✓' : '–'}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
        Cambiar rol de usuarios
      </h2>
      <div style={{
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Usuario</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Último acceso</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Rol actual</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Nuevo rol</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => {
              const isSelf = u.id === session.user.id
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
                      {u.firstName} {u.lastName} {isSelf && <span style={{ color: 'var(--color-ink-tertiary)', fontSize: 'var(--text-xs)' }}>(tú)</span>}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                    {u.lastLoginAt ? formatRelativeDate(u.lastLoginAt) : '—'}
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <Badge variant={u.role === ROLES.ADMIN ? 'gold' : 'forest'}>{u.role}</Badge>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <RoleChangeSelect userId={u.id} role={u.role} disabled={isSelf} />
                  </td>
                </tr>
              )
            })}
            {staff.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-ink-secondary)' }}>
                  No hay usuarios con rol admin o vendor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
