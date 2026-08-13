'use server'

// src/server/actions/turismo.actions.ts
// =============================================================================
// Turismo — Recorridos turísticos (independientes del catálogo de café).
// - Públicas: getRecorridos, getRecorridoBySlug, getRegiones, getMunicipios.
// - Admin (solo rol admin): crearRecorrido, actualizarRecorrido, eliminarRecorrido.
// =============================================================================

import { prisma } from '@/server/db/client'
import { requirePermission } from '@/server/middleware/auth.middleware'
import { PERMISSIONS } from '@/server/auth/roles'
import { isForbiddenError, forbiddenResponse } from '@/server/middleware/auth.middleware'
import { withCache, invalidateCacheByPrefix } from '@/server/cache/node-cache'
import { slugify } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// =============================================================================
// Tipos compartidos
// =============================================================================

export interface RecorridoTuristicoCard {
  id: string
  slug: string
  nombre: string
  descripcionCorta: string
  precio: number
  precioOriginal: number | null
  region: string
  municipio: string
  vereda: string | null
  duracion: string | null
  dificultad: string | null
  capacidad: number | null
  imagen: string
  imagenes: string[]
  destacado: boolean
}

export interface RecorridoDetalle extends RecorridoTuristicoCard {
  descripcion: string
  incluye: string[]
  noIncluye: string[]
  itinerario: string[]
  imagenes: string[]
}

export interface RecorridoFiltros {
  region?: string
  municipio?: string
}

// =============================================================================
// Helpers privados
// =============================================================================

function parseJsonArray(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map((s) => String(s)) : []
  } catch {
    return []
  }
}

const cardSelect = {
  id: true,
  slug: true,
  nombre: true,
  descripcionCorta: true,
  precio: true,
  precioOriginal: true,
  region: true,
  municipio: true,
  vereda: true,
  duracion: true,
  dificultad: true,
  capacidad: true,
  imagen: true,
  destacado: true,
  imagenes: { select: { url: true }, orderBy: { orden: 'asc' } },
} as const

function mapToCard(r: {
  id: string
  slug: string
  nombre: string
  descripcionCorta: string
  precio: number
  precioOriginal: number | null
  region: string
  municipio: string
  vereda: string | null
  duracion: string | null
  dificultad: string | null
  capacidad: number | null
  imagen: string
  destacado: boolean
  imagenes: { url: string }[]
}): RecorridoTuristicoCard {
  return {
    id: r.id,
    slug: r.slug,
    nombre: r.nombre,
    descripcionCorta: r.descripcionCorta,
    precio: r.precio,
    precioOriginal: r.precioOriginal,
    region: r.region,
    municipio: r.municipio,
    vereda: r.vereda,
    duracion: r.duracion,
    dificultad: r.dificultad,
    capacidad: r.capacidad,
    imagen: r.imagen,
    imagenes: r.imagenes.map((img) => img.url),
    destacado: r.destacado,
  }
}

// =============================================================================
// Consultas públicas
// =============================================================================

export async function getRecorridos(filtros: RecorridoFiltros = {}): Promise<RecorridoTuristicoCard[]> {
  const cacheKey = `turismo:list:${filtros.region ?? ''}:${filtros.municipio ?? ''}`
  return withCache(cacheKey, async () => {
    try {
      const where: { activo: boolean; deletedAt: null; region?: string; municipio?: string } = {
        activo: true,
        deletedAt: null,
      }
      if (filtros.region) where.region = filtros.region
      if (filtros.municipio) where.municipio = filtros.municipio

      const recorridos = await prisma.recorridoTuristico.findMany({
        where,
        select: cardSelect,
        orderBy: [{ destacado: 'desc' }, { createdAt: 'desc' }],
      })
      return recorridos.map(mapToCard)
    } catch (error) {
      console.error('Error fetching recorridos:', error)
      return []
    }
  }, 300)
}

export async function getRecorridoBySlug(slug: string): Promise<RecorridoDetalle | null> {
  return withCache(`turismo:${slug}`, async () => {
    try {
      const r = await prisma.recorridoTuristico.findFirst({
        where: { slug, activo: true, deletedAt: null },
        include: {
          imagenes: { orderBy: { orden: 'asc' } },
        },
      })
      if (!r) return null

      return {
        ...mapToCard(r),
        descripcion: r.descripcion,
        incluye: parseJsonArray(r.incluye),
        noIncluye: parseJsonArray(r.noIncluye),
        itinerario: parseJsonArray(r.itinerario),
        imagenes: r.imagenes.map((img) => img.url),
      }
    } catch (error) {
      console.error('Error fetching recorrido by slug:', error)
      return null
    }
  }, 600)
}

export async function getRegiones(): Promise<{ region: string; count: number }[]> {
  return withCache('turismo:regiones', async () => {
    try {
      const grouped = await prisma.recorridoTuristico.groupBy({
        by: ['region'],
        where: { activo: true, deletedAt: null },
        _count: { _all: true },
        orderBy: { region: 'asc' },
      })
      return grouped.map((g) => ({ region: g.region, count: g._count._all }))
    } catch (error) {
      console.error('Error fetching regiones:', error)
      return []
    }
  }, 600)
}

export async function getMunicipios(region?: string): Promise<{ municipio: string; count: number }[]> {
  const cacheKey = `turismo:municipios:${region ?? ''}`
  return withCache(cacheKey, async () => {
    try {
      const where: { activo: boolean; deletedAt: null; region?: string } = {
        activo: true,
        deletedAt: null,
      }
      if (region) where.region = region

      const grouped = await prisma.recorridoTuristico.groupBy({
        by: ['municipio'],
        where,
        _count: { _all: true },
        orderBy: { municipio: 'asc' },
      })
      return grouped.map((g) => ({ municipio: g.municipio, count: g._count._all }))
    } catch (error) {
      console.error('Error fetching municipios:', error)
      return []
    }
  }, 600)
}

export async function getRecorridosRelacionados(region: string, slugExcluido: string): Promise<RecorridoTuristicoCard[]> {
  const cacheKey = `turismo:rel:${region}:${slugExcluido}`
  return withCache(cacheKey, async () => {
    try {
      const recorridos = await prisma.recorridoTuristico.findMany({
        where: { region, activo: true, deletedAt: null, slug: { not: slugExcluido } },
        select: cardSelect,
        orderBy: [{ destacado: 'desc' }, { createdAt: 'desc' }],
        take: 3,
      })
      return recorridos.map(mapToCard)
    } catch (error) {
      console.error('Error fetching recorridos relacionados:', error)
      return []
    }
  }, 600)
}

// =============================================================================
// Admin — CRUD (SOLO rol admin)
// =============================================================================

const RecorridoSchema = z.object({
  nombre: z.string().min(1).max(160),
  slug: z.string().max(180).optional(),
  descripcionCorta: z.string().min(1).max(140),
  descripcion: z.string().min(1),
  precio: z.union([z.number(), z.string()]).transform((v) => Math.round(Number(v))),
  precioOriginal: z.union([z.number(), z.string()]).nullable().optional().transform((v) => (v ? Math.round(Number(v)) : null)),
  region: z.string().min(1).max(80),
  municipio: z.string().min(1).max(120),
  vereda: z.string().max(120).nullable().optional(),
  duracion: z.string().max(60).nullable().optional(),
  dificultad: z.string().max(20).nullable().optional(),
  capacidad: z.union([z.number(), z.string()]).nullable().optional().transform((v) => (v ? Number(v) : null)),
  incluye: z.array(z.string()).default([]),
  noIncluye: z.array(z.string()).default([]),
  itinerario: z.array(z.string()).default([]),
  imagen: z.string().min(1),
  imagenUrls: z.array(z.string()).default([]),
  destacado: z.boolean().default(false),
  activo: z.boolean().default(true),
}).passthrough()

export async function crearRecorrido(data: Record<string, unknown>) {
  const session = await requirePermission(PERMISSIONS.TURISMO_MANAGE)
  if (!session || session.user.role !== 'admin') return forbiddenResponse()

  const parsed = RecorridoSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos: ' + parsed.error.errors.map((e) => e.message).join(', ') }
  }

  try {
    const d = parsed.data
    const slug = d.slug || slugify(d.nombre)

    const recorrido = await prisma.recorridoTuristico.create({
      data: {
        nombre: d.nombre,
        slug,
        descripcionCorta: d.descripcionCorta,
        descripcion: d.descripcion,
        precio: d.precio,
        precioOriginal: d.precioOriginal,
        region: d.region,
        municipio: d.municipio,
        vereda: d.vereda || null,
        duracion: d.duracion || null,
        dificultad: d.dificultad || null,
        capacidad: d.capacidad,
        incluye: d.incluye.length > 0 ? JSON.stringify(d.incluye) : null,
        noIncluye: d.noIncluye.length > 0 ? JSON.stringify(d.noIncluye) : null,
        itinerario: d.itinerario.length > 0 ? JSON.stringify(d.itinerario) : null,
        imagen: d.imagen,
        destacado: d.destacado,
        activo: d.activo,
        imagenes: d.imagenUrls.length > 0
          ? { create: d.imagenUrls.map((url, i) => ({ url, orden: i })) }
          : undefined,
      },
    })

    invalidarCacheTurismo()
    return { success: true, recorrido }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error creando recorrido:', error)
    return { success: false, error: error.message || 'Error al crear el recorrido' }
  }
}

export async function actualizarRecorrido(id: string, data: Record<string, unknown>) {
  const session = await requirePermission(PERMISSIONS.TURISMO_MANAGE)
  if (!session || session.user.role !== 'admin') return forbiddenResponse()

  const parsed = RecorridoSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos: ' + parsed.error.errors.map((e) => e.message).join(', ') }
  }

  try {
    const existing = await prisma.recorridoTuristico.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: 'Recorrido no encontrado', status: 404 as const }
    }

    const d = parsed.data
    const slug = d.slug || slugify(d.nombre)

    if (d.imagenUrls !== undefined) {
      await prisma.recorridoImagen.deleteMany({ where: { recorridoId: id } })
      if (d.imagenUrls.length > 0) {
        await prisma.recorridoImagen.createMany({
          data: d.imagenUrls.map((url, i) => ({ recorridoId: id, url, orden: i })),
        })
      }
    }

    const recorrido = await prisma.recorridoTuristico.update({
      where: { id },
      data: {
        nombre: d.nombre,
        slug,
        descripcionCorta: d.descripcionCorta,
        descripcion: d.descripcion,
        precio: d.precio,
        precioOriginal: d.precioOriginal,
        region: d.region,
        municipio: d.municipio,
        vereda: d.vereda || null,
        duracion: d.duracion || null,
        dificultad: d.dificultad || null,
        capacidad: d.capacidad,
        incluye: d.incluye.length > 0 ? JSON.stringify(d.incluye) : null,
        noIncluye: d.noIncluye.length > 0 ? JSON.stringify(d.noIncluye) : null,
        itinerario: d.itinerario.length > 0 ? JSON.stringify(d.itinerario) : null,
        imagen: d.imagen,
        destacado: d.destacado,
        activo: d.activo,
      },
    })

    invalidarCacheTurismo()
    revalidatePath('/turismo')
    revalidatePath(`/turismo/${recorrido.slug}`)
    return { success: true, recorrido }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error actualizando recorrido:', error)
    return { success: false, error: error.message || 'Error al actualizar el recorrido' }
  }
}

export async function eliminarRecorrido(id: string) {
  const session = await requirePermission(PERMISSIONS.TURISMO_MANAGE)
  if (!session || session.user.role !== 'admin') return forbiddenResponse()

  try {
    const existing = await prisma.recorridoTuristico.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: 'Recorrido no encontrado', status: 404 as const }
    }

    await prisma.recorridoTuristico.update({
      where: { id },
      data: { deletedAt: new Date(), activo: false },
    })

    invalidarCacheTurismo()
    revalidatePath('/turismo')
    revalidatePath('/admin/turismo')
    return { success: true }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error eliminando recorrido:', error)
    return { success: false, error: 'Error al eliminar el recorrido' }
  }
}

function invalidarCacheTurismo() {
  invalidateCacheByPrefix('turismo:')
}

// =============================================================================
// Admin — consultas internas del dashboard
// =============================================================================

export async function getAdminRecorridos(page = 1, limit = 50) {
  const session = await requirePermission(PERMISSIONS.TURISMO_MANAGE)
  if (!session || session.user.role !== 'admin') return forbiddenResponse()

  try {
    const where = { deletedAt: null }
    const [recorridos, total] = await Promise.all([
      prisma.recorridoTuristico.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.recorridoTuristico.count({ where }),
    ])

    return { recorridos, total, page, limit }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error fetching admin recorridos:', error)
    return { recorridos: [], total: 0, page, limit }
  }
}

export async function getAdminRecorridoById(id: string) {
  const session = await requirePermission(PERMISSIONS.TURISMO_MANAGE)
  if (!session || session.user.role !== 'admin') return forbiddenResponse()

  try {
    const recorrido = await prisma.recorridoTuristico.findUnique({
      where: { id },
      include: { imagenes: { orderBy: { orden: 'asc' } } },
    })
    if (!recorrido) {
      return { success: false, error: 'Recorrido no encontrado', status: 404 as const }
    }
    return { success: true, recorrido }
  } catch (error: any) {
    if (isForbiddenError(error)) return forbiddenResponse()
    console.error('Error fetching admin recorrido:', error)
    return { success: false, error: 'Error al obtener el recorrido' }
  }
}
