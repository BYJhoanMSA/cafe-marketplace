'use client'

// src/components/ui/Drawer/Drawer.tsx
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import styles from './Drawer.module.css'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  position?: 'right' | 'left' | 'bottom'
  children: ReactNode
}

export function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  position = 'right', 
  children 
}: DrawerProps) {
  
  const drawerRef = useRef<HTMLDivElement>(null)

  // Manejo de teclado, bloqueo de scroll y focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      
      // Focus Trap
      if (e.key === 'Tab') {
        if (!drawerRef.current) return
        
        const focusableElements = drawerRef.current.querySelectorAll(
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

    if (drawerRef.current) {
      drawerRef.current.focus()
    }

    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalStyle
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const drawerContent = (
    <>
      <div 
        className={styles.overlay} 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div 
        ref={drawerRef}
        className={cn(styles.drawer, styles[position])}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div className={styles.dragPill} />
          {title ? (
            <h2 id="drawer-title" className={styles.title}>{title}</h2>
          ) : (
            <div />
          )}
          
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  )

  return createPortal(drawerContent, document.body)
}
