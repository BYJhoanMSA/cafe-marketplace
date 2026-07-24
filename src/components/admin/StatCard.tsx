'use client'

// src/components/admin/StatCard.tsx
import { type ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div style={{
      backgroundColor: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: 'var(--text-sm)', 
          fontWeight: 'var(--font-weight-medium)', 
          color: 'var(--color-ink-secondary)' 
        }}>
          {title}
        </h3>
        <div style={{ color: 'var(--color-ink-tertiary)' }}>
          {icon}
        </div>
      </div>
      
      <div>
        <div style={{ 
          fontSize: 'var(--text-3xl)', 
          fontWeight: 'var(--font-weight-bold)', 
          color: 'var(--color-ink-primary)',
          fontFamily: 'var(--font-primary)'
        }}>
          {value}
        </div>
        
        {trend && (
          <div style={{ 
            marginTop: 'var(--space-2)',
            fontSize: 'var(--text-xs)', 
            color: trend.isPositive ? 'var(--forest-600)' : 'var(--terra-600)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)'
          }}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
    </div>
  )
}
