// src/app/(admin)/admin/usuarios/[id]/page.tsx
// Editar un usuario staff: perfil, rol, estado y resetear contraseña.
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { StaffForm } from '@/components/admin/StaffForm'
import { ResetPasswordForm } from '@/components/admin/ResetPasswordForm'
import { getAdminUserById } from '@/server/actions/admin/user.actions'
import { formatRelativeDate } from '@/lib/utils'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'Editar Usuario | Panel Admin',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditStaffPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    redirect('/admin/usuarios')
  }

  const { id } = await params
  const user = await getAdminUserById(id)
  if (!user) {
    notFound()
  }

  const isSelf = user.id === session.user.id

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
            Editar Usuario
          </h1>
          {isSelf && <Badge variant="gold">Tu cuenta</Badge>}
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-base)' }}>
          Registrado {formatRelativeDate(user.createdAt)} · Último acceso{' '}
          {user.lastLoginAt ? formatRelativeDate(user.lastLoginAt) : 'nunca'}
        </p>
      </div>

      <StaffForm
        initialData={{
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          status: user.status,
        }}
      />

      {!isSelf && (
        <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border-default)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>
            Restablecer contraseña
          </h2>
          <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Genera una nueva contraseña para este usuario. La anterior deja de ser válida.
          </p>
          <ResetPasswordForm userId={user.id} />
        </div>
      )}
    </div>
  )
}
