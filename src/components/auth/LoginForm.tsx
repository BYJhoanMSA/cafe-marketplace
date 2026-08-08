'use client'

// src/components/auth/LoginForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { loginUser, googleSignIn, magicLinkSignIn } from '@/server/actions/auth.actions'
import { OtpCodeAuth } from '@/components/auth/OtpCodeAuth'
import styles from '@/app/(public)/auth/layout.module.css'

export function LoginForm({ showGoogle = false }: { showGoogle?: boolean }) {
  const router = useRouter()
  const [mode, setMode] = useState<'password' | 'code'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const goHome = () => {
    router.push('/')
    router.refresh()
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await loginUser({ email, password })
      if (result.success) {
        // Redirigir al panel de administración
        router.push('/admin')
        router.refresh() // Forzar re-evaluación del estado de sesión en el layout
      } else {
        setError(result.error ?? 'Error de autenticación')
      }
    } catch (err) {
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    await googleSignIn()
    // No reseteamos loading porque redirecciona
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Ingresa tu email para enviarte el enlace')
      return
    }
    setMagicLoading(true)
    setError('')
    try {
      const result = await magicLinkSignIn(email)
      if (result.success) {
        setSuccess('Enlace mágico enviado. Revisa tu bandeja de entrada.')
      } else {
        setError(result.error ?? 'Error al enviar enlace')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setMagicLoading(false)
    }
  }

  return (
    <>
      {/* Selector de método */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', padding: '4px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
        <button
          type="button"
          onClick={() => setMode('password')}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: mode === 'password' ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)',
            background: mode === 'password' ? 'var(--color-bg-elevated)' : 'transparent',
            color: mode === 'password' ? 'var(--color-ink-primary)' : 'var(--color-ink-secondary)',
            boxShadow: mode === 'password' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          Contraseña
        </button>
        <button
          type="button"
          onClick={() => setMode('code')}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: mode === 'code' ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)',
            background: mode === 'code' ? 'var(--color-bg-elevated)' : 'transparent',
            color: mode === 'code' ? 'var(--color-ink-primary)' : 'var(--color-ink-secondary)',
            boxShadow: mode === 'code' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          Código por correo
        </button>
      </div>

      {mode === 'code' ? (
        <OtpCodeAuth onSuccess={goHome} />
      ) : (
        <>
          {error && <div className={styles.errorBox}>{error}</div>}
          {success && <div className={styles.errorBox} style={{ backgroundColor: 'var(--forest-100)', color: 'var(--forest-700)', borderColor: 'var(--forest-300)' }}>{success}</div>}

          <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Usuario o Correo"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="dkar o tu@email.com"
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Button type="submit" isLoading={loading} size="lg" style={{ marginTop: 'var(--space-2)' }}>
              Iniciar Sesión
            </Button>
          </form>

          <div className={styles.divider}>O continúa con</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {showGoogle && (
              <Button
                variant="secondary"
                onClick={handleGoogleSignIn}
                isLoading={googleLoading}
              >
                {/* Icono de Google inline para no instalar librerías pesadas extra */}
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleMagicLink}
              isLoading={magicLoading}
              type="button"
            >
              Enviar Magic Link
            </Button>
          </div>
        </>
      )}
    </>
  )
}
