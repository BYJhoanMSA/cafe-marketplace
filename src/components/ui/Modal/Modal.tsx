'use client'

// src/components/ui/Modal/Modal.tsx
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Manejo de eventos de teclado (Escape), bloqueo de scroll y focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      
      // Focus Trap
      if (e.key === 'Tab') {
        if (!modalRef.current) return
        
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (focusableElements.length === 0) return
        
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    // Enfocar el modal al abrir
    if (modalRef.current) {
      modalRef.current.focus()
    }

    // Bloquear el scroll del body cuando el modal está abierto
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalStyle
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Retorno temprano si no está abierto o estamos en SSR
  if (!isOpen || typeof document === 'undefined') return null

  const modalContent = (
    <div 
      className={styles.overlay}
      onClick={(e) => {
        // Cerrar si se hace click en el overlay (fuera del modal)
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        ref={modalRef}
        className={cn(styles.modal, styles[size])}
        role="document"
        tabIndex={-1}
      >
        {/* Header con título opcional y botón de cierre */}
        <div className={styles.header}>
          {title ? (
            <h2 id="modal-title" className={styles.title}>{title}</h2>
          ) : (
            <div /> /* Espaciador si no hay título */
          )}
          
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido principal */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )

  // Inyectar en el body usando React Portals
  return createPortal(modalContent, document.body)
}
