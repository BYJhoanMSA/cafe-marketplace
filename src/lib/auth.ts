// src/lib/auth.ts
// Configuración de Auth.js v5 (NextAuth)
// Documentación: https://authjs.dev/getting-started/installation?framework=Next.js

import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import ResendProvider from 'next-auth/providers/resend'
import bcrypt from 'bcryptjs'
import { prisma } from '@/server/db/client'
import { LoginSchema, OtpVerifySchema } from '@/server/validators/user.schema'
import { consumeOtpCode } from '@/lib/otp'

// AUTH_URL/NEXTAUTH_URL (si se definen) las usa Auth.js automáticamente para
// enlaces de email y callbacks OAuth; no intervienen en la confianza del Host.

// Seguridad: por defecto se mantiene trustHost=true (comportamiento legacy) para
// no romper despliegues detrás de proxies/dominios propios (Hostinger, Cloudflare,
// preview URLs, IP directa, etc.) donde el Host no coincide con AUTH_URL.
// - AUTH_TRUST_HOST=false  → endurecer: Auth.js valida el Host contra AUTH_URL.
// - AUTH_TRUST_HOST=true   → forzar confianza en el Host (no recomendado en prod).
const trustHost = process.env.AUTH_TRUST_HOST !== 'false'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // ============================================================
  // Providers de autenticación
  // ============================================================
  providers: [
    // 1. Email + Password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        // Validar inputs con Zod
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        // Normalizar el usuario/email:
        // - "dkar"               → "dkar@cafemarketplace.com"
        // - "dkar@cafemarketplace"→ "dkar@cafemarketplace.com" (sin TLD)
        // - "dkar@cafemarketplace.com" → tal cual
        const raw = email.toLowerCase().trim()
        const [localPart, domainPart] = raw.split('@')
        const lookupEmail = !raw.includes('@')
          ? `${raw}@cafemarketplace.com`
          : domainPart && !domainPart.includes('.')
            ? `${localPart}@${domainPart}.com`
            : raw

        const user = await prisma.user.findUnique({
          where: { email: lookupEmail.toLowerCase(), deletedAt: null },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            passwordHash: true,
            role: true,
            status: true,
            avatarUrl: true,
          },
        })

        if (!user || !user.passwordHash) return null
        if (user.status !== 'active') return null

        const isValidPassword = await bcrypt.compare(password, user.passwordHash)
        if (!isValidPassword) return null

        // Actualizar lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.avatarUrl,
          role: user.role,
        }
      },
    }),

    // 2. Email + Código OTP (6 dígitos) — verificación y registro por correo
    CredentialsProvider({
      id: 'otp',
      name: 'codigo',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Código', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = OtpVerifySchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, code } = parsed.data
        const normalized = email.toLowerCase()

        // Consumir el código (un solo uso, 10 min de expiración)
        const valid = await consumeOtpCode(normalized, code)
        if (!valid) return null

        // Buscar o crear el usuario. Nuevos registros SIEMPRE inician como customer.
        let user = await prisma.user.findUnique({ where: { email: normalized } })
        if (user && user.deletedAt) return null

        if (!user) {
          const local = normalized.split('@')[0] ?? ''
          const firstName =
            local.charAt(0).toUpperCase() + local.slice(1).replace(/[._-]+/g, ' ').trim().slice(0, 50) ||
            'Usuario'

          user = await prisma.user.create({
            data: {
              email: normalized,
              firstName,
              lastName: '',
              role: 'customer',
              status: 'active',
            },
          })
        }

        if (user.status !== 'active') return null

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          image: user.avatarUrl,
          role: user.role,
        }
      },
    }),

    // 3. Google OAuth
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),

    // 4. Magic Link via Resend
    ResendProvider({
      apiKey: process.env.RESEND_API_KEY ?? '',
      from: process.env.EMAIL_FROM ?? 'Cafe Seleccion <hola@cafemarket.place>',
    }),
  ],

  // ============================================================
  // Session strategy
  // ============================================================
  session: {
    strategy: 'jwt', // JWT para velocidad; DB sessions para "recuérdame" (Fase 2)
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  // ============================================================
  // Callbacks
  // ============================================================
  callbacks: {
    // Añadir datos extra al JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? 'customer'
      }
      return token
    },

    // Exponer datos del JWT en la sesión de cliente
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  // ============================================================
  // Eventos
  // ============================================================
  events: {
    // Cuando un usuario se registra via OAuth/magic-link, creamos su perfil.
    // SIEMPRE inicia como customer; la aprobación de vendor es explícita.
    async createUser({ user }) {
      const [firstName = '', ...rest] = (user.name ?? '').split(' ')
      const lastName = rest.join(' ')
      await prisma.user.update({
        where: { id: user.id },
        data: { firstName, lastName, role: 'customer' },
      })
    },
  },

  // ============================================================
  // Páginas personalizadas
  // ============================================================
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
    verifyRequest: '/auth/verificar',
  },

  // ============================================================
  // Seguridad
  // ============================================================
  // Auth.js lee AUTH_URL/NEXTAUTH_URL del entorno automáticamente; al definirlas
  // deja de depender del header Host. trustHost solo se activa de forma segura.
  trustHost,
  secret: process.env.AUTH_SECRET,
})
