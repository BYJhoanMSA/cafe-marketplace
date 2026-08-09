'use server'

// src/server/actions/review.actions.ts
// Reseñas de productos con persistencia en BD.
// Límite: 1 reseña por producto por persona.
//  - Usuario autenticado → userId (unique [productId, userId])
//  - Visitante anónimo  → guestId en cookie persistente (unique [productId, guestId])
// Las reseñas se crean con status 'approved' para que aparezcan de inmediato
// en el index (no hay panel de moderación aún). Cambiar a 'pending' cuando exista.

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { prisma } from '@/server/db/client'
import { auth } from '@/lib/auth'

const GUEST_COOKIE = 'cafe_reviewer_id'

export interface ReviewItem {
  id: string
  author: string
  rating: number
  body: string
  dateLabel: string
}

export interface CreateReviewResult {
  ok: boolean
  error?: string
  alreadyReviewed?: boolean
  review?: ReviewItem
}

export interface ReviewsResult {
  reviews: ReviewItem[]
  hasReviewed: boolean
  myReviewStatus?: 'approved' | 'pending' | 'rejected'
  /** Nombre del usuario logueado (para prellenar el formulario) */
  sessionName?: string | null
}

function formatDateLabel(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Hoy'
  if (diffDays === 1) return 'Hace 1 día'
  if (diffDays < 30) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function getVisitorId(): Promise<{
  userId: string | null
  guestId: string | null
  sessionName: string | null
}> {
  const session = await auth()
  if (session?.user?.id) {
    return { userId: session.user.id, guestId: null, sessionName: session.user.name ?? null }
  }

  const cookieStore = await cookies()
  let guestId = cookieStore.get(GUEST_COOKIE)?.value ?? null
  if (!guestId) {
    guestId = crypto.randomUUID()
    cookieStore.set(GUEST_COOKIE, guestId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 año
    })
  }
  return { userId: null, guestId, sessionName: null }
}

function toReviewItem(review: {
  id: string
  authorName: string | null
  rating: number
  body: string | null
  createdAt: Date
}): ReviewItem {
  return {
    id: review.id,
    author: review.authorName?.trim() || 'Anónimo',
    rating: review.rating,
    body: review.body?.trim() || '',
    dateLabel: formatDateLabel(review.createdAt),
  }
}

/** Reseñas aprobadas de un producto + si el visitante actual ya reseñó */
export async function getProductReviews(productId: string): Promise<ReviewsResult> {
  const { userId, guestId, sessionName } = await getVisitorId()

  const [reviews, myReview] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status: 'approved', body: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, authorName: true, rating: true, body: true, createdAt: true },
    }),
    userId
      ? prisma.review.findUnique({
          where: { productId_userId: { productId, userId } },
          select: { status: true },
        })
      : guestId
        ? prisma.review.findUnique({
            where: { productId_guestId: { productId, guestId } },
            select: { status: true },
          })
        : null,
  ])

  return {
    reviews: reviews.map(toReviewItem),
    hasReviewed: Boolean(myReview),
    myReviewStatus: myReview?.status as 'approved' | 'pending' | 'rejected' | undefined,
    sessionName,
  }
}

/** Crea una reseña con límite de 1 por producto por persona */
export async function createReview(input: {
  productId: string
  rating: number
  body: string
  authorName?: string
}): Promise<CreateReviewResult> {
  const rating = Math.round(Number(input.rating))
  const body = (input.body ?? '').trim().slice(0, 500)
  const authorName = (input.authorName ?? '').trim().slice(0, 50) || null

  if (!input.productId) {
    return { ok: false, error: 'Falta el producto.' }
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: 'Selecciona una calificación de 1 a 5.' }
  }
  if (!body) {
    return { ok: false, error: 'Escribe un comentario para tu reseña.' }
  }

  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { id: true, slug: true },
  })
  if (!product) {
    return { ok: false, error: 'El producto no existe.' }
  }

  const { userId, guestId } = await getVisitorId()

  // Límite: 1 reseña por producto por persona
  const existing = userId
    ? await prisma.review.findUnique({
        where: { productId_userId: { productId: input.productId, userId } },
        select: { id: true },
      })
    : guestId
      ? await prisma.review.findUnique({
          where: { productId_guestId: { productId: input.productId, guestId } },
          select: { id: true },
        })
      : null

  if (existing) {
    return { ok: false, alreadyReviewed: true, error: 'Ya publicaste una reseña para este producto.' }
  }

  const session = await auth()
  const defaultName = session?.user?.name ?? null

  let created
  try {
    created = await prisma.review.create({
      data: {
        productId: input.productId,
        userId,
        guestId,
        authorName: authorName || defaultName,
        rating,
        body,
        status: 'approved',
        isVerifiedPurchase: false,
      },
      select: { id: true, authorName: true, rating: true, body: true, createdAt: true },
    })
  } catch (err) {
    // 2 personas publicando a la vez sobre el mismo producto
    const code = (err as { code?: string })?.code
    if (code === 'P2002') {
      return { ok: false, alreadyReviewed: true, error: 'Ya publicaste una reseña para este producto.' }
    }
    console.error('createReview error', err)
    return { ok: false, error: 'No se pudo guardar la reseña. Inténtalo de nuevo.' }
  }

  revalidatePath('/')
  revalidatePath(`/productos/${product.slug}`)

  return { ok: true, review: toReviewItem(created) }
}
