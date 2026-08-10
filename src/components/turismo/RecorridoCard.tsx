import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatPesos, getImageUrl } from '@/lib/utils'
import type { RecorridoTuristicoCard } from '@/server/actions/turismo.actions'
import styles from './RecorridoCard.module.css'

// src/components/turismo/RecorridoCard.tsx
// Card de recorrido turístico (vista listado /turismo)

interface RecorridoCardProps {
  recorrido: RecorridoTuristicoCard
  priority?: boolean
}

function DificultadBadge({ dificultad }: { dificultad: string | null }) {
  if (!dificultad) return null
  const labels: Record<string, string> = {
    baja: 'Baja dificultad',
    media: 'Media dificultad',
    alta: 'Alta dificultad',
  }
  return <Badge variant="terra">{labels[dificultad] ?? dificultad}</Badge>
}

export function RecorridoCard({ recorrido, priority = false }: RecorridoCardProps) {
  const hasDiscount = recorrido.precioOriginal && recorrido.precioOriginal > recorrido.precio

  return (
    <Link
      href={`/turismo/${recorrido.slug}`}
      className={styles.card}
      aria-label={`Ver ${recorrido.nombre}`}
    >
      {/* ---- IMAGEN ---- */}
      <div className={styles.imageWrapper}>
        <Image
          src={getImageUrl(recorrido.imagen, { width: 600 })}
          alt={recorrido.nombre}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.image}
          priority={priority}
        />

        <div className={styles.imageBadges}>
          <div className={styles.badgeGroup}>
            {recorrido.destacado && <Badge variant="forest">Destacado</Badge>}
            <DificultadBadge dificultad={recorrido.dificultad} />
          </div>
        </div>
      </div>

      {/* ---- CONTENIDO ---- */}
      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.region}>
            <MapPin size={12} aria-hidden="true" />
            {recorrido.region}
          </span>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.municipio}>
            {recorrido.municipio}
            {recorrido.vereda ? ` · ${recorrido.vereda}` : ''}
          </span>
        </div>

        <h3 className={styles.title}>{recorrido.nombre}</h3>

        <p className={styles.description}>{recorrido.descripcionCorta}</p>

        <div className={styles.facts}>
          {recorrido.duracion && (
            <span className={styles.fact}>
              <Clock size={13} aria-hidden="true" />
              {recorrido.duracion}
            </span>
          )}
          {recorrido.capacidad && (
            <span className={styles.fact}>
              <Users size={13} aria-hidden="true" />
              {recorrido.capacidad} personas
            </span>
          )}
        </div>
      </div>

      {/* ---- FOOTER: Precio ---- */}
      <div className={styles.footer}>
        <div className={styles.priceBlock}>
          {hasDiscount && (
            <span className={styles.comparePrice}>
              {formatPesos(recorrido.precioOriginal!)}
            </span>
          )}
          <p className={styles.price}>{formatPesos(recorrido.precio)}</p>
        </div>
        <span className={styles.cta}>Ver recorrido →</span>
      </div>
    </Link>
  )
}
