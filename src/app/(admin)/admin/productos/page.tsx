// src/app/(admin)/admin/productos/page.tsx
import Link from 'next/link'
import { getAdminProducts } from '@/server/actions/admin/product.actions'
import { Badge } from '@/components/ui/Badge'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { deleteProduct } from '@/server/actions/admin/product.actions'

export const metadata = {
  title: 'Productos | Panel Admin',
}

export default async function AdminProductsPage() {
  const products = await getAdminProducts()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Productos</h1>
        <Link 
          href="/admin/productos/nuevo" 
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
          Nuevo Producto
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
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Producto</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Vendor</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                <td style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{product.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>{product.slug}</div>
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  <Badge variant={product.status === 'active' ? 'success' : product.status === 'draft' ? 'warning' : 'dark'}>
                    {product.status === 'active' ? 'Activo' : product.status === 'draft' ? 'Borrador' : 'Archivado'}
                  </Badge>
                </td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                  {product.vendor.storeName}
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                    <Link 
                      href={`/admin/productos/${product.id}`}
                      style={{ color: 'var(--color-ink-secondary)', padding: 'var(--space-2)' }}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </Link>
<form action={deleteProduct.bind(null, product.id)}>
                      <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--terra-500)', cursor: 'pointer', padding: 'var(--space-2)' }} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-ink-secondary)' }}>
                  No hay productos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
