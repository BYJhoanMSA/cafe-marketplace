// src/app/(admin)/admin/turismo/nuevo/page.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { RecorridoForm } from '@/components/admin/RecorridoForm'

export const metadata = {
  title: 'Nuevo Recorrido | Panel Admin',
}

export default async function NewRecorridoPage() {
  const session = await auth()
  // Crear recorridos es exclusivo del Administrador General
  if (session?.user?.role !== 'admin') {
    redirect('/admin/turismo')
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link
          href="/admin/turismo"
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
          Volver a recorridos
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Nuevo Recorrido Turístico
        </h1>
      </div>

      <RecorridoForm />
    </div>
  )
}
