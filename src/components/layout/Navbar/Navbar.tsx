'use client'

// src/components/layout/Navbar/Navbar.tsx
// Header desktop con glassmorphism + Tab bar mobile estilo iOS

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  ShoppingBag,
  Heart,
  User,
  MagnifyingGlass,
  House,
  GridFour,
  List,
  X,
  Moon,
  Sun,
  Coffee,
} from '@phosphor-icons/react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
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
  { href: '/pqr', label: 'PQR' },
]

// ================================================================
// Items del Tab Bar (mobile)
// ================================================================
const TAB_ITEMS = [
  { href: '/', icon: House, label: 'Inicio' },
  { href: '/catalogo', icon: GridFour, label: 'Catálogo' },
  { href: '/buscar', icon: MagnifyingGlass, label: 'Buscar' },
  { href: '/favoritos', icon: Heart, label: 'Favoritos' },
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
            <span className={styles.logoIcon} aria-hidden="true"><Coffee size={24} weight="fill" /></span>
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
                {searchOpen ? <X size={20} /> : <MagnifyingGlass size={20} />}
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
              <Heart size={20} />
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
              <ShoppingBag size={20} />
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
              <User size={20} />
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
              <House size={22} />
              <span className={styles.tabActiveIndicator} aria-hidden="true" />
            </span>
            <span className={styles.tabLabel}>Inicio</span>
          </Link>

          {/* Buscar */}
          <Link
            href="/buscar"
            className={`${styles.tabItem} ${isActive('/buscar') ? styles.active : ''}`}
            aria-label="Buscar productos"
            aria-current={isActive('/buscar') ? 'page' : undefined}
          >
            <span className={styles.tabIcon}>
              <MagnifyingGlass size={22} />
              <span className={styles.tabActiveIndicator} aria-hidden="true" />
            </span>
            <span className={styles.tabLabel}>Buscar</span>
          </Link>

          {/* CENTRO — Catálogo (prominente) */}
          <Link
            href="/catalogo"
            className={styles.tabItemCenter}
            aria-label="Ver catálogo"
          >
            <span className={styles.tabCenterIcon}>
              <GridFour size={22} />
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
              <Heart size={22} />
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
              <ShoppingBag size={22} />
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
