'use client'

// src/app/(admin)/AdminShell.tsx
// Shell del panel de administración:
// - Desktop: sidebar fijo (igual que antes).
// - Mobile: menú hamburguesa que abre un drawer lateral.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { Menu, X, Package, Tags, Box, ShoppingCart, LogOut, Home, MapPin } from 'lucide-react'
import { signOut } from 'next-auth/react'
import styles from './AdminShell.module.css'

interface AdminShellProps {
  isAdmin: boolean
  userName?: string | null
  userRole?: string
  initial: string
  children: ReactNode
}

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: Box, adminOnly: false },
  { href: '/admin/inicio', label: 'Página de Inicio', icon: Box, adminOnly: true },
  { href: '/admin/productos', label: 'Productos', icon: Package, adminOnly: false },
  { href: '/admin/marcas', label: 'Marcas', icon: Tags, adminOnly: false },
  { href: '/admin/inventario', label: 'Inventario', icon: Box, adminOnly: false },
  { href: '/admin/turismo', label: 'Turismo', icon: MapPin, adminOnly: true },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart, adminOnly: true },
  { href: '/admin/clientes', label: 'Clientes', icon: ShoppingCart, adminOnly: true },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Box, adminOnly: true },
  { href: '/admin/roles', label: 'Roles', icon: Box, adminOnly: true },
  { href: '/admin/reportes', label: 'Reportes', icon: Box, adminOnly: true },
  { href: '/admin/configuraciones', label: 'Configuración', icon: Box, adminOnly: true },
  { href: '/admin/logs', label: 'Logs', icon: Box, adminOnly: true },
]

function NavLinks({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {NAV_LINKS.filter((l) => !l.adminOnly || isAdmin).map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} />
            {link.label}
          </Link>
        )
      })}
    </>
  )
}

export function AdminShell({ isAdmin, userName, userRole, initial, children }: AdminShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Cerrar el drawer al navegar
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  const closeSidebar = () => setSidebarOpen(false)

  const profile = (
    <>
      <div className={styles.avatar}>{initial}</div>
      <div className={styles.userInfo}>
        <div className={styles.userName}>{userName}</div>
        <div className={styles.userRole}>{userRole}</div>
      </div>
      <button
        type="button"
        className={styles.logoutButton}
        onClick={() => signOut({ callbackUrl: '/' })}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        <LogOut size={20} />
      </button>
    </>
  )

  return (
    <div className={styles.container}>
      {/* Sidebar desktop */}
      <aside className={styles.sidebar}>
        <Link href="/admin/productos" className={styles.logo}>
          Marketplace
        </Link>
        <nav className={styles.nav}>
          <NavLinks isAdmin={isAdmin} />
        </nav>
        <div className={styles.userProfile}>{profile}</div>
      </aside>

      {/* Backdrop + Drawer mobile */}
      <div
        className={`${styles.backdrop} ${sidebarOpen ? styles.backdropOpen : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${sidebarOpen ? styles.drawerOpen : ''}`}
        aria-label="Menú de administración"
        aria-hidden={!sidebarOpen}
      >
        <div className={styles.drawerHeader}>
          <Link href="/admin/productos" className={styles.logo} onClick={closeSidebar}>
            Marketplace
          </Link>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>
        <nav className={styles.nav}>
          <NavLinks isAdmin={isAdmin} onNavigate={closeSidebar} />
          <Link
            href="/"
            className={`${styles.navItem} ${styles.homeItem}`}
            onClick={closeSidebar}
          >
            <Home size={20} />
            Volver a la página de inicio
          </Link>
        </nav>
        <div className={styles.userProfile}>{profile}</div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
            Panel de Administración
          </h2>
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  )
}
