// src/lib/resend.ts
// Cliente de Resend para emails transaccionales.
// Se inicializa de forma perezosa: no lanza error al importar si falta la
// API key, solo devuelve null. El error se maneja en el punto de uso.

import { Resend } from 'resend'

let _resend: Resend | null | undefined

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export const resend: Resend | null = getResend() ?? null

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Cafe Seleccion <hola@cafemarket.place>'
