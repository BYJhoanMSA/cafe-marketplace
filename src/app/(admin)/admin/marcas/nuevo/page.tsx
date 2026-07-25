// src/app/(admin)/admin/marcas/nuevo/page.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { VendorForm } from '@/components/admin/VendorForm'

export const metadata = {
  title: 'Nueva Marca | Panel Admin',
}

export default function NewVendorPage() {
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
          Registrar Nueva Marca
        </h1>
      </div>

      <VendorForm />
    </div>
  )
}
