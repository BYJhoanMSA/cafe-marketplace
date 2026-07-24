// src/server/validators/product.schema.ts
// Schemas Zod para validar entradas de la API de productos

import { z } from 'zod'

export const RoastLevelSchema = z.enum([
  'light',
  'medium-light',
  'medium',
  'medium-dark',
  'dark',
])

export const ProcessingMethodSchema = z.enum([
  'washed',
  'natural',
  'honey',
  'anaerobic',
  'wet-hulled',
])

export const GrindTypeSchema = z.enum([
  'whole-bean',
  'espresso',
  'filter',
  'french-press',
  'moka',
  'cold-brew',
])

export const ProductStatusSchema = z.enum(['draft', 'active', 'archived'])

// Schema para crear un producto (admin)
export const CreateProductSchema = z.object({
  vendorId: z.string().uuid(),
  categoryId: z.string().uuid(),
  originId: z.string().uuid(),
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  shortDescription: z.string().max(500).optional(),
  roastLevel: RoastLevelSchema,
  processingMethod: ProcessingMethodSchema,
  altitudeMasl: z.string().max(50).optional(),
  varietal: z.string().max(100).optional(),
  farmName: z.string().max(255).optional(),
  producerName: z.string().max(255).optional(),
  harvestDate: z.string().max(50).optional(),
  cuppingScore: z.number().min(0).max(100).optional(),
  isOrganic: z.boolean().default(false),
  isFairTrade: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isLimited: z.boolean().default(false),
  flavorNotes: z.array(z.string().max(100)).max(10).default([]),
  certifications: z.array(z.string().max(50)).max(10).default([]),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
})

// Schema para actualizar un producto (partial)
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  status: ProductStatusSchema.optional(),
})

// Schema para filtrar productos (query params)
export const ProductFiltersSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  originId: z.string().uuid().optional(),
  roastLevel: RoastLevelSchema.optional(),
  processingMethod: ProcessingMethodSchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minCuppingScore: z.coerce.number().min(0).max(100).optional(),
  flavorNotes: z.string().optional(), // comma-separated
  isOrganic: z.coerce.boolean().optional(),
  isFairTrade: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  vendorId: z.string().uuid().optional(),
  sortBy: z
    .enum(['price_asc', 'price_desc', 'rating', 'newest', 'best_selling'])
    .default('newest'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(24),
})

// Schema para crear una variante
export const CreateVariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  weightGrams: z.number().int().positive().optional(),
  grindType: GrindTypeSchema.optional(),
  priceInCents: z.number().int().positive(),
  comparePriceInCents: z.number().int().positive().optional(),
  costInCents: z.number().int().positive().optional(),
  currency: z.string().length(3).default('USD'),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockAlert: z.number().int().min(0).default(5),
  position: z.number().int().min(0).default(0),
  barcode: z.string().max(100).optional(),
})

export const UpdateVariantSchema = CreateVariantSchema.partial().omit({
  productId: true,
})

export type ProductFilters = z.infer<typeof ProductFiltersSchema>
export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
export type CreateVariantInput = z.infer<typeof CreateVariantSchema>
