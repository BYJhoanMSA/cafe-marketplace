'use client'

// src/components/ui/Toast/Toast.tsx
import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './Toast.module.css'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastData {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastProps {
  toast: ToastData
  onRemove: (id: string) => void
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const Icon = ICONS[toast.type]
  const duration = toast.duration ?? 5000

  useEffect(() => {
    if (duration === Infinity) return

    const timer = setTimeout(() => {
      setIsRemoving(true)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  useEffect(() => {
    if (isRemoving) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, 300) // Coincide con la duración de la transición CSS
      return () => clearTimeout(timer)
    }
  }, [isRemoving, onRemove, toast.id])

  return (
    <li 
      className={cn(styles.toast, styles[toast.type], isRemoving && styles.removing)}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <Icon className={styles.icon} size={20} aria-hidden="true" />
      
      <div className={styles.content}>
        <h3 className={styles.title}>{toast.title}</h3>
        {toast.description && (
          <p className={styles.description}>{toast.description}</p>
        )}
      </div>

      <button 
        className={styles.closeButton}
        onClick={() => setIsRemoving(true)}
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </li>
  )
}
