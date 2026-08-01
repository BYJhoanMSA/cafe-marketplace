// src/app/(admin)/admin/productos/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/server/db/client'
import { auth } from '@/lib/auth'
import { getAdminProductById } from '@/server/actions/admin/product.actions'
import { getVariantSizes, getGrindTypes } from '@/server/actions/settings.actions'
import { ProductForm } from '@/components/admin/ProductForm'

export const metadata = {
  title: 'Editar Producto | Panel Admin',
}

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  const vendorsPromise = isAdmin
    ? prisma.vendor.findMany({
        where: { deletedAt: null, status: 'active' },
        select: { id: true, storeName: true },
        orderBy: { storeName: 'asc' },
      })
    : prisma.vendor.findMany({
        where: { userId: session?.user?.id, deletedAt: null, status: 'active' },
        select: { id: true, storeName: true },
        orderBy: { storeName: 'asc' },
      })

  const [res, vendors, categories, variantSizes, grindTypes] = await Promise.all([
    getAdminProductById(id),
    vendorsPromise,
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    getVariantSizes(),
    getGrindTypes(),
  ])

  const product = res.success ? res.product : null
  if (!product) {
    notFound()
  }

  const serialized = {
    ...product,
    cuppingScore: product.cuppingScore ? Number(product.cuppingScore) : null,
    avgRating: Number(product.avgRating),
    originId: product.originId || '',
  }

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
          Editar Producto
        </h1>
      </div>

      <ProductForm
        initialData={serialized}
        vendors={vendors}
        categories={categories}
        variantSizes={variantSizes}
        grindTypes={grindTypes}
        isAdmin={isAdmin}
      />
    </div>
  )
}
