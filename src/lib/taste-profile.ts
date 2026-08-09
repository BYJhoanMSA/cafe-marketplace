// src/lib/taste-profile.ts
// Lógica pura del perfil de sabor (compartida entre cliente y servidor).
// Describe el perfil en lenguaje natural a partir de las preferencias.

const ROAST_LABELS: Record<string, string> = {
  light: 'ligero',
  'medium-light': 'medio-ligero',
  medium: 'medio',
  'medium-dark': 'medio-oscuro',
  dark: 'oscuro',
}

const ACIDITY_LABELS: Record<string, string> = {
  low: 'baja acidez',
  medium: 'acidez equilibrada',
  high: 'alta acidez',
}

const BODY_LABELS: Record<string, string> = {
  light: 'cuerpo ligero',
  medium: 'cuerpo sedoso',
  full: 'cuerpo completo',
}

export function describeTasteProfile(profile: {
  roastPreference: string
  acidityPreference: string
  bodyPreference: string
  flavorNotes: string[]
  brewMethods?: string[]
}): string {
  const roast = ROAST_LABELS[profile.roastPreference] ?? 'tueste balanceado'
  const acidity = ACIDITY_LABELS[profile.acidityPreference]
  const body = BODY_LABELS[profile.bodyPreference]
  const notes = profile.flavorNotes.slice(0, 3)

  const notesText =
    notes.length > 0
      ? ` Te enamoran las notas ${notes.join(', ')}.`
      : ''

  return `Un café ${roast} que te haga sonreír en cada sorbo. Buscamos lotes${acidity ? ` con ${acidity}` : ''}${body ? ` y ${body}` : ''} que conecten con tu paladar.${notesText}`
}
