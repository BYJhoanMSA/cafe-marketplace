'use client'

// src/components/auth/TasteProfileQuiz.tsx
// Quiz de 4 pasos para descubrir el perfil de sabor del usuario.
// Al finalizar guarda el perfil (si hay sesión) y muestra recomendaciones.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { saveTasteProfile, getRecommendations, type CoffeeRecommendation } from '@/server/actions/taste-profile.actions'
import { ArrowLeft, Sparkles } from 'lucide-react'
import styles from './TasteProfileQuiz.module.css'

// ================================================================
// Definición de preguntas
// ================================================================

interface QuizStep {
  key: keyof TasteProfileState
  title: string
  subtitle: string
  options: { value: string; label: string; icon?: string }[]
  multi?: boolean
}

const STEPS: QuizStep[] = [
  {
    key: 'roastPreference',
    title: '¿Cómo te gusta el tueste?',
    subtitle: 'Esto define la intensidad y el cuerpo de tu taza.',
    options: [
      { value: 'light', label: 'Ligero y brillante', icon: '🌤️' },
      { value: 'medium', label: 'Medio y balanceado', icon: '⚖️' },
      { value: 'medium-dark', label: 'Medio oscuro', icon: '🌗' },
      { value: 'dark', label: 'Oscuro e intenso', icon: '🌙' },
    ],
  },
  {
    key: 'acidityPreference',
    title: '¿Qué nivel de acidez disfrutas?',
    subtitle: 'La acidez aporta frescura y notas frutales a la taza.',
    options: [
      { value: 'low', label: 'Baja, suave', icon: '🫖' },
      { value: 'medium', label: 'Media, equilibrada', icon: '🍊' },
      { value: 'high', label: 'Alta, viva y vibrante', icon: '🍋' },
    ],
  },
  {
    key: 'bodyPreference',
    title: '¿Qué cuerpo prefieres?',
    subtitle: 'El cuerpo es la textura y sensación de la taza en boca.',
    options: [
      { value: 'light', label: 'Ligero, tipo té', icon: '☕' },
      { value: 'medium', label: 'Medio, sedoso', icon: '🍫' },
      { value: 'full', label: 'Completo, cremoso', icon: '🥛' },
    ],
  },
  {
    key: 'flavorNotes',
    title: '¿Qué notas de sabor te enamoran?',
    subtitle: 'Elige todas las que te llamen la atención.',
    multi: true,
    options: [
      { value: 'frutal', label: 'Frutal', icon: '🍒' },
      { value: 'chocolatoso', label: 'Chocolatoso', icon: '🍫' },
      { value: 'floral', label: 'Floral', icon: '🌸' },
      { value: 'citrico', label: 'Cítrico', icon: '🍋' },
      { value: 'caramelo', label: 'Caramelo', icon: '🍬' },
      { value: 'avellanado', label: 'Avellanado', icon: '🌰' },
    ],
  },
]

interface TasteProfileState {
  roastPreference: string
  acidityPreference: string
  bodyPreference: string
  flavorNotes: string[]
  brewMethods: string[]
}

const INITIAL_STATE: TasteProfileState = {
  roastPreference: '',
  acidityPreference: '',
  bodyPreference: '',
  flavorNotes: [],
  brewMethods: [],
}

// ================================================================
// Componente
// ================================================================

export function TasteProfileQuiz() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [state, setState] = useState<TasteProfileState>(INITIAL_STATE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recommendations, setRecommendations] = useState<CoffeeRecommendation[]>([])

  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1

  if (!step) return null

  const isMultiSelectable = (key: string): boolean => {
    return STEPS.find((s) => s.key === key)?.multi ?? false
  }

  const selectOption = (key: keyof TasteProfileState, value: string) => {
    setError('')
    if (isMultiSelectable(key as string)) {
      setState((prev) => {
        const current = (prev[key] as string[]) ?? []
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value]
        return { ...prev, [key]: next }
      })
    } else {
      setState((prev) => ({ ...prev, [key]: value }))
    }
  }

  const canContinue = () => {
    const val = state[step.key]
    if (Array.isArray(val)) return val.length > 0
    return Boolean(val)
  }

  const next = () => {
    if (!canContinue()) return
    if (isLast) {
      finish()
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  const back = () => {
    if (stepIndex === 0) {
      router.push('/')
    } else {
      setStepIndex((i) => i - 1)
    }
  }

  const finish = async () => {
    setLoading(true)
    setError('')
    try {
      const profile = {
        ...state,
        brewMethods: ['v60', 'espresso'],
      }
      await saveTasteProfile(profile)
      const recs = await getRecommendations(profile)
      setRecommendations(recs)
    } catch {
      setError('Ocurrió un error al guardar tu perfil. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // Resultado
  // ============================================================
  if (recommendations.length > 0 || stepIndex === STEPS.length) {
    return (
      <div className={styles.result}>
        <div className={styles.resultIcon}>
          <Sparkles size={32} />
        </div>
        <h2 className={styles.resultTitle}>¡Este es tu café ideal!</h2>
        <p className={styles.resultText}>
          Basándonos en tu perfil, estos cafés de especialidad combinan perfecto con lo que amas.
        </p>

        {recommendations.length > 0 ? (
          <div className={styles.resultGrid}>
            {recommendations.map((rec) => (
              <Link key={rec.id} href={`/productos/${rec.slug}`} className={styles.resultCard}>
                <div className={styles.resultImageWrapper}>
                  <Image src={rec.imageUrl} alt={rec.title} fill className={styles.resultImage} sizes="200px" />
                </div>
                <div className={styles.resultContent}>
                  <h3 className={styles.resultName}>{rec.title}</h3>
                  <p className={styles.resultReason}>{rec.reason}</p>
                  <span className={styles.resultPrice}>{formatPrice(rec.price, rec.currency)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.resultText}>
            Aún no tenemos coincidencias exactas, pero tu perfil quedó guardado.
            Explora el catálogo completo mientras ampliamos nuestra selección.
          </p>
        )}

        <div className={styles.resultActions}>
          <Button as="link" href="/catalogo" variant="primary" size="lg">
            Explorar catálogo completo
          </Button>
          <Button variant="ghost" onClick={() => { setState(INITIAL_STATE); setRecommendations([]); setStepIndex(0) }}>
            Repetir quiz
          </Button>
        </div>
      </div>
    )
  }

  // ============================================================
  // Pregunta
  // ============================================================
  return (
    <div className={styles.quiz}>
      <div className={styles.progress} aria-hidden="true">
        <div className={styles.progressBar} style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
      </div>
      <span className={styles.stepCounter}>
        Pregunta {stepIndex + 1} de {STEPS.length}
      </span>

      <h2 className={styles.questionTitle}>{step.title}</h2>
      <p className={styles.questionSubtitle}>{step.subtitle}</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.options}>
        {step.options.map((option) => {
          const val = state[step.key]
          const isSelected = Array.isArray(val) ? val.includes(option.value) : val === option.value
          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
              onClick={() => selectOption(step.key, option.value)}
              aria-pressed={isSelected}
            >
              {option.icon && <span className={styles.optionIcon} aria-hidden="true">{option.icon}</span>}
              <span className={styles.optionLabel}>{option.label}</span>
              {step.multi && isSelected && <span className={styles.optionCheck} aria-hidden="true">✓</span>}
            </button>
          )
        })}
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={back} leftIcon={<ArrowLeft size={16} />}>
          {stepIndex === 0 ? 'Volver al inicio' : 'Atrás'}
        </Button>
        <Button onClick={next} disabled={!canContinue()} isLoading={loading}>
          {isLast ? 'Ver mi perfil' : 'Siguiente'}
        </Button>
      </div>
    </div>
  )
}
