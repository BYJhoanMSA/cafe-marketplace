'use client'

// src/components/auth/RegisterForm.tsx
// Registro en dos pasos:
//   Paso 1) Datos del usuario (correo, celular, nombre, apellido, clave + confirmar).
//   Paso 2) Código de 6 dígitos enviado al correo. La cuenta solo se crea
//           después de validar ese código (nunca antes).

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { registerUser, confirmRegistration } from '@/server/actions/auth.actions'
import styles from '@/app/(public)/auth/layout.module.css'

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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
    setMessage('')

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const result = await registerUser(formData)
      if (result.success && result.pendingVerification) {
        setStep('verify')
        setCode('')
        setMessage(result.message || 'Te enviamos un código de 6 dígitos a tu correo.')
      } else {
        setError(result.error ?? 'Error al registrar usuario')
      }
    } catch {
      setError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (code.length !== 6) {
      setError('Ingresa el código de 6 dígitos')
      return
    }

    setLoading(true)

    try {
      const result = await confirmRegistration(formData, code)
      if (result.success) {
        if (result.autoLogin) {
          goHome()
        } else {
          router.push('/auth/login')
        }
        return
      }
      setError(result.error ?? 'No fue posible verificar el código')
    } catch {
      setError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'verify') {
    return (
      <>
        {error && <div className={styles.errorBox}>{error}</div>}
        {message && (
          <div
            className={styles.errorBox}
            style={{
              backgroundColor: 'var(--forest-100)',
              color: 'var(--forest-700)',
              borderColor: 'var(--forest-300)',
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
              Ingresa el código de 6 dígitos enviado a <strong>{formData.email}</strong>
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
            Verificar y crear cuenta
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setStep('form')
            setCode('')
            setError('')
            setMessage('')
          }}
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
          Cambiar mis datos
        </button>
      </>
    )
  }

  return (
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
            autoComplete="given-name"
          />
          <Input
            label="Apellido"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            autoComplete="family-name"
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
          autoComplete="email"
        />
        <Input
          label="Celular"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="+57 300 000 0000"
          autoComplete="tel"
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
        />

        <Button type="submit" isLoading={loading} size="lg" style={{ marginTop: 'var(--space-2)' }}>
          Enviar código de verificación
        </Button>
      </form>
      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-ink-tertiary)',
          marginTop: 'var(--space-3)',
          textAlign: 'center',
        }}
      >
        Te enviaremos un código de 6 dígitos a tu correo para confirmar tu cuenta.
      </p>
    </>
  )
}
