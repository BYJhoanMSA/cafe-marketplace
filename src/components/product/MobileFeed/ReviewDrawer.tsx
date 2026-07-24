'use client'

import { useState } from 'react'
import { Drawer } from '@/components/ui/Drawer/Drawer'
import { Star, Send } from 'lucide-react'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
}

const MOCK_REVIEWS: Review[] = [
  { id: '1', name: 'Carlos M.', rating: 5, comment: 'Excelente café, muy fresco y con notas frutales increíbles.', date: 'Hace 2 días' },
  { id: '2', name: 'Ana G.', rating: 4, comment: 'Buen sabor, llegó bien empacado. Lo recomiendo.', date: 'Hace 1 semana' },
  { id: '3', name: 'Pedro R.', rating: 5, comment: 'Mi café favorito para empezar el día. Notas muy limpias.', date: 'Hace 2 semanas' },
]

interface ReviewDrawerProps {
  isOpen: boolean
  onClose: () => void
  productName: string
}

export function ReviewDrawer({ isOpen, onClose, productName }: ReviewDrawerProps) {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim() || rating === 0) return
    const newReview: Review = {
      id: String(Date.now()),
      name: name.trim() || 'Anónimo',
      rating,
      comment: comment.trim(),
      date: 'Justo ahora',
    }
    setReviews((prev) => [newReview, ...prev])
    setName('')
    setComment('')
    setRating(0)
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Reseñas" position="bottom">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>
          {productName}
        </p>

        {/* Lista de reseñas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {reviews.length === 0 ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-tertiary)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              Aún no hay reseñas. Sé el primero en comentar.
            </p>
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
                    {review.name}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>
                    {review.date}
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
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Formulario para agregar reseña */}
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

          <button
            type="submit"
            disabled={!comment.trim() || rating === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              backgroundColor: !comment.trim() || rating === 0 ? 'var(--color-bg-elevated)' : 'var(--color-interactive)',
              color: !comment.trim() || rating === 0 ? 'var(--color-ink-tertiary)' : 'var(--color-ink-inverted)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: !comment.trim() || rating === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-sm)',
              transition: 'var(--transition-normal)',
            }}
          >
            <Send size={16} />
            Publicar reseña
          </button>
        </form>
      </div>
    </Drawer>
  )
}
