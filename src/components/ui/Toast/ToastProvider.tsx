'use client'

// src/components/ui/Toast/ToastProvider.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { nanoid } from 'nanoid'
import { Toast, type ToastData, type ToastType } from './Toast'
import styles from './Toast.module.css'

interface ToastContextType {
  toast: (options: Omit<ToastData, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((options: Omit<ToastData, 'id'>) => {
    const id = nanoid()
    setToasts((prev) => {
      // Máximo 3 toasts visibles
      const newToasts = [...prev, { ...options, id }]
      if (newToasts.length > 3) return newToasts.slice(-3)
      return newToasts
    })
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <ul className={styles.viewport} aria-live="polite">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </ul>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
