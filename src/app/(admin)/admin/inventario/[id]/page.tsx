// src/app/(admin)/admin/inventario/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminVariantById } from '@/server/actions/admin/inventory.actions'
import { getProductsForSelect } from '@/server/actions/admin/inventory.actions'
import { getVariantSizes, getGrindTypes } from '@/server/actions/settings.actions'
import { VariantForm } from '@/components/admin/VariantForm'

export const metadata = {
  title: 'Editar Variante | Panel Admin',
}

interface EditVariantPageProps {
  params: Promise<{ id: string }>
}

export default async function EditVariantPage({ params }: EditVariantPageProps) {
  const { id } = await params

  const [res, products, variantSizes, grindTypes] = await Promise.all([
    getAdminVariantById(id),
    getProductsForSelect(),
    getVariantSizes(),
    getGrindTypes(),
  ])

  if (!res.success) {
    notFound()
  }

  const variant = res.variant

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
          Editar Variante de Inventario
        </h1>
      </div>

      <VariantForm products={products} variantSizes={variantSizes} grindTypes={grindTypes} initialData={variant} />
    </div>
  )
}
