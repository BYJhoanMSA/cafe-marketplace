'use client'

// src/components/layout/Navbar/Navbar.tsx
// Header desktop con glassmorphism + Tab bar mobile estilo iOS

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { X, Moon, Sun } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { usePillBar } from '@/components/ui/PillSelector/PillBarContext'
import { LogoCafeIcon, SearchIcon, HeartIcon, CartIcon, UserIcon, HomeIcon, CatalogIcon } from '@/components/ui/Icons/NavIcons'
import styles from './Navbar.module.css'

// ================================================================
// Tipos
// ================================================================
interface NavbarProps {
  cartItemCount?: number
  userName?: string | null
}

// ================================================================
// Hook: detectar scroll para añadir sombra al header
// ================================================================
function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])
  return scrolled
}

// ================================================================
// Hook: gestionar tema dark/light
// ================================================================
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Leer el tema que ya aplicó el script inline del layout
    const current = document.documentElement.dataset.theme as 'light' | 'dark'
    setTheme(current ?? 'light')
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    document.documentElement.dataset.theme = next
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  return { theme, toggleTheme }
}

// ================================================================
// Navegación principal (desktop)
// ================================================================
const NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/envio', label: 'Envío' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/pqr', label: 'Centro de Ayuda' },
]

// ================================================================
// Componente principal
// ================================================================
export function Navbar({ cartItemCount: externalCount, userName }: NavbarProps) {
  const { totalItemsCount, openCart } = useCart()
  const { favoriteCount } = useFavorites()
  const cartItemCount = externalCount ?? totalItemsCount

  const pathname = usePathname()
  const scrolled = useScrolled()
  const { theme, toggleTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Enfocar el input de búsqueda al abrirse
  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus()
    }
  }, [searchOpen])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const { isOpen: pillBarOpen, toggle: togglePillBar } = usePillBar()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      {/* ============================================================
          HEADER DESKTOP
          ============================================================ */}
      <header
        className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
        role="banner"
      >
        <div className={styles.headerInner}>
          {/* Navegación izquierda */}
          <nav aria-label="Navegación principal">
            <ul className={styles.nav} role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.navLink} ${isActive(link.href) ? styles.active : ''}`}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logo centrado */}
          <Link href="/" className={styles.logo} aria-label="Cafe Seleccion — Inicio">
            <span className={styles.logoIcon} aria-hidden="true"><LogoCafeIcon size={40} strokeWidth={1} /></span>
            <span className={styles.logoText}>Cafe Seleccion</span>
          </Link>

          {/* Acciones derecha */}
          <div className={styles.actions} role="group" aria-label="Acciones de usuario">
            {/* Búsqueda */}
            <div className={styles.searchWrapper}>
              <button
                className={styles.actionButton}
                onClick={() => setSearchOpen((o) => !o)}
                aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar productos'}
                aria-expanded={searchOpen}
              >
                {searchOpen ? <X size={20} /> : <SearchIcon size={20} />}
              </button>
            </div>

            {/* Toggle dark mode */}
            <button
              className={styles.actionButton}
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Favoritos */}
            <Link
              href="/favoritos"
              className={styles.actionButton}
              aria-label={`Mis favoritos, ${favoriteCount} cafés`}
            >
              <HeartIcon size={20} />
              {favoriteCount > 0 && (
                <span className={styles.cartBadge} aria-hidden="true" style={{ backgroundColor: 'var(--terra-500)' }}>
                  {favoriteCount > 99 ? '99+' : favoriteCount}
                </span>
              )}
            </Link>

            {/* Carrito */}
            <button
              type="button"
              className={styles.actionButton}
              onClick={openCart}
              aria-label={`Carrito de compras, ${cartItemCount} ${cartItemCount === 1 ? 'producto' : 'productos'}`}
            >
              <CartIcon size={20} />
              {cartItemCount > 0 && (
                <span className={styles.cartBadge} aria-hidden="true">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Cuenta */}
            <Link
              href={userName ? '/cuenta' : '/auth/login'}
              className={styles.actionButton}
              aria-label={userName ? `Mi cuenta: ${userName}` : 'Iniciar sesión'}
            >
              <UserIcon size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Espaciador para el contenido debajo del header fijo */}
      <div className={styles.headerSpacer} aria-hidden="true" />

      {/* ============================================================
          TAB BAR MOBILE
          ============================================================ */}
      <nav
        className={styles.tabBar}
        aria-label="Navegación móvil"
        role="navigation"
      >
        <div className={styles.tabBarInner}>
          {/* Inicio */}
          <Link
            href="/"
            className={`${styles.tabItem} ${isActive('/') ? styles.active : ''}`}
            aria-label="Inicio"
            aria-current={isActive('/') ? 'page' : undefined}
          >
            <span className={styles.tabIcon}>
              <HomeIcon size={28} />
              <span className={styles.tabActiveIndicator} aria-hidden="true" />
            </span>
            <span className={styles.tabLabel}>Inicio</span>
          </Link>

          {/* Buscar — en mobile abre el selector de sabores */}
          {isMobile ? (
            <button
              type="button"
              className={`${styles.tabItem} ${pillBarOpen ? styles.active : ''}`}
              onClick={togglePillBar}
              aria-label="Buscar productos"
              aria-pressed={pillBarOpen}
            >
              <span className={styles.tabIcon}>
                <SearchIcon size={28} />
                <span className={styles.tabActiveIndicator} aria-hidden="true" />
              </span>
              <span className={styles.tabLabel}>Buscar</span>
            </button>
          ) : (
            <Link
              href="/buscar"
              className={`${styles.tabItem} ${isActive('/buscar') ? styles.active : ''}`}
              aria-label="Buscar productos"
              aria-current={isActive('/buscar') ? 'page' : undefined}
            >
              <span className={styles.tabIcon}>
                <SearchIcon size={28} />
                <span className={styles.tabActiveIndicator} aria-hidden="true" />
              </span>
              <span className={styles.tabLabel}>Buscar</span>
            </Link>
          )}

          {/* CENTRO — Catálogo (prominente) */}
          <Link
            href="/catalogo"
            className={styles.tabItemCenter}
            aria-label="Ver catálogo"
          >
            <span className={styles.tabCenterIcon}>
              <CatalogIcon size={40} strokeWidth={2} />
            </span>
            <span className={styles.tabCenterLabel}>Catálogo</span>
          </Link>

          {/* Favoritos */}
          <Link
            href="/favoritos"
            className={`${styles.tabItem} ${isActive('/favoritos') ? styles.active : ''}`}
            aria-label="Mis favoritos"
            aria-current={isActive('/favoritos') ? 'page' : undefined}
          >
            <span className={styles.tabIcon}>
              <HeartIcon size={28} />
              <span className={styles.tabActiveIndicator} aria-hidden="true" />
            </span>
            <span className={styles.tabLabel}>Favoritos</span>
          </Link>

          {/* Carrito Mobile */}
          <button
            type="button"
            className={`${styles.tabItem} ${isActive('/carrito') ? styles.active : ''}`}
            onClick={openCart}
            aria-label="Abrir Carrito"
          >
            <span className={styles.tabIcon} style={{ position: 'relative' }}>
              <CartIcon size={28} />
              {cartItemCount > 0 && (
                <span className={styles.cartBadge} aria-hidden="true">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
              <span className={styles.tabActiveIndicator} aria-hidden="true" />
            </span>
            <span className={styles.tabLabel}>Carrito</span>
          </button>
        </div>
      </nav>
    </>
  )
}
