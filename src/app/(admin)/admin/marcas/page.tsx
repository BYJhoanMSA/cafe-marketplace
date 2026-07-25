// src/app/(admin)/admin/marcas/page.tsx
import Link from 'next/link'
import { getAdminVendors } from '@/server/actions/admin/vendor.actions'
import { Badge } from '@/components/ui/Badge'
import { Plus, PencilSimple, Prohibit } from '@phosphor-icons/react'

export const metadata = {
  title: 'Marcas | Panel Admin',
}

export default async function AdminVendorsPage() {
  const vendors = await getAdminVendors()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Marcas Registradas</h1>
        <Link 
          href="/admin/marcas/nuevo" 
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
          Nueva Marca
        </Link>
      </div>

      <div style={{ 
        backgroundColor: 'var(--color-bg-primary)', 
        border: '1px solid var(--color-border-default)', 
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Marca</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Ubicación</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Propietario</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(vendor => (
              <tr key={vendor.id} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                <td style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{vendor.storeName}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>{vendor.slug}</div>
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  <Badge variant={vendor.status === 'active' ? 'success' : vendor.status === 'pending' ? 'warning' : 'dark'}>
                    {vendor.status === 'active' ? 'Activo' : vendor.status === 'pending' ? 'Pendiente' : 'Suspendido'}
                  </Badge>
                </td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                  {vendor.city}, {vendor.country}
                </td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                  {vendor.user.email}
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                    <Link 
                      href={`/admin/marcas/${vendor.id}`}
                      style={{ color: 'var(--color-ink-secondary)', padding: 'var(--space-2)' }}
                      title="Editar"
                    >
                      <PencilSimple size={16} />
                    </Link>
                    <button style={{ background: 'none', border: 'none', color: 'var(--terra-500)', cursor: 'pointer', padding: 'var(--space-2)' }} title="Suspender">
                      <Prohibit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-ink-secondary)' }}>
                  No hay marcas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
