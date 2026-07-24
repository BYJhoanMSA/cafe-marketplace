'use client'

// src/components/admin/RecentOrdersTable.tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatRelativeDate } from '@/lib/utils'

interface RecentOrdersTableProps {
  orders: any[]
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div style={{ 
      backgroundColor: 'var(--color-bg-primary)', 
      border: '1px solid var(--color-border-default)', 
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: 'var(--space-5) var(--space-6)', 
        borderBottom: '1px solid var(--color-border-default)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
          Últimos Pedidos
        </h3>
        <Link 
          href="/admin/pedidos" 
          style={{ 
            fontSize: 'var(--text-sm)', 
            color: 'var(--color-interactive)', 
            textDecoration: 'none',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          Ver todos →
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Pedido</th>
            <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Cliente</th>
            <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Fecha</th>
            <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Estado</th>
            <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 'var(--font-weight-medium)' }}>
                #{order.displayId}
              </td>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--text-sm)' }}>
                {order.customerFirstName} {order.customerLastName}
              </td>
              <td style={{ padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                {formatRelativeDate(order.createdAt)}
              </td>
              <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                <Badge variant={order.status === 'paid' ? 'success' : order.status === 'pending' ? 'warning' : 'dark'}>
                  {order.status}
                </Badge>
              </td>
              <td style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>
                {formatPrice(order.totalInCents, 'USD')}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-ink-secondary)' }}>
                No hay pedidos recientes.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
