'use client'

// src/components/layout/Footer/Footer.tsx
import Link from 'next/link'
import { Ornament } from '@/components/ui/Ornament'
import { BrandIcon } from '@/components/ui/Icons/NavIcons'
import styles from './Footer.module.css'

const FOOTER_LINKS = [
  {
    title: 'Navegación',
    links: [
      { href: '/', label: 'Inicio' },
      { href: '/catalogo', label: 'Catálogo de Cafés' },
      { href: '/origenes', label: 'Orígenes' },
      { href: '/tostadores', label: 'Tostadores' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { href: '/envio', label: 'Estrategia de Envío' },
      { href: '/pqr', label: 'Centro de Ayuda' },
      { href: '/nosotros', label: 'Nosotros' },
      { href: '/buscar', label: 'Buscar' },
    ],
  },
  {
    title: 'Catálogo',
    links: [
      { href: '/catalogo?tueste=light', label: 'Tueste Ligero' },
      { href: '/catalogo?tueste=medium', label: 'Tueste Medio' },
      { href: '/catalogo?nota=frutal', label: 'Notas Frutales' },
      { href: '/catalogo?nota=chocolatoso', label: 'Notas Chocolatosas' },
    ],
  },
  {
    title: 'Cuenta',
    links: [
      { href: '/auth/login', label: 'Iniciar sesión' },
      { href: '/auth/registro', label: 'Crear cuenta' },
      { href: '/favoritos', label: 'Favoritos' },
      { href: '/perfil-de-sabor', label: 'Perfil de sabor' },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <Ornament tone="light" className={styles.footerOrnament} />

        {/* ---- TOP ---- */}
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="Cafe Seleccion — Inicio">
              <span className={styles.logoIcon} aria-hidden="true"><BrandIcon size={34} strokeWidth={1.6} /></span>
              <span className={styles.logoText}>Cafe Seleccion</span>
            </Link>
            <p className={styles.tagline}>
              Conectamos a los mejores tostadores de especialidad del mundo con
              amantes del café que buscan algo más que una taza.
            </p>
            {/* Redes sociales */}
            <div className={styles.socials} role="list" aria-label="Redes sociales">
              <a
                href="https://instagram.com"
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                role="listitem"
              >
                IG
              </a>
              <a
                href="https://tiktok.com"
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                role="listitem"
              >
                TT
              </a>
              <a
                href="https://x.com"
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                role="listitem"
              >
                X
              </a>
            </div>
          </div>
        </div>

        {/* ---- LINKS ---- */}
        <nav className={styles.links} aria-label="Links del footer">
          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className={styles.linkGroup}>
              <h3 className={styles.linkGroupTitle}>{group.title}</h3>
              <ul className={styles.linkGroupList} role="list">
                {group.links.map((link) => (
                  <li key={link.href} role="listitem">
                    <Link href={link.href} className={styles.footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ---- BOTTOM ---- */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} Cafe Seleccion. Todos los derechos reservados.
          </p>
          <div className={styles.certifications} aria-label="Certificaciones y métodos de pago">
            <span className={styles.certBadge}>SCA Member</span>
            <span className={styles.certBadge}>Stripe Secure</span>
            <span className={styles.certBadge}>SSL/TLS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
