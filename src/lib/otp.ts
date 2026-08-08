// src/lib/otp.ts
// Código de acceso por correo electrónico (OTP de 6 dígitos).
// - El código se guarda SOLO como hash SHA-256 en VerificationToken (nunca en claro).
// - Un solo uso, expira en 10 minutos.
// - Comparación con timingSafeEqual para evitar timing attacks.

import { createHash, randomInt, timingSafeEqual } from 'crypto'
import { prisma } from '@/server/db/client'
import { resend, EMAIL_FROM } from '@/lib/resend'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutos

export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000)).padStart(6, '0')
}

export function hashOtpCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

export function verifyOtpCode(code: string, storedHash: string): boolean {
  const a = Buffer.from(hashOtpCode(code), 'hex')
  const b = Buffer.from(storedHash, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Guarda un código OTP para un correo (borra códigos previos del mismo correo).
 */
export async function storeOtpCode(email: string, code: string): Promise<void> {
  const identifier = email.toLowerCase()
  await prisma.verificationToken.deleteMany({ where: { identifier } })
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashOtpCode(code),
      expires: new Date(Date.now() + OTP_TTL_MS),
    },
  })
}

/**
 * Valida y consume el código OTP (un solo uso). Devuelve true si es válido.
 */
export async function consumeOtpCode(email: string, code: string): Promise<boolean> {
  const identifier = email.toLowerCase()
  const record = await prisma.verificationToken.findFirst({
    where: { identifier },
    orderBy: { expires: 'desc' },
  })

  if (!record) return false
  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier } })
    return false
  }
  if (!verifyOtpCode(code, record.token)) return false

  await prisma.verificationToken.deleteMany({ where: { identifier } })
  return true
}

/**
 * Envía el correo con el código de acceso.
 */
export async function sendOtpEmail(email: string, code: string): Promise<void> {
  if (!resend) {
    throw new Error('Email no configurado (falta RESEND_API_KEY)')
  }

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Tu código de acceso — Cafe Seleccion',
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937;">
        <h2 style="margin:0 0 8px;color:#111827;">Tu código de acceso</h2>
        <p style="margin:0 0 16px;color:#4b5563;">Usa el siguiente código para iniciar sesión o crear tu cuenta en Cafe Seleccion.</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#7c5a2e;background:#f5efe6;border-radius:8px;padding:16px;text-align:center;">
          ${code}
        </div>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
          Este código expira en 10 minutos y solo puede usarse una vez.
          Si no solicitaste este correo, ignóralo.
        </p>
      </div>
    `,
  })
}
