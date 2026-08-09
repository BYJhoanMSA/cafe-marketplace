// Iconos de sabor renderizados inline para heredar currentColor
// (así el CSS puede dorarlos en hover/selección, como en "Por qué elegirnos").

const PATHS: Record<string, React.ReactNode> = {
  coffee: (
    <>
      <path d="M42 86 H86" />
      <path d="M44 46 H78 V69 C78 80 70 88 61 88 C52 88 44 80 44 69 Z" />
      <path d="M78 53 C90 53 92 65 84 69 C82 70 80 70 78 70" />
      <path d="M54 34 C50 40 58 44 54 50" />
      <path d="M64 30 C60 37 68 42 64 50" />
      <path d="M74 34 C70 40 78 44 74 50" />
    </>
  ),
  cherry: (
    <>
      <path d="M64 38 C58 28 46 24 36 30" />
      <path d="M64 38 C70 28 82 24 92 30" />
      <path d="M64 38 C64 46 64 50 64 54" />
      <circle cx="46" cy="76" r="16" />
      <circle cx="82" cy="76" r="16" />
      <path d="M64 36 C72 22 88 22 92 34 C82 36 72 42 64 36 Z" />
    </>
  ),
  chocolate: (
    <>
      <rect x="34" y="30" width="60" height="68" rx="8" />
      <path d="M54 30V98" />
      <path d="M74 30V98" />
      <path d="M34 52H94" />
      <path d="M34 74H94" />
      <path d="M40 40H48" />
      <path d="M60 40H68" />
      <path d="M80 40H88" />
      <path d="M40 62H48" />
      <path d="M60 62H68" />
      <path d="M80 62H88" />
      <path d="M40 84H48" />
      <path d="M60 84H68" />
      <path d="M80 84H88" />
    </>
  ),
  flower: (
    <>
      <circle cx="64" cy="64" r="8" />
      <ellipse cx="64" cy="42" rx="10" ry="14" />
      <ellipse cx="84" cy="56" rx="10" ry="14" transform="rotate(35 84 56)" />
      <ellipse cx="76" cy="82" rx="10" ry="14" transform="rotate(-35 76 82)" />
      <ellipse cx="52" cy="82" rx="10" ry="14" transform="rotate(35 52 82)" />
      <ellipse cx="44" cy="56" rx="10" ry="14" transform="rotate(-35 44 56)" />
    </>
  ),
  lemon: (
    <>
      <circle cx="64" cy="64" r="34" />
      <circle cx="64" cy="64" r="4" />
      <path d="M64 30V60" />
      <path d="M64 68V98" />
      <path d="M30 64H60" />
      <path d="M68 64H98" />
      <path d="M40 40L58 58" />
      <path d="M70 70L88 88" />
      <path d="M88 40L70 58" />
      <path d="M58 70L40 88" />
    </>
  ),
  hazelnut: (
    <>
      <path d="M64 26 C76 18 92 22 94 36 C80 38 70 42 64 50 C60 42 56 34 64 26Z" />
      <path d="M64 48V56" />
      <path d="M64 56 C48 56 38 68 38 84 C38 100 50 108 64 108 C78 108 90 100 90 84 C90 68 80 56 64 56Z" />
      <path d="M48 62 C56 70 72 70 80 62" />
      <path d="M64 70V96" />
    </>
  ),
  candy: (
    <>
      <path d="M34 64 L22 54 L22 74 Z" />
      <path d="M94 64 L106 54 L106 74 Z" />
      <rect x="34" y="46" width="60" height="36" rx="12" />
      <path d="M48 54H80" />
      <path d="M48 74H80" />
    </>
  ),
  light: (
    <>
      <circle cx="64" cy="64" r="20" />
      <path d="M64 20V34" />
      <path d="M64 94V108" />
      <path d="M20 64H34" />
      <path d="M94 64H108" />
      <path d="M34 34L44 44" />
      <path d="M84 84L94 94" />
      <path d="M94 34L84 44" />
      <path d="M44 84L34 94" />
    </>
  ),
  dark: (
    <>
      <path d="M76 28 C54 30 40 48 40 66 C40 88 56 102 78 102 C64 92 58 76 58 62 C58 46 66 34 76 28Z" />
      <path d="M88 38V46" />
      <path d="M84 42H92" />
      <path d="M94 58V64" />
      <path d="M91 61H97" />
    </>
  ),
  organic: (
    <>
      <path d="M64 22 C90 22 104 44 98 70 C92 96 72 108 64 108 C56 108 36 96 30 70 C24 44 38 22 64 22Z" />
      <path d="M64 34V94" />
      <path d="M64 52L48 64" />
      <path d="M64 70L80 82" />
      <ellipse cx="64" cy="64" rx="10" ry="16" />
      <path d="M64 49 C60 56 68 60 64 79" />
    </>
  ),
}

interface FlavorIconProps {
  icon: string
  size?: number
  className?: string
}

export function FlavorIcon({ icon, size = 50, className }: FlavorIconProps) {
  const key = (icon.match(/sabor-([a-z]+)\.svg$/) ?? [])[1] ?? ''
  const paths = PATHS[key]

  if (!paths) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={icon} alt="" width={size} height={size} className={className} />
    )
  }

  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        {paths}
      </g>
    </svg>
  )
}
