'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface PillBarContextType {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const PillBarContext = createContext<PillBarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
})

export function PillBarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen((v) => !v)
  const close = () => setIsOpen(false)

  return (
    <PillBarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </PillBarContext.Provider>
  )
}

export function usePillBar() {
  return useContext(PillBarContext)
}
