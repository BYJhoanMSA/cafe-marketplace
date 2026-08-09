// src/lib/flavor-notes.ts
// Conjunto canónico de notas de sabor para los filtros del catálogo.
// El admin guarda notas específicas ("Frambuesa", "Chocolate", ...) y el resto
// de la app filtra por notas genéricas ("frutal", "chocolatoso", ...).
// Este módulo mapea unas a otras para que el filtro funcione con la DB.

export const GENERIC_FLAVOR_NOTES = [
  'frutal',
  'chocolatoso',
  'floral',
  'citrico',
  'avellanado',
  'caramelo',
] as const

export type GenericFlavorNote = (typeof GENERIC_FLAVOR_NOTES)[number]

// Notas específicas que pueden existir en la DB (product_flavor_notes)
// y el grupo genérico al que pertenecen. La primera entrada es el alias
// genérico en sí.
const FLAVOR_GROUPS: Record<GenericFlavorNote, string[]> = {
  frutal: ['frutal', 'frambuesa', 'durazno', 'manzana', 'mora', 'cereza', 'frutas'],
  chocolatoso: ['chocolatoso', 'chocolate', 'cacao'],
  floral: ['floral', 'jazmín', 'jazmin', 'flores', 'rosa', 'lavanda'],
  citrico: ['citrico', 'cítrico', 'limón', 'limon', 'bergamota', 'naranja', 'mandarina'],
  avellanado: ['avellanado', 'avellana', 'nuez', 'almendra', 'toasted nut'],
  caramelo: ['caramelo', 'panela', 'miel', 'azúcar', 'azucar', 'toffee'],
}

// Quita tildes y pasa a minúsculas para comparar sin importar la forma.
export function normalizeNote(note: string): string {
  return note
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Devuelve todos los alias (genérico + específicos) de un grupo.
export function getFlavorAliases(group: string): string[] {
  return FLAVOR_GROUPS[group as GenericFlavorNote] ?? [group]
}

// ¿La nota (tal como está en la DB) pertenece al grupo genérico?
export function flavorNoteMatchesGroup(group: string, note: string): boolean {
  const n = normalizeNote(note)
  return getFlavorAliases(group).some((alias) => normalizeNote(alias) === n)
}

// Lista de valores normalizados (sin acento, en minúscula) para comparar
// contra la DB sin depender de la collation.
export function getFlavorAliasesNormalized(group: string): string[] {
  return getFlavorAliases(group).map(normalizeNote)
}
