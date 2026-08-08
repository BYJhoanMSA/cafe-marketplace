'use client'

// src/components/auth/RegisterForm.tsx
// Registro en un solo paso: correo, WhatsApp, nombre, apellido y clave.
// La cuenta se crea inmediatamente (sin verificación por código).

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { registerUser } from '@/server/actions/auth.actions'
import styles from '@/app/(public)/auth/layout.module.css'

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
      if (result.success) {
        if (result.autoLogin) {
          goHome()
        } else {
          router.push('/auth/login')
        }
        return
      }
      setError(result.error ?? 'Error al registrar usuario')
    } catch {
      setError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
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
          label="Celular / WhatsApp"
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
          Crear cuenta
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
        Al crear tu cuenta inicias sesión automáticamente. Sin verificación por correo.
      </p>
    </>
  )
}
