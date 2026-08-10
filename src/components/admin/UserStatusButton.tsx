'use client'

// src/components/admin/UserStatusButton.tsx
// Botón para bloquear/activar un usuario desde el panel admin.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setUserStatus } from '@/server/actions/admin/user.actions'

interface UserStatusButtonProps {
  userId: string
  status: string
}

export function UserStatusButton({ userId, status }: UserStatusButtonProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const active = status === 'active'

  const run = async (next: string, label: string) => {
    if (!window.confirm(`¿${label} a este usuario?`)) return
    setBusy(true)
    const res = await setUserStatus(userId, next)
    if (res.success) {
      router.refresh()
    } else {
      window.alert(res.error || 'Error al actualizar el estado')
    }
    setBusy(false)
  }

  if (active) {
    return (
      <button
        type="button"
        onClick={() => run('banned', 'Bloquear')}
        disabled={busy}
        style={{
          background: 'none',
          border: '1px solid var(--terra-500)',
          color: 'var(--terra-500)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-1) var(--space-3)',
          fontSize: 'var(--text-xs)',
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        Bloquear
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => run('active', 'Activar')}
      disabled={busy}
      style={{
        background: 'none',
        border: '1px solid var(--forest-500)',
        color: 'var(--forest-500)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-1) var(--space-3)',
        fontSize: 'var(--text-xs)',
        cursor: busy ? 'wait' : 'pointer',
      }}
    >
      Activar
    </button>
  )
}
