'use server'

import { prisma } from '@/server/db/client'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type HomepageFeature = {
  icon: string
  title: string
  desc: string
}

export type HomepageConfig = {
  heroTitle: string
  heroSubtitle: string
  heroImageUrl: string
  features: HomepageFeature[]
}

const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroTitle: 'Del origen a tu taza,\nsin compromisos',
  heroSubtitle: 'Más de 200 cafés con puntuación SCA verificada, de tostadores artesanales en Colombia, Etiopía, Guatemala y más.',
  heroImageUrl: '/images/hero-coffee-farm.jpg',
  features: [
    {
      icon: 'directo-tostador',
      title: 'Directo al tostador',
      desc: 'Sin intermediarios. Cada compra apoya directamente al productor y al tostador artesanal.'
    },
    {
      icon: 'especialidad',
      title: 'Especialidad verificada',
      desc: 'Solo cafés con cupping score SCA ≥ 80 puntos. Calidad garantizada por expertos certificados.'
    },
    {
      icon: 'frescura',
      title: 'Frescura certificada',
      desc: 'Tostado máximo 7 días antes del envío. Recibe el café en su punto óptimo de degustación.'
    },
    {
      icon: 'sostenible',
      title: 'Comercio sostenible',
      desc: 'Empaque eco-friendly, compensación de carbono y precios justos para los productores.'
    }
  ]
}

export async function getHomepageSettings(): Promise<HomepageConfig> {
  try {
    const setting = await prisma.storeSettings.findUnique({
      where: { key: 'homepage_config' }
    })
    
    if (setting) {
      return JSON.parse(setting.value) as HomepageConfig
    }
    
    return DEFAULT_HOMEPAGE_CONFIG
  } catch (error) {
    console.error('Error fetching homepage settings:', error)
    return DEFAULT_HOMEPAGE_CONFIG
  }
}

export type VariantSizeOption = {
  label: string
  value: string
  grams: number
}

export type GrindTypeOption = {
  label: string
  value: string
}

const DEFAULT_VARIANT_SIZES: VariantSizeOption[] = [
  { label: '125 Gramos', value: '125g', grams: 125 },
  { label: '250 Gramos', value: '250g', grams: 250 },
  { label: '1 Libra', value: '1lb', grams: 454 },
  { label: '5 Libras', value: '5lb', grams: 2270 },
]

const DEFAULT_GRIND_TYPES: GrindTypeOption[] = [
  { label: 'En Grano', value: 'whole-bean' },
  { label: 'Molido (Expresso)', value: 'espresso' },
  { label: 'Molido (Filtro)', value: 'filter' },
  { label: 'Molido (Prensa Francesa)', value: 'french-press' },
]

export async function getVariantSizes(): Promise<VariantSizeOption[]> {
  try {
    const setting = await prisma.storeSettings.findUnique({
      where: { key: 'variant_sizes' }
    })
    if (setting) return JSON.parse(setting.value) as VariantSizeOption[]
    return DEFAULT_VARIANT_SIZES
  } catch {
    return DEFAULT_VARIANT_SIZES
  }
}

export async function getGrindTypes(): Promise<GrindTypeOption[]> {
  try {
    const setting = await prisma.storeSettings.findUnique({
      where: { key: 'grind_types' }
    })
    if (setting) return JSON.parse(setting.value) as GrindTypeOption[]
    return DEFAULT_GRIND_TYPES
  } catch {
    return DEFAULT_GRIND_TYPES
  }
}

export async function updateHomepageSettings(data: HomepageConfig) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, error: 'No autorizado' }
  }

  try {
    const jsonString = JSON.stringify(data)
    
    await prisma.storeSettings.upsert({
      where: { key: 'homepage_config' },
      update: {
        value: jsonString
      },
      create: {
        key: 'homepage_config',
        value: jsonString,
        group: 'cms'
      }
    })
    
    // Invalidar el caché de la página pública
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating homepage settings:', error)
    return { success: false, error: 'Failed to update homepage settings' }
  }
}
