'use client'

// src/components/ui/Accordion/Accordion.tsx
import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './Accordion.module.css'

interface AccordionItem {
  id: string
  title: string
  content: ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  className?: string
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        if (!allowMultiple) newSet.clear()
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div className={cn(styles.accordion, className)} role="presentation">
      {items.map((item) => {
        const isOpen = openIds.has(item.id)
        
        return (
          <div key={item.id} className={styles.item}>
            <h3>
              <button
                type="button"
                className={styles.trigger}
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${item.id}`}
                id={`accordion-header-${item.id}`}
              >
                {item.title}
                <ChevronDown className={styles.icon} size={20} aria-hidden="true" />
              </button>
            </h3>
            
            <div 
              id={`accordion-content-${item.id}`}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
              className={cn(styles.contentWrapper, isOpen && styles.open)}
            >
              <div className={styles.content}>
                <div className={styles.contentInner}>
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
