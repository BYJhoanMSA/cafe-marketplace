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
import { LoginSchema } from '@/server/validators/user.schema'

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

        // Si ingresaron solo el usuario (ej: "dkar"), autocompletamos el dominio
        const lookupEmail = email.includes('@') ? email : `${email}@cafemarketplace.com`

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

    // 2. Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),

    // 3. Magic Link via Resend
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
    // Cuando un usuario se registra via OAuth, creamos su perfil en nuestra tabla
    async createUser({ user }) {
      if (user.name) {
        const [firstName = '', ...rest] = user.name.split(' ')
        const lastName = rest.join(' ')
        await prisma.user.update({
          where: { id: user.id },
          data: { firstName, lastName },
        })
      }
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
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})
