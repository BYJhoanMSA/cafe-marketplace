// src/app/(admin)/admin/marcas/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminVendorById } from '@/server/actions/admin/vendor.actions'
import { VendorForm } from '@/components/admin/VendorForm'

export const metadata = {
  title: 'Editar Marca | Panel Admin',
}

interface EditVendorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditVendorPage({ params }: EditVendorPageProps) {
  const { id } = await params

  const res = await getAdminVendorById(id)
  if (!res.success) {
    notFound()
  }

  const vendor = res.vendor

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link
          href="/admin/marcas"
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
          Volver a marcas
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Editar Marca
        </h1>
      </div>

      <VendorForm initialData={vendor} />
    </div>
  )
}
