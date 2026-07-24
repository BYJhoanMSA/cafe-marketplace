// src/app/(admin)/admin/pedidos/page.tsx
import Link from 'next/link'
import { getAdminOrders } from '@/server/actions/admin/order.actions'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatRelativeDate } from '@/lib/utils'
import { Eye } from 'lucide-react'

export const metadata = {
  title: 'Pedidos | Panel Admin',
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders()

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Gestión de Pedidos</h1>
        <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)' }}>
          Historial y control de despachos de compras realizadas en la tienda.
        </p>
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
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Pedido</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Cliente</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Fecha</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Pago</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Estado Envío</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Total</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Ver</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                <td style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-bold)' }}>
                  #{order.displayId}
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
                    {order.customerFirstName} {order.customerLastName}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>{order.customerEmail}</div>
                </td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                  {formatRelativeDate(order.createdAt)}
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  <Badge variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'pending' ? 'warning' : 'dark'}>
                    {order.paymentStatus}
                  </Badge>
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'forest' : order.status === 'processing' ? 'warning' : 'dark'}>
                    {order.status}
                  </Badge>
                </td>
                <td style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-bold)' }}>
                  {formatPrice(order.totalInCents, order.currency)}
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                  <Link 
                    href={`/admin/pedidos/${order.id}`}
                    style={{ color: 'var(--color-interactive)', padding: 'var(--space-2)', display: 'inline-block' }}
                    title="Ver detalle de pedido"
                  >
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-ink-secondary)' }}>
                  Aún no se han recibido pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
