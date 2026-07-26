'use client'

import type { ReactNode } from 'react'
import { PillBarProvider } from '@/components/ui/PillSelector/PillBarContext'

export function PublicLayoutClient({ children }: { children: ReactNode }) {
  return <PillBarProvider>{children}</PillBarProvider>
}
