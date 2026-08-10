'use client'

// src/components/admin/RoleChangeSelect.tsx
// Selector de cambio rápido de rol desde la página de Roles.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setUserRole } from '@/server/actions/admin/user.actions'

interface RoleChangeSelectProps {
  userId: string
  role: string
  disabled?: boolean
}

export function RoleChangeSelect({ userId, role, disabled }: RoleChangeSelectProps) {
  const router = useRouter()
  const [value, setValue] = useState(role)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    if (next === value) return
    if (!window.confirm(`¿Cambiar el rol a "${next}"? Esto afecta sus permisos de acceso.`)) return
    setBusy(true)
    setError('')
    const res = await setUserRole(userId, next)
    if (res.success) {
      setValue(next)
      router.refresh()
    } else {
      setError(res.error || 'Error al cambiar el rol')
    }
    setBusy(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', alignItems: 'flex-start' }}>
      <select
        value={value}
        onChange={handleChange}
        disabled={busy || disabled}
        style={{
          padding: 'var(--space-1) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-default)',
          background: 'var(--color-bg-primary)',
          fontSize: 'var(--text-sm)',
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        <option value="customer">customer</option>
        <option value="vendor">vendor</option>
        <option value="admin">admin</option>
      </select>
      {error && <span style={{ color: 'var(--terra-500)', fontSize: 'var(--text-xs)' }}>{error}</span>}
    </div>
  )
}
