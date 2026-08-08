'use client'

// src/components/auth/OtpCodeAuth.tsx
// Acceso por código de 6 dígitos enviado al correo.
// Maneja los dos pasos: pedir el código y verificarlo.
// Sirve tanto para iniciar sesión como para registrarse (crea la cuenta
// automáticamente si el correo no existe).

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { requestLoginCode, verifyLoginCode } from '@/server/actions/auth.actions'
import styles from '@/app/(public)/auth/layout.module.css'

interface OtpCodeAuthProps {
  onSuccess: () => void
}

export function OtpCodeAuth({ onSuccess }: OtpCodeAuthProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const result = await requestLoginCode(email)
      if (result.success) {
        setStep('code')
        setMessage(result.message || 'Revisa tu bandeja de entrada.')
      } else {
        setError(result.error ?? 'No fue posible enviar el código')
      }
    } catch {
      setError('Error al conectar con el servidor. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await verifyLoginCode(email, code)
      if (result.success) {
        onSuccess()
        return
      }
      setError(result.error ?? 'Código incorrecto')
    } catch {
      setError('Error al verificar el código. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'email') {
    return (
      <>
        {error && <div className={styles.errorBox}>{error}</div>}
        <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            autoComplete="email"
          />
          <Button type="submit" isLoading={loading} size="lg" style={{ marginTop: 'var(--space-2)' }}>
            Enviar código
          </Button>
        </form>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)', marginTop: 'var(--space-3)', textAlign: 'center' }}>
          Te enviaremos un código de 6 dígitos. Si el correo no existe, crearemos tu cuenta automáticamente.
        </p>
      </>
    )
  }

  return (
    <>
      {error && <div className={styles.errorBox}>{error}</div>}
      {message && <div className={styles.errorBox} style={{ backgroundColor: 'var(--forest-100)', color: 'var(--forest-700)', borderColor: 'var(--forest-300)' }}>{message}</div>}

      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
            Ingresa el código enviado a <strong>{email}</strong>
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            placeholder="••••••"
            autoFocus
            style={{
              width: '100%',
              textAlign: 'center',
              letterSpacing: '8px',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              background: 'var(--color-bg-primary)',
              fontFamily: 'inherit',
              color: 'var(--color-ink-primary)',
            }}
          />
        </div>
        <Button type="submit" isLoading={loading} size="lg" style={{ marginTop: 'var(--space-2)' }}>
          Ingresar
        </Button>
      </form>

      <button
        type="button"
        onClick={() => { setStep('email'); setCode(''); setError(''); setMessage('') }}
        style={{
          marginTop: 'var(--space-3)',
          background: 'none',
          border: 'none',
          color: 'var(--color-interactive)',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          textDecoration: 'underline',
          alignSelf: 'center',
        }}
      >
        Usar otro correo o reenviar código
      </button>
    </>
  )
}
