// src/app/(admin)/admin/usuarios/page.tsx
// Usuarios staff (admin/vendor): cuentas del panel de administración.
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Edit2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { getAdminStaff } from '@/server/actions/admin/user.actions'
import { formatRelativeDate } from '@/lib/utils'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'Usuarios Staff | Panel Admin',
}

const ROLE_VARIANTS: Record<string, 'gold' | 'forest' | 'dark'> = {
  admin: 'gold',
  vendor: 'forest',
}

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'dark' }> = {
  active: { label: 'Activo', variant: 'success' },
  inactive: { label: 'Inactivo', variant: 'warning' },
  banned: { label: 'Bloqueado', variant: 'error' },
}

export default async function AdminStaffPage() {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    redirect('/admin')
  }

  const { staff } = await getAdminStaff()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Usuarios Staff</h1>
          <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-base)' }}>
            Cuentas con acceso al panel ({staff.length}).
          </p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--color-interactive)',
            color: 'var(--color-ink-inverted)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <Plus size={16} />
          Nuevo Usuario
        </Link>
      </div>

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
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Rol</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Último acceso</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Marca</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Editar</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => {
              const st = STATUS_LABELS[u.status] ?? { label: u.status, variant: 'dark' as const }
              const isSelf = u.id === session.user.id
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
                      {u.firstName} {u.lastName} {isSelf && <span style={{ color: 'var(--color-ink-tertiary)', fontSize: 'var(--text-xs)' }}>(tú)</span>}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <Badge variant={ROLE_VARIANTS[u.role] ?? 'dark'}>{u.role}</Badge>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                    {u.lastLoginAt ? formatRelativeDate(u.lastLoginAt) : '—'}
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                    {u.vendor ? (
                      <Link href={`/admin/marcas/${u.vendor.id}`} style={{ color: 'var(--color-interactive)' }}>
                        {u.vendor.storeName}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                    <Link
                      href={`/admin/usuarios/${u.id}`}
                      style={{ color: 'var(--color-ink-secondary)', padding: 'var(--space-2)', display: 'inline-block' }}
                      title="Editar usuario"
                    >
                      <Edit2 size={16} />
                    </Link>
                  </td>
                </tr>
              )
            })}
            {staff.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-ink-secondary)' }}>
                  No hay usuarios staff. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
