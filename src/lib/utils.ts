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
 * Genera la URL de imagen de Cloudflare R2 con transformaciones on-the-fly.
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
  const { width, height, fit = 'cover', format = 'webp', quality = 85 } = options
  const params: string[] = []
  if (width) params.push(`w=${width}`)
  if (height) params.push(`h=${height}`)
  params.push(`fit=${fit}`)
  params.push(`format=${format}`)
  params.push(`quality=${quality}`)
  return `${originalUrl}?${params.join('&')}`
}

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

/** Genera URL de thumbnail a partir de la URL completa de la imagen */
export function getThumbUrl(imageUrl: string): string {
  if (!imageUrl || !imageUrl.includes('.')) return imageUrl
  const dotIndex = imageUrl.lastIndexOf('.')
  return imageUrl.slice(0, dotIndex) + '-thumb' + imageUrl.slice(dotIndex)
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
