'use client'

// src/components/layout/Navbar/Navbar.tsx
// Header desktop con glassmorphism + Tab bar mobile estilo iOS

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { X, Moon, Sun } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { usePillBar } from '@/components/ui/PillSelector/PillBarContext'
import { SearchIcon, HeartIcon, CartIcon, UserIcon, HomeIcon, CatalogIcon, BrandIcon, MenuIcon } from '@/components/ui/Icons/NavIcons'
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
  { href: '/turismo', label: 'Turismo' },
  { href: '/pqr', label: 'Centro de Ayuda' },
]

// ================================================================
// Navegación del menú mobile (links del header + Inicio)
// ================================================================
const MOBILE_MENU_LINKS = [{ href: '/', label: 'Inicio' }, ...NAV_LINKS]

// ================================================================
// Componente principal
// ================================================================
export function Navbar({ cartItemCount: externalCount, userName }: NavbarProps) {
  const { totalItemsCount, openCart } = useCart()
  const { favoriteCount } = useFavorites()
  const cartItemCount = externalCount ?? totalItemsCount

  const pathname = usePathname()
  const router = useRouter()
  const scrolled = useScrolled()
  const { theme, toggleTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  // Enfocar el input de búsqueda al abrirse
  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus()
    }
  }, [searchOpen])

  // Cerrar los menús al navegar
  useEffect(() => {
    setMenuOpen(false)
    setDesktopMenuOpen(false)
  }, [pathname])

  // Cerrar el menú desktop con Escape o al hacer clic fuera
  useEffect(() => {
    if (!desktopMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDesktopMenuOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setDesktopMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [desktopMenuOpen])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const { isOpen: pillBarOpen, toggle: togglePillBar, close: closePillBar } = usePillBar()

  const toggleMenu = () => {
    setMenuOpen((o) => !o)
    if (pillBarOpen) closePillBar()
  }
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
          ANUNCIO SUPERIOR (desktop) — barra de utilidad
          ============================================================ */}
      <div className={styles.announcement} role="status">
        Tueste a pedido · Envío garantizado a todo Colombia
      </div>

      {/* ============================================================
          HEADER DESKTOP
          ============================================================ */}
      <header
        ref={headerRef}
        className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
        role="banner"
      >
        <div className={styles.headerInner}>
          {/* Menú hamburguesa (izquierda) — agrupa los enlaces del header */}
          <div className={styles.leftNav}>
            <button
              type="button"
              className={`${styles.menuButton} ${desktopMenuOpen ? styles.menuButtonOpen : ''}`}
              onClick={() => setDesktopMenuOpen((o) => !o)}
              aria-label={desktopMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={desktopMenuOpen}
              aria-controls="desktop-menu"
            >
              {desktopMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>

          {/* Logo centrado */}
          <Link href="/" className={styles.logo} aria-label="Cafe Seleccion — Inicio">
            <span className={styles.logoIcon} aria-hidden="true"><BrandIcon size={30} strokeWidth={1.6} /></span>
            <span className={styles.logoText}>Cafe Seleccion</span>
          </Link>

          {/* Acciones derecha */}
          <div className={styles.actions} role="group" aria-label="Acciones de usuario">
            {/* Búsqueda */}
            <div className={styles.searchWrapper}>
              <input
                ref={searchRef}
                type="text"
                className={`${styles.searchInput} ${searchOpen ? styles.open : ''}`}
                placeholder="Buscar cafés..."
                aria-label="Buscar productos"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    router.push(`/buscar?q=${encodeURIComponent(e.currentTarget.value.trim())}`)
                    e.currentTarget.value = ''
                    setSearchOpen(false)
                  }
                }}
              />
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
              href={userName ? '/admin' : '/auth/login'}
              className={styles.actionButton}
              aria-label={userName ? `Mi cuenta: ${userName}` : 'Iniciar sesión'}
            >
              <UserIcon size={20} />
            </Link>
          </div>
        </div>

        {/* MENU DESPLEGABLE DESKTOP — agrupa los enlaces del header */}
        {desktopMenuOpen && (
          <nav
            id="desktop-menu"
            className={styles.desktopMenu}
            aria-label="Navegación principal"
          >
            <ul className={styles.desktopMenuList} role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.desktopMenuLink} ${isActive(link.href) ? styles.active : ''}`}
                    onClick={() => setDesktopMenuOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
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
          {/* Inicio — en mobile abre el menú con los links del header */}
          {isMobile ? (
            <button
              type="button"
              className={`${styles.tabItem} ${menuOpen || isActive('/') ? styles.active : ''}`}
              onClick={toggleMenu}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <span className={styles.tabIcon}>
                <HomeIcon size={28} />
                <span className={styles.tabActiveIndicator} aria-hidden="true" />
              </span>
              <span className={styles.tabLabel}>Inicio</span>
            </button>
          ) : (
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
          )}

          {/* Buscar — en mobile abre el selector de sabores */}
          {isMobile ? (
            <button
              type="button"
              className={`${styles.tabItem} ${pillBarOpen ? styles.active : ''}`}
              onClick={() => {
                setMenuOpen(false)
                togglePillBar()
              }}
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

      {/* ============================================================
          MENU MOBILE — links del header (overlay sobre el contenido)
          ============================================================ */}
      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        role="dialog"
        aria-label="Menú de navegación"
        aria-hidden={!menuOpen}
      >
        <ul className={styles.mobileMenuList} role="list">
          {MOBILE_MENU_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.mobileMenuLink} ${isActive(link.href) ? styles.active : ''}`}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Acceso a cuenta: dashboard si hay sesión, login/registro si no */}
          <li className={styles.mobileMenuDivider} aria-hidden="true" />
          {userName ? (
            <li>
              <Link
                href="/admin"
                className={`${styles.mobileMenuLink} ${isActive('/admin') ? styles.active : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Mi cuenta
              </Link>
            </li>
          ) : (
            <>
              <li>
                <Link
                  href="/auth/login"
                  className={`${styles.mobileMenuLink} ${isActive('/auth/login') ? styles.active : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/registro"
                  className={`${styles.mobileMenuLink} ${isActive('/auth/registro') ? styles.active : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Crear cuenta
                </Link>
              </li>
            </>
          )}

          {/* Cambiar modo claro/oscuro */}
          <li className={styles.mobileMenuDivider} aria-hidden="true" />
          <li>
            <button
              type="button"
              className={styles.mobileMenuLink}
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            >
              <span className={styles.mobileThemeIcon} aria-hidden="true">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </span>
              {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}
