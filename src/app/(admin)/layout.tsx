// src/app/(admin)/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminShell } from './AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Proteger la ruta: solo admin o vendor
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
    redirect('/auth/login')
  }

  const isAdmin = session.user.role === 'admin'
  const initial = session.user.name ? session.user.name.charAt(0).toUpperCase() : 'A'

  return (
    <AdminShell
      isAdmin={isAdmin}
      userName={session.user.name}
      userRole={session.user.role}
      initial={initial}
    >
      {children}
    </AdminShell>
  )
}
