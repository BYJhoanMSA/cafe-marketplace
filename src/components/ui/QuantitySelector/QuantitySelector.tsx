'use client'

// src/components/ui/QuantitySelector/QuantitySelector.tsx
import { useEffect, useState } from 'react'
import { Minus, Plus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import styles from './QuantitySelector.module.css'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantitySelector({ 
  value, 
  onChange, 
  min = 1, 
  max = 99,
  className 
}: QuantitySelectorProps) {
  // Estado local para permitir al usuario borrar el input y escribir libremente
  const [localValue, setLocalValue] = useState<string>(value.toString())

  useEffect(() => {
    setLocalValue(value.toString())
  }, [value])

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }

  const handleBlur = () => {
    let newValue = parseInt(localValue, 10)
    
    if (isNaN(newValue) || newValue < min) {
      newValue = min
    } else if (newValue > max) {
      newValue = max
    }
    
    setLocalValue(newValue.toString())
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlur()
    }
  }

  return (
    <div className={cn(styles.container, className)}>
      <button
        type="button"
        className={styles.button}
        onClick={handleDecrease}
        disabled={value <= min}
        aria-label="Disminuir cantidad"
      >
        <Minus size={16} />
      </button>
      
      <input
        type="number"
        className={styles.input}
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        aria-label="Cantidad"
      />
      
      <button
        type="button"
        className={styles.button}
        onClick={handleIncrease}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
