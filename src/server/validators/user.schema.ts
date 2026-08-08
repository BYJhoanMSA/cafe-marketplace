// src/server/validators/user.schema.ts
import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña es demasiado larga')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener al menos una mayúscula, una minúscula y un número'
    ),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
})

export const LoginSchema = z.object({
  email: z.string().min(1, 'Usuario o correo es requerido'),
  password: z.string().min(1),
})

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
})

export const AddressSchema = z.object({
  label: z.string().max(100).optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  company: z.string().max(255).optional(),
  address1: z.string().min(1).max(255),
  address2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().length(2),
  phone: z.string().max(30).optional(),
  isDefault: z.boolean().default(false),
})

export const TasteProfileSchema = z.object({
  roastPreference: z.enum(['light', 'medium', 'medium-dark', 'dark']).optional(),
  acidityPreference: z.enum(['low', 'medium', 'high']).optional(),
  bodyPreference: z.enum(['light', 'medium', 'full']).optional(),
  flavorNotes: z.array(z.string().max(100)).max(10).default([]),
  brewMethods: z
    .array(
      z.enum([
        'espresso',
        'filter',
        'french-press',
        'v60',
        'aeropress',
        'moka',
        'cold-brew',
      ])
    )
    .max(5)
    .default([]),
})

export const OtpRequestSchema = z.object({
  email: z.string().email('Email inválido').max(255),
})

export const OtpVerifySchema = z.object({
  email: z.string().email('Email inválido').max(255),
  code: z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos'),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type OtpRequestInput = z.infer<typeof OtpRequestSchema>
export type OtpVerifyInput = z.infer<typeof OtpVerifySchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type AddressInput = z.infer<typeof AddressSchema>
export type TasteProfileInput = z.infer<typeof TasteProfileSchema>
