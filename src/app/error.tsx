'use client'

import { useEffect } from 'react'
import { Warning } from '@phosphor-icons/react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // En producción, reportar a PostHog u otro servicio de monitoreo
    console.error('[Error Boundary]', error)
  }, [error])

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
      <span style={{ lineHeight: 1 }} role="img" aria-label="Advertencia">
        <Warning size={64} weight="bold" />
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-primary)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-ink-primary)',
        }}
      >
        Algo salió mal
      </h1>
      <p
        style={{
          fontSize: 'var(--text-md)',
          color: 'var(--color-ink-secondary)',
          maxWidth: '480px',
          lineHeight: 'var(--leading-relaxed)',
        }}
      >
        Ocurrió un error inesperado. Por favor intenta de nuevo.
      </p>
      <button
        onClick={reset}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: 'var(--padding-button-lg)',
          backgroundColor: 'var(--color-interactive)',
          color: 'var(--color-ink-inverted)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-secondary)',
          fontWeight: 'var(--font-weight-semibold)',
          fontSize: 'var(--text-base)',
          cursor: 'pointer',
          border: 'none',
          transition: 'var(--transition-normal)',
        }}
      >
        Intentar de nuevo
      </button>
    </main>
  )
}
