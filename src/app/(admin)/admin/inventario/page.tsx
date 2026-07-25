// src/app/(admin)/admin/inventario/page.tsx
import Link from 'next/link'
import { getVariants } from '@/server/actions/admin/inventory.actions'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { Plus, PencilSimple, Warning } from '@phosphor-icons/react'

export const metadata = {
  title: 'Inventario | Panel Admin',
}

export default async function AdminInventoryPage() {
  const variants = await getVariants()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Control de Inventario</h1>
          <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)' }}>
            Gestión de SKUs, precios y existencias por variante de producto.
          </p>
        </div>
        <Link 
          href="/admin/inventario/nuevo" 
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
          Nueva Variante
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
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>SKU / Variante</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Producto Padre</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Precio</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Stock</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {variants.map(variant => {
              const isLowStock = variant.stockQuantity <= variant.lowStockAlert && variant.stockQuantity > 0
              const isOutOfStock = variant.stockQuantity === 0

              return (
                <tr key={variant.id} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)' }}>{variant.title}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)' }}>{variant.sku}</div>
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                    <div>{variant.product.title}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>{variant.product.vendor.storeName}</div>
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    {formatPrice(variant.priceInCents, variant.currency)}
                    {variant.comparePriceInCents && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)', textDecoration: 'line-through', marginLeft: 'var(--space-2)' }}>
                        {formatPrice(variant.comparePriceInCents, variant.currency)}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{variant.stockQuantity}</span>
                      {isLowStock && (
                        <span style={{ color: 'var(--terra-500)', display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: 'var(--text-xs)' }} title="Stock Bajo">
                          <Warning size={14} /> Bajo
                        </span>
                      )}
                      {isOutOfStock && (
                        <Badge variant="dark">Agotado</Badge>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <Badge variant={variant.status === 'active' ? 'success' : 'dark'}>
                      {variant.status}
                    </Badge>
                  </td>
                  <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                    <Link 
                      href={`/admin/inventario/${variant.id}`}
                      style={{ color: 'var(--color-ink-secondary)', padding: 'var(--space-2)', display: 'inline-block' }}
                      title="Editar Variante"
                    >
                      <PencilSimple size={16} />
                    </Link>
                  </td>
                </tr>
              )
            })}
            {variants.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-ink-secondary)' }}>
                  No hay variantes registradas. Crea tu primera variante para comenzar a vender.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
