// src/app/(admin)/admin/productos/nuevo/page.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/server/db/client'
import { getVariantSizes, getGrindTypes } from '@/server/actions/settings.actions'
import { ProductForm } from '@/components/admin/ProductForm'

export const metadata = {
  title: 'Nuevo Producto | Panel Admin',
}

export default async function NewProductPage() {
  const [vendors, categories, variantSizes, grindTypes] = await Promise.all([
    prisma.vendor.findMany({
      where: { deletedAt: null, status: 'active' },
      select: { id: true, storeName: true },
      orderBy: { storeName: 'asc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    getVariantSizes(),
    getGrindTypes(),
  ])

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link 
          href="/admin/productos" 
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
          Volver a productos
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Crear Nuevo Producto
        </h1>
      </div>

      <ProductForm vendors={vendors} categories={categories} variantSizes={variantSizes} grindTypes={grindTypes} />
    </div>
  )
}
