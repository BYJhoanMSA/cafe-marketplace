'use server'

import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import { signIn } from '@/lib/auth'
import { prisma } from '@/server/db/client'
import { RegisterSchema, LoginSchema, type RegisterInput, type LoginInput } from '../validators/user.schema'
import { AuthError as AuthJsError } from 'next-auth'

export async function loginUser(data: LoginInput) {
  try {
    const parsed = LoginSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Datos inválidos' }
    }

    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false, // Manejamos la redirección en el cliente
    })

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

    // 3. Hash y creación
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
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    return { success: true, userId: user.id }
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
  
  try {
    await signIn('resend', { 
      email, 
      redirect: false,
      callbackUrl: '/'
    })
    return { success: true }
  } catch (error) {
    throw error
  }
}
