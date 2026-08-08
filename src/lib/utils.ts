// src/lib/utils.ts
// Funciones utilitarias compartidas en todo el proyecto

import { type ClassValue, clsx } from 'clsx'

/**
 * Combina clases CSS condicionalmente.
 * Uso: cn('base', condition && 'conditional', { 'obj-class': true })
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/**
 * Convierte centavos a formato de moneda legible.
 * Ej: 2200 → "$22.00" (USD) | 22000 → "$22.000" (COP)
 */
export function formatPrice(amountInCents: number, _currency?: string): string {
  const amount = Math.round(amountInCents / 100)
  return '$' + amount.toLocaleString('es-CO')
}

/**
 * Genera un slug limpio a partir de un texto.
 * Ej: "Colombia Huila Natural" → "colombia-huila-natural"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Trunca texto con elipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Formatea una fecha relativa en español.
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return 'hace un momento'
  if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  if (diffDays < 30) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  if (diffMonths < 12) return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
}

/**
 * Genera la URL de imagen optimizada.
 * Para URLs de Cloudinary inyecta las transformaciones en la RUTA
 * (ej: /image/upload/f_auto,q_auto,w_500/...), que es el único formato
 * que Cloudinary aplica. Para URLs locales devuelve la URL tal cual.
 */
export function getImageUrl(
  originalUrl: string,
  options: {
    width?: number
    height?: number
    fit?: 'cover' | 'contain' | 'fill' | 'scale-down'
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
    quality?: number
  } = {}
): string {
  if (!originalUrl) return ''
  const { width, height } = options

  const cloudinaryMatch = originalUrl.match(/^(.*?\/image\/upload\/)(.+)$/)
  if (!cloudinaryMatch) return originalUrl

  const prefix = cloudinaryMatch[1]!
  const rest = cloudinaryMatch[2]!
  const segments = rest.split('/')
  const first = segments[0] ?? ''

  const isVersion = /^v\d+$/.test(first)
  const isTransform =
    !isVersion &&
    /^[a-zA-Z0-9_,:.]+$/.test(first) &&
    /^(f_|q_|w_|h_|c_|e_|r_|d_|o_|g_|a_|x_|y_|z_|fl_|cs_|ch_|dpr_|n_)/.test(first)

  const transforms: string[] = []
  if (isTransform) {
    transforms.push(...first.split(',').filter((t) => !/^[wh]_\d+$/.test(t)))
  } else {
    transforms.push('f_auto', 'q_auto')
  }
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)

  const restSegments = (isTransform ? segments.slice(1) : segments).join('/')
  return `${prefix}${transforms.join(',')}/${restSegments}`
}

/** Placeholder base64 minúsculo (borroso) para next/image mientras carga la imagen real */
export const IMAGE_BLUR_PLACEHOLDER =
  'data:image/jpeg;base64,/9j/2wBDABcQERQRDhcUEhQaGBcbIjklIh8fIkYyNSk5UkhXVVFIUE5bZoNvW2F8Yk5QcptzfIeLkpSSWG2grJ+OqoOPko3/2wBDARgaGiIeIkMlJUONXlBejY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY3/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJwAF//Z'

/**
 * Categoría y color semántico de un cupping score SCA.
 */
export function getCuppingScoreCategory(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excepcional', color: 'var(--gold-500)' }
  if (score >= 87) return { label: 'Excelente', color: 'var(--forest-500)' }
  if (score >= 84) return { label: 'Muy bueno', color: 'var(--forest-300)' }
  if (score >= 80) return { label: 'Especialidad', color: 'var(--terra-500)' }
  return { label: 'Bueno', color: 'var(--neutral-500)' }
}

/** Respuesta estándar de API Route exitosa */
export function apiResponse<T>(data: T, status: number = 200): Response {
  return Response.json({ success: true, data }, { status })
}

/** Respuesta estándar de API Route con error */
export function apiError(message: string, status: number = 400, details?: unknown): Response {
  return Response.json(
    { success: false, error: message, ...(details ? { details } : {}) },
    { status }
  )
}

/**
 * Normaliza un número de WhatsApp a formato internacional sin signo "+".
 * Ejemplos:
 *   "+57 300 123 4567"  → "573001234567"
 *   "573001234567"       → "573001234567"
 *   "3001234567"         → "573001234567" (asume código de Colombia si tiene 10 dígitos)
 * Devuelve null si el número no es reconocible.
 */
export function normalizeWhatsAppNumber(input: string): string | null {
  if (!input) return null
  // Quitar todo lo que no sea dígito (incluye +, espacios, guiones, paréntesis)
  let digits = input.replace(/\D/g, '')
  if (!digits) return null
  // Número local colombiano (10 dígitos) → anteponer código de país 57
  if (digits.length === 10 && digits.startsWith('3')) {
    digits = '57' + digits
  }
  // Número con código de país (11-15 dígitos) → tomar tal cual
  if (digits.length >= 8 && digits.length <= 15) {
    return digits
  }
  return null
}

/**
 * Comprueba si un string parece un número de teléfono/WhatsApp
 * (para distinguirlo de un email o usuario en el login).
 */
export function looksLikePhone(input: string): boolean {
  const withoutPlus = input.replace(/^\+/, '')
  return /^[\d][\d\s\-().]*$/.test(withoutPlus) && input.replace(/\D/g, '').length >= 8
}
