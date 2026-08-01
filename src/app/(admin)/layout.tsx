// src/app/(admin)/layout.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Tags, Box, ShoppingCart, LogOut } from 'lucide-react'
import { auth, signOut } from '@/lib/auth'
import styles from './layout.module.css'

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
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <Link href="/admin/productos" className={styles.logo}>
          Marketplace
        </Link>
        
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navItem}>
            <Box size={20} />
            Dashboard
          </Link>
          {isAdmin && (
            <Link href="/admin/inicio" className={styles.navItem}>
              <Box size={20} />
              Página de Inicio
            </Link>
          )}
          <Link href="/admin/productos" className={styles.navItem}>
            <Package size={20} />
            Productos
          </Link>
          <Link href="/admin/marcas" className={styles.navItem}>
            <Tags size={20} />
            Marcas
          </Link>
          <Link href="/admin/inventario" className={styles.navItem}>
            <Box size={20} />
            Inventario
          </Link>
          {isAdmin && (
            <>
              <Link href="/admin/pedidos" className={styles.navItem}>
                <ShoppingCart size={20} />
                Pedidos
              </Link>
              <Link href="/admin/clientes" className={styles.navItem}>
                <ShoppingCart size={20} /> {/* Placeholder icon */}
                Clientes
              </Link>
              <Link href="/admin/usuarios" className={styles.navItem}>
                <Box size={20} /> {/* Placeholder icon */}
                Usuarios
              </Link>
              <Link href="/admin/roles" className={styles.navItem}>
                <Box size={20} /> {/* Placeholder icon */}
                Roles
              </Link>
              <Link href="/admin/reportes" className={styles.navItem}>
                <Box size={20} /> {/* Placeholder icon */}
                Reportes
              </Link>
              <Link href="/admin/configuraciones" className={styles.navItem}>
                <Box size={20} /> {/* Placeholder icon */}
                Configuración
              </Link>
              <Link href="/admin/logs" className={styles.navItem}>
                <Box size={20} /> {/* Placeholder icon */}
                Logs
              </Link>
            </>
          )}
        </nav>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>{initial}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{session.user.name}</div>
            <div className={styles.userRole}>{session.user.role}</div>
          </div>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button 
              type="submit" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-secondary)' }}
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
            Panel de Administración
          </h2>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}
