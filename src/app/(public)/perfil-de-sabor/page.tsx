import type { Metadata } from 'next'
import { TasteProfileQuiz } from '@/components/auth/TasteProfileQuiz'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Descubre tu Perfil de Sabor',
  description:
    'Responde 4 preguntas y descubre qué tipo de café de especialidad es perfecto para ti. Solo 2 minutos.',
}

export default function PerfilDeSaborPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Descubre tu perfil de sabor</h1>
        <p className={styles.description}>
          Responde unas preguntas rápidas y te recomendaremos cafés de especialidad
          hechos para tu paladar. Solo te tomará 2 minutos.
        </p>
      </header>
      <TasteProfileQuiz />
    </div>
  )
}
