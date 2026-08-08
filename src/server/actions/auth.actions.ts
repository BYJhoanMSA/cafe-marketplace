'use server'

import bcrypt from 'bcryptjs'
import { signIn, auth } from '@/lib/auth'
import { prisma } from '@/server/db/client'
import { RegisterSchema, LoginSchema, OtpRequestSchema, OtpVerifySchema, type RegisterInput, type LoginInput } from '../validators/user.schema'
import { AuthError as AuthJsError } from 'next-auth'
import { rateLimit } from '@/server/cache/rate-limit'
import { headers } from 'next/headers'
import { generateOtpCode, storeOtpCode, sendOtpEmail } from '@/lib/otp'
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
  if (!rateLimit(`register:${ip}`, 5, 900)) {
    return { success: false, error: 'Demasiados intentos de registro. Intenta de nuevo en 15 minutos.' }
  }

  try {
    // 1. Validar
    const parsed = RegisterSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Los datos ingresados no son válidos' }
    }

    const { email, password, firstName, lastName } = parsed.data

    // 2. Verificar existencia
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return { success: false, error: 'El email ya está registrado' }
    }

    // 3. Hash y creación. Todo usuario nuevo inicia como customer;
    //    la aprobación de vendor es un proceso explícito y separado.
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: 'customer',
        status: 'active',
      },
    })

    // 4. Iniciar sesión automáticamente después de registrarse
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    return { success: true, userId: user.id, autoLogin: !hasAuthError(result) }
  } catch (error) {
    if (error instanceof AuthJsError) {
      // Ignoramos el error de signIn si ocurre porque el registro en sí fue exitoso
      return { success: true }
    }
    console.error('[REGISTER_ERROR]', error)
    return { success: false, error: 'Ocurrió un error inesperado al registrar el usuario' }
  }
}

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
// Acceso por código de 6 dígitos (email OTP)
// =============================================================================

export async function requestLoginCode(email: string) {
  const parsed = OtpRequestSchema.safeParse({ email })
  if (!parsed.success) {
    return { success: false, error: 'Correo electrónico inválido' }
  }

  const normalized = parsed.data.email.toLowerCase()
  const ip = await getClientIp()

  if (!rateLimit(`otp:req:${normalized}`, 3, 900)) {
    return { success: false, error: 'Demasiados códigos enviados a este correo. Espera 15 minutos.' }
  }
  if (!rateLimit(`otp:req:ip:${ip}`, 10, 3600)) {
    return { success: false, error: 'Demasiados códigos desde tu IP. Espera 1 hora.' }
  }

  const code = generateOtpCode()

  try {
    await storeOtpCode(normalized, code)
    await sendOtpEmail(normalized, code)
  } catch (error) {
    console.error('[OTP] Error enviando código:', error)
    // Limpiar el token si el envío falló
    await prisma.verificationToken.deleteMany({ where: { identifier: normalized } }).catch(() => {})
    return { success: false, error: 'No fue posible enviar el código. Intenta más tarde.' }
  }

  return { success: true, message: 'Te enviamos un código de 6 dígitos a tu correo.' }
}

export async function verifyLoginCode(email: string, code: string) {
  const parsed = OtpVerifySchema.safeParse({ email, code })
  if (!parsed.success) {
    return { success: false, error: 'El código debe tener 6 dígitos' }
  }

  const normalized = parsed.data.email.toLowerCase()

  if (!rateLimit(`otp:verify:${normalized}`, 5, 600)) {
    return { success: false, error: 'Demasiados intentos fallidos. Espera 10 minutos.' }
  }

  try {
    const result = await signIn('otp', {
      email: normalized,
      code: parsed.data.code,
      redirect: false,
    })

    // Mismo criterio que loginUser: detectamos el fallo por el ?error= de la URL
    // de redirección devuelta por signIn (no por auth(), que aún no ve la cookie).
    if (hasAuthError(result)) {
      return { success: false, error: 'Código incorrecto o expirado' }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof AuthJsError) {
      return { success: false, error: 'Código incorrecto o expirado' }
    }
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
