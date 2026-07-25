// src/app/(admin)/admin/inventario/nuevo/page.tsx
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react'
import { getProductsForSelect } from '@/server/actions/admin/inventory.actions'
import { getVariantSizes, getGrindTypes } from '@/server/actions/settings.actions'
import { VariantForm } from '@/components/admin/VariantForm'

export const metadata = {
  title: 'Nueva Variante | Panel Admin',
}

export default async function NewVariantPage() {
  const [products, variantSizes, grindTypes] = await Promise.all([
    getProductsForSelect(),
    getVariantSizes(),
    getGrindTypes(),
  ])

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link 
          href="/admin/inventario" 
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
          Volver a inventario
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Crear Nueva Variante de Producto
        </h1>
      </div>

      {products.length === 0 ? (
        <div style={{ padding: 'var(--space-6)', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, color: 'var(--color-ink-secondary)' }}>
            Debes crear al menos un producto base antes de poder agregar variantes de inventario.{' '}
            <Link href="/admin/productos/nuevo" style={{ color: 'var(--color-interactive)' }}>
              Crear producto ahora
            </Link>
          </p>
        </div>
      ) : (
        <VariantForm products={products} variantSizes={variantSizes} grindTypes={grindTypes} />
      )}
    </div>
  )
}
