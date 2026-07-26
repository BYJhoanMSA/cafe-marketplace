export interface PillItem {
  id: string
  icon: string
  label: string
  value: string
  href?: string
  disabled?: boolean
}

export interface PillSelectorProps {
  items: PillItem[]
  activeId: string
  onSelect?: (item: PillItem) => void
  className?: string
}
