'use client'

// src/components/admin/ResetPasswordForm.tsx
// Resetear la contraseña de un usuario staff desde el panel admin.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { resetStaffPassword } from '@/server/actions/admin/user.actions'

interface ResetPasswordFormProps {
  userId: string
  disabled?: boolean
}

export function ResetPasswordForm({ userId, disabled }: ResetPasswordFormProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!window.confirm('¿Resetear la contraseña de este usuario?')) return
    setError('')
    setDone(false)
    setLoading(true)

    const res = await resetStaffPassword(userId, password)
    if (res.success) {
      setPassword('')
      setDone(true)
      router.refresh()
    } else {
      setError(res.error || 'Error al resetear la contraseña')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '400px' }}>
      {error && (
        <div
          style={{
            color: 'var(--terra-500)',
            padding: '0.75rem',
            background: 'var(--terra-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {error}
        </div>
      )}
      {done && (
        <div
          style={{
            color: 'var(--forest-500)',
            padding: '0.75rem',
            background: 'var(--forest-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
          }}
        >
          Contraseña actualizada.
        </div>
      )}
      <Input
        label="Nueva contraseña"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        hint="Mínimo 8 caracteres"
      />
      <div>
        <Button type="submit" variant="secondary" isLoading={loading} disabled={disabled}>
          Resetear contraseña
        </Button>
      </div>
    </form>
  )
}
