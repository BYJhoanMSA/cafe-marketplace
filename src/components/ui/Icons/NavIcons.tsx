'use client'

interface IconProps {
  size?: number
  strokeWidth?: number
  stroke?: string
}

// -------------------------------------------
// Home (icon-svg/home.svg)
// -------------------------------------------
export function HomeIcon({ size = 24, strokeWidth = 2, stroke = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 10.5L12 4L19.5 10.5"/>
      <path d="M6.5 10.5V19H17.5V10.5"/>
      <path d="M10.5 19V14.5 C10.5 13.7 11.2 13 12 13 C12.8 13 13.5 13.7 13.5 14.5 V19"/>
      <rect x="7.8" y="12" width="2.2" height="2.2" rx=".3"/>
      <rect x="14" y="12" width="2.2" height="2.2" rx=".3"/>
      <path d="M15.8 5.8V3.8"/>
    </svg>
  )
}

// -------------------------------------------
// Search (icon-svg/search.svg)
// -------------------------------------------
export function SearchIcon({ size = 24, strokeWidth = 2, stroke = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="5.5"/>
      <path d="M14.4 14.4L19.2 19.2"/>
      <ellipse cx="10.5" cy="10.5" rx="1.7" ry="2.5"/>
      <path d="M10.5 8.3 C9.9 9.2 11.2 10 10.5 12.7"/>
    </svg>
  )
}

function CoffeeBeans(props: { stroke: string; strokeWidth: number }) {
  const { stroke, strokeWidth: sw } = props
  return (
    <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(7.2 12.2) rotate(-18)">
        <ellipse cx="0" cy="0" rx="2.6" ry="3.8"/>
        <path d="M0 -2.8 C-.9 -1.3 1 -.2 0 2.8"/>
      </g>
      <g transform="translate(12.2 8.8)">
        <ellipse cx="0" cy="0" rx="3.2" ry="4.7"/>
        <path d="M0 -3.4 C-1.1 -1.5 1.2 -.3 0 3.4"/>
      </g>
      <g transform="translate(17.1 13.1) rotate(18)">
        <ellipse cx="0" cy="0" rx="2.4" ry="3.5"/>
        <path d="M0 -2.5 C-.8 -1.1 .9 -.2 0 2.5"/>
      </g>
    </g>
  )
}

// -------------------------------------------
// Catálogo (icon-svg/catalogo.svg) — Center nav
// -------------------------------------------
export function CatalogIcon({ size = 36, strokeWidth = 2, stroke = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <CoffeeBeans stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

// -------------------------------------------
// Logo Café (mismo diseño, defaults distintos) — Header emoji replacement
// -------------------------------------------
export function LogoCafeIcon({ size = 40, strokeWidth = 1, stroke = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <CoffeeBeans stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

// -------------------------------------------
// Heart / Favorito (icon-svg/favorite.svg)
// -------------------------------------------
export function HeartIcon({ size = 24, strokeWidth = 2, stroke = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20 C11 19 4.5 14.3 4.5 9.2 C4.5 6.6 6.4 4.8 8.9 4.8 C10.5 4.8 11.5 5.6 12 6.6 C12.5 5.6 13.5 4.8 15.1 4.8 C17.6 4.8 19.5 6.6 19.5 9.2 C19.5 14.3 13 19 12 20Z"/>
      <path d="M12 7.4 C11.3 9 12.9 10.4 12 15.6"/>
    </svg>
  )
}

// -------------------------------------------
// Carrito (icon-svg/carrito.svg)
// -------------------------------------------
export function CartIcon({ size = 24, strokeWidth = 2, stroke = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 .98-.76L19 7H8"/>
      <ellipse cx="12.2" cy="10.8" rx="2.1" ry="3"/>
      <path d="M12.2 8.2 C11.4 9.2 13.1 10.3 12.1 13.4"/>
      <circle cx="9.2" cy="19" r="1.2"/>
      <circle cx="17.2" cy="19" r="1.2"/>
    </svg>
  )
}

// -------------------------------------------
// User / Cuenta (icon-svg/user.svg)
// -------------------------------------------
export function UserIcon({ size = 20, strokeWidth = 2, stroke = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.5 C9.8 4.5 8.3 6.2 8.3 8.4 C8.3 10.8 9.9 12.5 12 12.5 C14.1 12.5 15.7 10.8 15.7 8.4 C15.7 6.2 14.2 4.5 12 4.5Z"/>
      <path d="M12 5.8 C11.3 7 12.6 8 12 11"/>
      <path d="M5.8 19 C6.2 16 8.7 14.3 12 14.3 C15.3 14.3 17.8 16 18.2 19"/>
    </svg>
  )
}
