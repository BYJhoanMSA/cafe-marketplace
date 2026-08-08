'use server'

import bcrypt from 'bcryptjs'
import { signIn, auth } from '@/lib/auth'
import { prisma } from '@/server/db/client'
import { RegisterSchema, LoginSchema, type RegisterInput, type LoginInput } from '../validators/user.schema'
import { AuthError as AuthJsError } from 'next-auth'
import { rateLimit } from '@/server/cache/rate-limit'
import { headers } from 'next/headers'
import { normalizeWhatsAppNumber } from '@/lib/utils'
import { getUserVendor, ensureUserVendor } from '@/server/services/vendor.service'

async function getClientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

// En Auth.js beta.32, signIn con redirect:false NO lanza excepción cuando el
// sign-in falla: devuelve la URL de redirección y, si falló, esa URL incluye
// el parámetro ?error=... (ej: error=CredentialsSignin). Lo detectamos aquí
// porque auth() en la misma acción aún no ve la cookie de sesión recién creada.
function hasAuthError(url: unknown): boolean {
  if (typeof url !== 'string') return false
  try {
    const parsed = new URL(url, process.env.AUTH_URL ?? 'http://localhost')
    return parsed.searchParams.has('error')
  } catch {
    return false
  }
}

export async function loginUser(data: LoginInput) {
  const ip = await getClientIp()
  // Rate limit por IP y por IP+email para frenar fuerza bruta distribuida
  if (!rateLimit(`login:${ip}`, 5, 300)) {
    return { success: false, error: 'Demasiados intentos. Intenta de nuevo en 5 minutos.' }
  }

  try {
    const parsed = LoginSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Datos inválidos' }
    }

    const emailKey = parsed.data.email.toLowerCase()
    if (!rateLimit(`login:${ip}:${emailKey}`, 5, 300)) {
      return { success: false, error: 'Demasiados intentos para esta cuenta. Intenta de nuevo en 5 minutos.' }
    }

    const result = await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false, // Manejamos la redirección en el cliente
    })

    if (hasAuthError(result)) {
      return { success: false, error: 'Email o contraseña incorrectos' }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof AuthJsError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Email o contraseña incorrectos' }
        case 'CallbackRouteError':
          return { success: false, error: 'Email o contraseña incorrectos' }
        default:
          return { success: false, error: 'Ocurrió un error al iniciar sesión' }
      }
    }
    // IMPORTANTE: throw error si no es AuthError (puede ser NEXT_REDIRECT)
    throw error
  }
}

export async function registerUser(data: RegisterInput) {
  const ip = await getClientIp()
  // Rate limit por IP para frenar la creación masiva de cuentas
  if (!rateLimit(`register:${ip}`, 5, 900)) {
    return { success: false, error: 'Demasiados intentos de registro. Intenta de nuevo en 15 minutos.' }
  }

  try {
    // 1. Validar
    const parsed = RegisterSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Los datos ingresados no son válidos' }
    }

    const email = parsed.data.email.toLowerCase().trim()
    const whatsapp = normalizeWhatsAppNumber(parsed.data.phone)
    if (!whatsapp) {
      return { success: false, error: 'Ingresa un número de WhatsApp válido (con código de país)' }
    }

    // 2. Verificar que ni el correo ni el número de WhatsApp estén registrados
    const [existingByEmail, existingByPhone] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { id: true } }),
      prisma.user.findFirst({ where: { phone: whatsapp }, select: { id: true } }),
    ])

    if (existingByEmail) {
      return { success: false, error: 'El email ya está registrado' }
    }
    if (existingByPhone) {
      return { success: false, error: 'Ese número de WhatsApp ya tiene una cuenta' }
    }

    // 3. Crear la cuenta directamente (role customer, active)
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(parsed.data.password, salt)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        phone: whatsapp,
        role: 'customer',
        status: 'active',
      },
    })

    // 4. Iniciar sesión automáticamente
    const result = await signIn('credentials', {
      email,
      password: parsed.data.password,
      redirect: false,
    })

    return { success: true, userId: user.id, autoLogin: !hasAuthError(result) }
  } catch (error) {
    if (error instanceof AuthJsError) {
      // Registro exitoso, pero el login automático no se pudo completar
      return { success: true }
    }
    console.error('[REGISTER_ERROR]', error)
    return { success: false, error: 'Ocurrió un error inesperado al registrar el usuario' }
  }
}

// =============================================================================
// OAuth y Magic Link
// =============================================================================

export async function googleSignIn() {
  await signIn('google', { redirectTo: '/' })
}

export async function magicLinkSignIn(email: string) {
  if (!email) return { success: false, error: 'Email requerido' }

  const ip = await getClientIp()
  const normalized = email.toLowerCase()

  if (!rateLimit(`magic:${normalized}`, 3, 900)) {
    return { success: false, error: 'Demasiados enlaces enviados a este correo. Espera 15 minutos.' }
  }
  if (!rateLimit(`magic:ip:${ip}`, 10, 3600)) {
    return { success: false, error: 'Demasiados enlaces desde tu IP. Espera 1 hora.' }
  }

  try {
    await signIn('resend', {
      email: normalized,
      redirect: false,
      callbackUrl: '/'
    })
    return { success: true }
  } catch (error) {
    throw error
  }
}

// =============================================================================
// Solicitud de marca (vendor) — requiere aprobación del administrador
// =============================================================================

export async function requestVendorAccount() {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Debes iniciar sesión' }
  }

  try {
    const existing = await getUserVendor(session.user.id)

    if (existing) {
      if (existing.status === 'active') {
        return { success: false, error: 'Ya tienes una marca activa' }
      }
      if (existing.status === 'pending') {
        return { success: false, error: 'Tu solicitud está pendiente de aprobación. El administrador te avisará.' }
      }
      return { success: false, error: 'Tu marca está suspendida. Contacta al administrador.' }
    }

    const vendor = await ensureUserVendor(session.user.id, session.user.name ?? undefined)
    return { success: true, vendor }
  } catch (error) {
    console.error('[REQUEST_VENDOR]', error)
    return { success: false, error: 'Error al solicitar la marca. Intenta más tarde.' }
  }
}
