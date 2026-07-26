import type { PillItem } from './PillSelector.types'

export const FLAVOR_ITEMS: PillItem[] = [
  { id: 'coffee',    icon: '/icons/sabor-coffee.svg',    label: 'Todo',        value: 'coffee',    href: '/catalogo' },
  { id: 'frutal',    icon: '/icons/sabor-cherry.svg',     label: 'Frutal',      value: 'frutal',    href: '/catalogo?nota=frutal' },
  { id: 'chocolate', icon: '/icons/sabor-chocolate.svg',  label: 'Chocolate', value: 'chocolate', href: '/catalogo?nota=chocolatoso' },
  { id: 'floral',    icon: '/icons/sabor-flower.svg',     label: 'Floral',      value: 'floral',    href: '/catalogo?nota=floral' },
  { id: 'citrico',   icon: '/icons/sabor-lemon.svg',      label: 'Cítrico',     value: 'citrico',   href: '/catalogo?nota=citrico' },
  { id: 'avellanado', icon: '/icons/sabor-hazelnut.svg',  label: 'Avellanado',  value: 'avellanado', href: '/catalogo?nota=avellanado' },
  { id: 'caramelo',  icon: '/icons/sabor-candy.svg',      label: 'Caramelo',    value: 'caramelo',  href: '/catalogo?nota=caramelo' },
  { id: 'ligero',    icon: '/icons/sabor-light.svg',      label: 'Ligero',      value: 'ligero',    href: '/catalogo?tueste=light' },
  { id: 'oscuro',    icon: '/icons/sabor-dark.svg',       label: 'Oscuro',      value: 'oscuro',    href: '/catalogo?tueste=dark' },
]
