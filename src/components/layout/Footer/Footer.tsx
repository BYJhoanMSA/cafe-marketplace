'use client'

// src/components/layout/Footer/Footer.tsx
import Link from 'next/link'
import { useState } from 'react'
import { Coffee } from '@phosphor-icons/react'
import styles from './Footer.module.css'

const FOOTER_LINKS = [
  {
    title: 'Navegación',
    links: [
      { href: '/', label: 'Inicio' },
      { href: '/catalogo', label: 'Catálogo de Cafés' },
      { href: '/origenes', label: 'Orígenes' },
      { href: '/envio', label: 'Estrategia de Envío' },
      { href: '/pqr', label: 'PQR' },
    ],
  },
  {
    title: 'Información',
    links: [
      { href: '/catalogo?tueste=light', label: 'Tueste Ligero' },
      { href: '/catalogo?tueste=medium', label: 'Tueste Medio' },
      { href: '/catalogo?nota=frutal', label: 'Notas Frutales' },
      { href: '/catalogo?nota=chocolatoso', label: 'Notas Chocolatosas' },
    ],
  },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    // TODO: conectar con Resend/lista de correos
    setSubscribed(true)
    setEmail('')
  }

  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        {/* ---- TOP ---- */}
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="Cafe Seleccion — Inicio">
              <span className={styles.logoIcon} aria-hidden="true"><Coffee size={24} weight="fill" /></span>
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

          {/* Newsletter */}
          <div className={styles.newsletter}>
            <h2 className={styles.newsletterTitle}>
              El mundo del café, en tu bandeja
            </h2>
            <p className={styles.newsletterDesc}>
              Nuevos orígenes, guías de preparación y ofertas exclusivas cada semana.
              Sin spam, solo café.
            </p>
            {subscribed ? (
              <p style={{ color: 'var(--forest-300)', fontSize: 'var(--text-sm)' }}>
                ✓ ¡Suscrito! Revisa tu email para confirmar.
              </p>
            ) : (
              <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={styles.newsletterInput}
                  required
                  aria-label="Tu dirección de email"
                />
                <button type="submit" className={styles.newsletterButton}>
                  Suscribirse
                </button>
              </form>
            )}
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
