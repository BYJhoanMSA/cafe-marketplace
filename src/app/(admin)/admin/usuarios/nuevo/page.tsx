// src/app/(admin)/admin/usuarios/nuevo/page.tsx
// Crear un usuario staff (admin/vendor).
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { StaffForm } from '@/components/admin/StaffForm'

export const metadata = {
  title: 'Nuevo Usuario | Panel Admin',
}

export default async function NewStaffPage() {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    redirect('/admin/usuarios')
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link
          href="/admin/usuarios"
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
          Volver a usuarios
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Crear Usuario Staff
        </h1>
        <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-base)' }}>
          Crea una cuenta para el panel. Los roles disponibles son admin (acceso total) y vendor (solo sus productos).
        </p>
      </div>

      <StaffForm />
    </div>
  )
}
