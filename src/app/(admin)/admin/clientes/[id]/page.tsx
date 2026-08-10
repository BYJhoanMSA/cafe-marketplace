// src/app/(admin)/admin/clientes/[id]/page.tsx
// Detalle de un cliente: perfil, direcciones y pedidos.
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { UserStatusButton } from '@/components/admin/UserStatusButton'
import { getAdminCustomer } from '@/server/actions/admin/user.actions'
import { formatPrice, formatRelativeDate } from '@/lib/utils'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'Cliente | Panel Admin',
}

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'dark' }> = {
  active: { label: 'Activo', variant: 'success' },
  inactive: { label: 'Inactivo', variant: 'warning' },
  banned: { label: 'Bloqueado', variant: 'error' },
}

export default async function AdminCustomerDetailPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    redirect('/admin')
  }

  const { id } = await params
  const customer = await getAdminCustomer(id)
  if (!customer) {
    notFound()
  }

  const st = STATUS_LABELS[customer.status] ?? { label: customer.status, variant: 'dark' as const }
  const validOrders = customer.orders.filter((o) => o.status !== 'cancelled')
  const totalSpent = validOrders.reduce((sum, o) => sum + o.totalInCents, 0)

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link
          href="/admin/clientes"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-ink-secondary)',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <ArrowLeft size={16} />
          Volver a clientes
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
              {customer.firstName} {customer.lastName}
            </h1>
            <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-base)' }}>
              {customer.email}
              {customer.phone ? ` · ${customer.phone}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Badge variant={st.variant}>{st.label}</Badge>
            <UserStatusButton userId={customer.id} status={customer.status} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Registro', value: formatRelativeDate(customer.createdAt) },
          { label: 'Último acceso', value: customer.lastLoginAt ? formatRelativeDate(customer.lastLoginAt) : '—' },
          { label: 'Pedidos', value: String(validOrders.length) },
          { label: 'Total gastado', value: totalSpent > 0 ? formatPrice(totalSpent) : '—' },
          { label: 'Favoritos', value: String(customer._count?.favorites ?? 0) },
          { label: 'Reseñas', value: String(customer._count?.reviews ?? 0) },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-4)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', marginTop: 'var(--space-1)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {customer.addresses.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
            Direcciones
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {customer.addresses.map((a) => (
              <div
                key={a.id}
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>{a.label || 'Dirección'}</span>
                  {a.isDefault && <Badge variant="gold">Principal</Badge>}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                  {a.address1}
                  {a.address2 ? `, ${a.address2}` : ''}
                  <br />
                  {a.city}, {a.state} {a.postalCode}
                  <br />
                  {a.country}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
        Pedidos
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
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Pedido</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Fecha</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Total</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Ver</th>
            </tr>
          </thead>
          <tbody>
            {customer.orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                <td style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-bold)' }}>#{o.displayId}</td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                  {formatRelativeDate(o.createdAt)}
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : o.status === 'shipped' ? 'forest' : 'warning'}>
                    {o.status}
                  </Badge>
                </td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatPrice(o.totalInCents, o.currency)}
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    style={{ color: 'var(--color-interactive)', padding: 'var(--space-2)', display: 'inline-block' }}
                    title="Ver pedido"
                  >
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
            {customer.orders.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-ink-secondary)' }}>
                  Este cliente aún no tiene pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
