// src/app/(admin)/admin/turismo/[id]/page.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { RecorridoForm } from '@/components/admin/RecorridoForm'
import { getAdminRecorridoById } from '@/server/actions/turismo.actions'

export const metadata = {
  title: 'Editar Recorrido | Panel Admin',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditRecorridoPage({ params }: PageProps) {
  const session = await auth()
  // Editar recorridos es exclusivo del Administrador General
  if (session?.user?.role !== 'admin') {
    redirect('/admin/turismo')
  }

  const { id } = await params
  const result = await getAdminRecorridoById(id)

  if (!result.success || !result.recorrido) {
    return (
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Recorrido no encontrado</h1>
        <p style={{ color: 'var(--color-ink-secondary)' }}>No pudimos encontrar el recorrido solicitado.</p>
        <Link href="/admin/turismo" style={{ color: 'var(--color-interactive)', textDecoration: 'none' }}>Volver a recorridos</Link>
      </div>
    )
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
          Editar: {result.recorrido.nombre}
        </h1>
      </div>

      <RecorridoForm initialData={result.recorrido} />
    </div>
  )
}
