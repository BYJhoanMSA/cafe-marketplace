// src/server/validators/cart.schema.ts
import { z } from 'zod'

export const AddToCartSchema = z.object({
  variantId: z.string().uuid('ID de variante inválido'),
  quantity: z.number().int().min(1).max(99),
})

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(99), // 0 = eliminar
})

export const ApplyCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
})

export const UpdateCartShippingSchema = z.object({
  shippingMethodId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  shippingAddress: z
    .object({
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
    })
    .optional(),
})

export type AddToCartInput = z.infer<typeof AddToCartSchema>
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>
export type ApplyCouponInput = z.infer<typeof ApplyCouponSchema>
