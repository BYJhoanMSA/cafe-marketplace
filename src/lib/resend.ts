// src/lib/resend.ts
// Cliente de Resend para emails transaccionales

import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable')
}

export const resend = new Resend(process.env.RESEND_API_KEY, {
  timeout: 15000,
})

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Cafe Seleccion <hola@cafemarket.place>'
