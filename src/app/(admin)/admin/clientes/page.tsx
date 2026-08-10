// src/app/(admin)/admin/clientes/page.tsx
// Listado de clientes (usuarios con rol "customer") con agregados de compra.
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Search, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { getAdminCustomers } from '@/server/actions/admin/user.actions'
import { formatPrice, formatRelativeDate } from '@/lib/utils'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'Clientes | Panel Admin',
}

interface Props {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>
}

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'dark' }> = {
  active: { label: 'Activo', variant: 'success' },
  inactive: { label: 'Inactivo', variant: 'warning' },
  banned: { label: 'Bloqueado', variant: 'error' },
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    redirect('/admin')
  }

  const sp = await searchParams
  const { customers, total, page, limit } = await getAdminCustomers({
    search: sp.search,
    status: sp.status,
    page: sp.page ? Number(sp.page) : 1,
  })

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams()
    if (sp.search) p.set('search', sp.search)
    if (sp.status && sp.status !== 'all') p.set('status', sp.status)
    for (const [k, v] of Object.entries(extra)) p.set(k, v)
    return '?' + p.toString()
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Clientes</h1>
        <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-base)' }}>
          Usuarios consumidores de la tienda ({total} registrados).
        </p>
      </div>

      <form
        method="GET"
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }}
          />
          <input
            type="search"
            name="search"
            defaultValue={sp.search ?? ''}
            placeholder="Buscar por email, nombre o teléfono"
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3) var(--space-2) 40px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              background: 'var(--color-bg-primary)',
              fontFamily: 'var(--font-secondary)',
              fontSize: 'var(--text-base)',
            }}
          />
        </div>
        <select
          name="status"
          defaultValue={sp.status ?? 'all'}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-primary)',
            fontFamily: 'var(--font-secondary)',
            fontSize: 'var(--text-base)',
          }}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="banned">Bloqueados</option>
        </select>
        <button
          type="submit"
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--color-interactive)',
            color: 'var(--color-ink-inverted)',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
          }}
        >
          Filtrar
        </button>
      </form>

      <div style={{
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Cliente</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Registro</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Último acceso</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Pedidos</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Total gastado</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Ver</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const st = STATUS_LABELS[c.status] ?? { label: c.status, variant: 'dark' as const }
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
                      {c.firstName} {c.lastName}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>{c.email}</div>
                    {c.phone && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>{c.phone}</div>}
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                    {formatRelativeDate(c.createdAt)}
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                    {c.lastLoginAt ? formatRelativeDate(c.lastLoginAt) : '—'}
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>{c.orderCount}</td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', fontVariantNumeric: 'tabular-nums' }}>
                    {c.totalSpentInCents > 0 ? formatPrice(c.totalSpentInCents) : '—'}
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </td>
                  <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      style={{ color: 'var(--color-interactive)', padding: 'var(--space-2)', display: 'inline-block' }}
                      title="Ver detalle del cliente"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              )
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-ink-secondary)' }}>
                  No se encontraron clientes con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          {page > 1 && (
            <Link href={qs({ page: String(page - 1) })} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-interactive)' }}>
              ← Anterior
            </Link>
          )}
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={qs({ page: String(page + 1) })} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-interactive)' }}>
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
