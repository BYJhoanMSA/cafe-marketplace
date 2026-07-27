'use client'

import { DirectoTostadorIcon, EspecialidadIcon, FrescuraIcon, SostenibleIcon } from '@/components/ui/Icons/NavIcons'

const ICON_MAP: Record<string, React.ReactNode> = {
  'directo-tostador': <DirectoTostadorIcon size={48} />,
  'especialidad': <EspecialidadIcon size={48} />,
  'frescura': <FrescuraIcon size={48} />,
  'sostenible': <SostenibleIcon size={48} />,
}

export function ValueIcon({ icon }: { icon: string }) {
  if (icon in ICON_MAP) {
    return <>{ICON_MAP[icon]}</>
  }
  return <span aria-hidden="true">{icon}</span>
}
