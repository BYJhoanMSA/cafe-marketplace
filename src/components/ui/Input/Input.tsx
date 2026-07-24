'use client'

// src/components/ui/Input/Input.tsx
// Input con label flotante, validación, íconos y estados semánticos

import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import styles from './Input.module.css'

export type InputStatus = 'default' | 'error' | 'success'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string                // Siempre requerido para accesibilidad
  status?: InputStatus
  errorMessage?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  wrapperClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      status = 'default',
      errorMessage,
      hint,
      leftIcon,
      rightIcon,
      className,
      wrapperClassName,
      id,
      ...props
    },
    ref
  ) {
    // Generar ID único si no se provee uno
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`

    const hasValue = Boolean(props.value ?? props.defaultValue)

    return (
      <div className={cn(styles.wrapper, wrapperClassName)}>
        <div className={styles.field}>
          <input
            ref={ref}
            id={inputId}
            placeholder=" " // Necesario para el selector :not(:placeholder-shown)
            aria-invalid={status === 'error'}
            aria-describedby={
              errorMessage ? errorId : hint ? hintId : undefined
            }
            className={cn(
              styles.input,
              status !== 'default' && styles[status],
              leftIcon && styles.hasIconLeft,
              rightIcon && styles.hasIconRight,
              className
            )}
            {...props}
          />

          {/* Label flotante — actúa como placeholder en estado idle */}
          <label
            htmlFor={inputId}
            className={cn(
              styles.label,
              leftIcon && styles.hasIconLeft,
              hasValue && styles.floated
            )}
          >
            {label}
            {props.required && (
              <span aria-hidden="true" style={{ color: 'var(--error-text)', marginLeft: '2px' }}>
                *
              </span>
            )}
          </label>

          {leftIcon && (
            <span className={styles.iconLeft} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {rightIcon && (
            <span className={styles.iconRight} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Mensaje de error */}
        {status === 'error' && errorMessage && (
          <p id={errorId} className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}

        {/* Hint (ayuda contextual) */}
        {hint && status !== 'error' && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
