'use client'

// src/components/auth/RegisterForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { registerUser } from '@/server/actions/auth.actions'
import { OtpCodeAuth } from '@/components/auth/OtpCodeAuth'
import styles from '@/app/(public)/auth/layout.module.css'

export function RegisterForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'password' | 'code'>('password')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const goHome = () => {
    router.push('/')
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validación básica cliente
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)

    try {
      const result = await registerUser(formData)
      if (result.success) {
        // Cuenta creada. Si el login automático funcionó, vamos al inicio;
        // si no (p. ej. sesión no persistida), invitamos a iniciar sesión.
        if (result.autoLogin) {
          router.push('/')
          router.refresh()
        } else {
          router.push('/auth/login')
        }
      } else {
        setError(result.error ?? 'Error al registrar usuario')
      }
    } catch {
      setError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setLoading(false)
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
          Con contraseña
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
          Con código por correo
        </button>
      </div>

      {mode === 'code' ? (
        <OtpCodeAuth onSuccess={goHome} />
      ) : (
        <>
          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <Input
                label="Nombre"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
            />
            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Mínimo 8 caracteres"
            />

            <Button type="submit" isLoading={loading} size="lg" style={{ marginTop: 'var(--space-2)' }}>
              Crear cuenta
            </Button>
          </form>
        </>
      )}
    </>
  )
}
