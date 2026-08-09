'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number | null
  duration?: number
}

export function AnimatedNumber({ value, duration = 1100 }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry || !entry.isIntersecting || started.current) return
        started.current = true
        io.disconnect()

        if (value == null) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setDisplay(value)
          return
        }

        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.round(value * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])

  if (value == null) return <span ref={ref}>--</span>

  return <span ref={ref}>{display}</span>
}
