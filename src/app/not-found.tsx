import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoCafeIcon } from '@/components/ui/Icons/NavIcons'

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe.',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        backgroundColor: 'var(--color-bg-primary)',
        textAlign: 'center',
        gap: 'var(--space-6)',
      }}
    >
      <span style={{ fontSize: '4rem', lineHeight: 1 }} role="img" aria-label="Taza de café">
        <LogoCafeIcon size={128} strokeWidth={1} />
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-primary)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-ink-primary)',
        }}
      >
        Página no encontrada
      </h1>
      <p
        style={{
          fontSize: 'var(--text-md)',
          color: 'var(--color-ink-secondary)',
          maxWidth: '480px',
          lineHeight: 'var(--leading-relaxed)',
        }}
      >
        Parece que esta página se perdió en el proceso de tostado. Vuelve al
        inicio y descubre nuestros cafés.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--padding-button-lg)',
          backgroundColor: 'var(--color-interactive)',
          color: 'var(--color-ink-inverted)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-secondary)',
          fontWeight: 'var(--font-weight-semibold)',
          fontSize: 'var(--text-base)',
          textDecoration: 'none',
          transition: 'var(--transition-normal)',
        }}
      >
        Volver al inicio
      </Link>
    </main>
  )
}
