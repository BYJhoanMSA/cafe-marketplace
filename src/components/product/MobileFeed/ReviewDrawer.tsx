'use client'

import { useState, useCallback, useEffect } from 'react'
import { Drawer } from '@/components/ui/Drawer/Drawer'
import { Star, Send, Loader2, CheckCircle2, MessageSquareOff } from 'lucide-react'
import { getProductReviews, createReview } from '@/server/actions/review.actions'
import type { ReviewItem } from '@/server/actions/review.actions'

interface ReviewDrawerProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productId?: string
  position?: 'right' | 'left' | 'bottom'
}

export function ReviewDrawer({
  isOpen,
  onClose,
  productName,
  productId,
  position = 'bottom',
}: ReviewDrawerProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [hasReviewed, setHasReviewed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const loadReviews = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await getProductReviews(productId)
      setReviews(data.reviews)
      setHasReviewed(data.hasReviewed)
    } catch {
      setReviews([])
      setHasReviewed(false)
    } finally {
      setLoading(false)
    }
  }, [productId])

  // Recargar al abrir (reset de estados del form)
  useEffect(() => {
    if (!isOpen) return
    setSubmitError(null)
    setSubmitSuccess(false)
    setName('')
    setComment('')
    setRating(0)
    setHoverRating(0)
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId || !comment.trim() || rating === 0 || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    createReview({ productId, rating, body: comment, authorName: name.trim() || undefined })
      .then((res) => {
        if (res.ok && res.review) {
          setReviews((prev) => [res.review!, ...prev])
          setHasReviewed(true)
          setSubmitSuccess(true)
          setName('')
          setComment('')
          setRating(0)
        } else {
          setSubmitError(res.error ?? 'No se pudo publicar la reseña.')
          if (res.alreadyReviewed) setHasReviewed(true)
        }
      })
      .catch(() => setSubmitError('No se pudo guardar la reseña. Inténtalo de nuevo.'))
      .finally(() => setSubmitting(false))
  }

  const isSubmittingDisabled = !comment.trim() || rating === 0 || submitting

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Reseñas"
      position={position}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
      >
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>
          {productName}
        </p>

        {/* Lista de reseñas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {loading ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-tertiary)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              Cargando reseñas...
            </p>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
              <MessageSquareOff size={28} color="var(--color-ink-tertiary)" />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-tertiary)' }}>
                Aún no hay reseñas. Sé el primero en comentar.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-primary)' }}>
                    {review.author}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>
                    {review.dateLabel}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      fill={star <= review.rating ? 'var(--gold-500)' : 'none'}
                      color={star <= review.rating ? 'var(--gold-500)' : 'var(--color-border-strong)'}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                  {review.body}
                </p>
              </div>
            ))
          )}
        </div>

        {hasReviewed && !submitSuccess ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-ink-secondary)',
            }}
          >
            <CheckCircle2 size={18} color="var(--forest-600)" />
            Ya publicaste una reseña para este producto. Límite de 1 por persona.
          </div>
        ) : (
          /* Formulario para agregar reseña */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Tu nombre:</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anónimo"
                style={{
                  flex: 1,
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-ink-primary)',
                  fontFamily: 'var(--font-secondary)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                }}
                maxLength={50}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', fontWeight: 'var(--font-weight-medium)', marginRight: 'var(--space-1)' }}>Calificación:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: star <= (hoverRating || rating) ? 'var(--gold-500)' : 'var(--color-border-strong)',
                  }}
                  aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
                >
                  <Star size={18} fill={star <= (hoverRating || rating) ? 'var(--gold-500)' : 'none'} />
                </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe tu reseña..."
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-ink-primary)',
                  fontFamily: 'var(--font-secondary)',
                  fontSize: 'var(--text-sm)',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 'var(--leading-relaxed)',
                }}
                maxLength={500}
              />
              <span style={{
                position: 'absolute',
                bottom: 'var(--space-1)',
                right: 'var(--space-2)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-ink-tertiary)',
              }}>
                {comment.length}/500
              </span>
            </div>

            {submitError && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--terra-600)' }}>
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmittingDisabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3)',
                backgroundColor: isSubmittingDisabled ? 'var(--color-bg-elevated)' : 'var(--color-interactive)',
                color: isSubmittingDisabled ? 'var(--color-ink-tertiary)' : 'var(--color-ink-inverted)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: isSubmittingDisabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-secondary)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--text-sm)',
                transition: 'var(--transition-normal)',
              }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? 'Publicando...' : 'Publicar reseña'}
            </button>
          </form>
        )}
      </div>
    </Drawer>
  )
}
