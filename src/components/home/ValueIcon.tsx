'use client'

import { DirectoTostadorIcon, EspecialidadIcon, FrescuraIcon, SostenibleIcon } from '@/components/ui/Icons/NavIcons'

const ICON_MAP: Record<string, React.ReactNode> = {
  'directo-tostador': <DirectoTostadorIcon size={96} strokeWidth={0.95} />,
  'especialidad': <EspecialidadIcon size={96} strokeWidth={0.9} />,
  'frescura': <FrescuraIcon size={96} strokeWidth={0.8} />,
  'sostenible': <SostenibleIcon size={96} strokeWidth={0.95} />,
}

export function ValueIcon({ icon }: { icon: string }) {
  if (icon in ICON_MAP) {
    return <>{ICON_MAP[icon]}</>
  }
  return <span aria-hidden="true">{icon}</span>
}
