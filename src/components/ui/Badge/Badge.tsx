// src/components/ui/Badge/Badge.tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import styles from './Badge.module.css'

export type BadgeVariant =
  | 'default'
  | 'gold'
  | 'terra'
  | 'forest'
  | 'success'
  | 'warning'
  | 'error'
  | 'dark'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  icon?: ReactNode
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  icon,
  className,
}: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}
