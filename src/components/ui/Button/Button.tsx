'use client'

// src/components/ui/Button/Button.tsx
// Componente Button — 5 variantes × 5 tamaños
// Principios: SOLID (una responsabilidad), DRY (tokens), KISS (sin lógica innecesaria)

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import styles from './Button.module.css'

// ================================================================
// Tipos
// ================================================================
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'full' | 'icon'

interface BaseButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
  className?: string
}

// Cuando es un botón HTML
type ButtonAsButton = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button'
    href?: never
  }

// Cuando actúa como un link (renderiza <a> o <Link> de Next.js)
type ButtonAsLink = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: 'link'
    href: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

// ================================================================
// Componente
// ================================================================
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref
  ) {
    const classNames = cn(
      styles.button,
      styles[variant],
      styles[size],
      isLoading && styles.loading,
      className
    )

    const content = (
      <>
        {isLoading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span className="sr-only">Cargando...</span>
          </>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </>
    )

    // Renderizar como Link de Next.js
    if (props.as === 'link' && 'href' in props && props.href) {
      const { as: _as, href, ...linkProps } = props as ButtonAsLink
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classNames}
          {...linkProps}
        >
          {content}
        </Link>
      )
    }

    // Renderizar como botón HTML
    const { as: _as, ...buttonProps } = props as ButtonAsButton
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classNames}
        disabled={isLoading || buttonProps.disabled}
        {...buttonProps}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'
