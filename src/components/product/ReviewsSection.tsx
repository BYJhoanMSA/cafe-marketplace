'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, Send, Loader2, CheckCircle2, MessageSquareOff } from 'lucide-react'
import { getProductReviews, createReview } from '@/server/actions/review.actions'
import type { ReviewItem } from '@/server/actions/review.actions'
import styles from './ReviewsSection.module.css'

interface ReviewsSectionProps {
  productId: string
  productName: string
  sectionRef?: React.RefObject<HTMLElement | null>
}

export function ReviewsSection({ productId, productName, sectionRef }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [hasReviewed, setHasReviewed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProductReviews(productId)
      setReviews(data.reviews)
      setHasReviewed(data.hasReviewed)
      if (data.sessionName) setName(data.sessionName)
    } catch {
      setReviews([])
      setHasReviewed(false)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim() || rating === 0 || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    createReview({ productId, rating, body: comment, authorName: name.trim() || undefined })
      .then((res) => {
        if (res.ok && res.review) {
          setReviews((prev) => [res.review!, ...prev])
          setHasReviewed(true)
          setSubmitSuccess(true)
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
    <section ref={sectionRef} className={styles.section} aria-label="Reseñas del producto">
      <div className={styles.header}>
        <h2 className={styles.title}>Reseñas</h2>
        <p className={styles.subtitle}>{productName}</p>
      </div>

      {/* Lista de reseñas */}
      <div className={styles.reviewList}>
        {loading ? (
          <p className={styles.empty}>Cargando reseñas...</p>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyBox}>
            <MessageSquareOff size={28} color="var(--color-ink-tertiary)" />
            <p className={styles.empty}>
              Aún no hay reseñas. Sé el primero en comentar.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewTop}>
                <span className={styles.reviewAuthor}>{review.author}</span>
                <span className={styles.reviewDate}>{review.dateLabel}</span>
              </div>
              <div className={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    fill={star <= review.rating ? 'var(--gold-500)' : 'none'}
                    color={star <= review.rating ? 'var(--gold-500)' : 'var(--color-border-strong)'}
                  />
                ))}
              </div>
              <p className={styles.reviewBody}>{review.body}</p>
            </div>
          ))
        )}
      </div>

      {hasReviewed && !submitSuccess ? (
        <div className={styles.alreadyReviewed}>
          <CheckCircle2 size={18} color="var(--forest-600)" />
          Ya publicaste una reseña para este producto. Límite de 1 por persona.
        </div>
      ) : (
        /* Formulario para agregar reseña */
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <span className={styles.formLabel}>Tu nombre:</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anónimo"
              className={styles.input}
              maxLength={50}
            />
          </div>

          <div className={styles.formRow}>
            <span className={styles.formLabel}>Calificación:</span>
            <div className={styles.starPicker}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={styles.starButton}
                  style={{
                    color: star <= (hoverRating || rating) ? 'var(--gold-500)' : 'var(--color-border-strong)',
                  }}
                  aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
                >
                  <Star size={18} fill={star <= (hoverRating || rating) ? 'var(--gold-500)' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.textareaWrap}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu reseña..."
              rows={3}
              required
              className={styles.textarea}
              maxLength={500}
            />
            <span className={styles.counter}>{comment.length}/500</span>
          </div>

          {submitError && (
            <p className={styles.error}>{submitError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmittingDisabled}
            className={styles.submitButton}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? 'Publicando...' : 'Publicar reseña'}
          </button>
        </form>
      )}
    </section>
  )
}
