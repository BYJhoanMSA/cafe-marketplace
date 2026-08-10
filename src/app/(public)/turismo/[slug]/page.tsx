// src/app/(public)/turismo/[slug]/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Clock, Users, ChevronRight, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Ornament } from '@/components/ui/Ornament'
import { RecorridoCard } from '@/components/turismo/RecorridoCard'
import { SolicitarInfoForm } from '@/components/turismo/SolicitarInfoForm'
import { getRecorridoBySlug, getRecorridosRelacionados } from '@/server/actions/turismo.actions'
import { formatPesos, getImageUrl, normalizeWhatsAppNumber } from '@/lib/utils'
import styles from './page.module.css'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const recorrido = await getRecorridoBySlug(slug)
  if (!recorrido) return { title: 'Recorrido no encontrado' }
  return {
    title: `${recorrido.nombre} — Turismo`,
    description: recorrido.descripcionCorta,
  }
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

export default async function RecorridoDetailPage({ params }: PageProps) {
  const { slug } = await params
  const recorrido = await getRecorridoBySlug(slug)
  if (!recorrido) notFound()

  const relacionados = await getRecorridosRelacionados(recorrido.region, recorrido.slug)
  const hasDiscount = recorrido.precioOriginal && recorrido.precioOriginal > recorrido.precio

  const phone =
    normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573008717377') ??
    '573008717377'

  const whatsappMsg = encodeURIComponent(
    `🌟 ¡Hola! Me interesa el recorrido "${recorrido.nombre}" (${recorrido.region}, ${recorrido.municipio}). ¿Me comparten más información y disponibilidad?`
  )
  const whatsappUrl = `https://wa.me/${phone}?text=${whatsappMsg}`

  const galeria = [recorrido.imagen, ...recorrido.imagenes].filter(
    (url, i, arr) => url && arr.indexOf(url) === i
  )

  return (
    <>
      {/* HERO DEL RECORRIDO */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          <Image
            src={getImageUrl(recorrido.imagen, { width: 1600 })}
            alt={recorrido.nombre}
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/turismo" className={styles.breadcrumbLink}>
              Turismo
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span className={styles.breadcrumbCurrent}>{recorrido.nombre}</span>
          </nav>

          <div className={styles.heroBadges}>
            {recorrido.destacado && <Badge variant="forest">Destacado</Badge>}
            <DificultadBadge dificultad={recorrido.dificultad} />
          </div>

          <h1 className={styles.heroTitle}>{recorrido.nombre}</h1>
          <p className={styles.heroSubtitle}>{recorrido.descripcionCorta}</p>

          <div className={styles.heroFacts}>
            <span className={styles.heroFact}>
              <MapPin size={16} aria-hidden="true" />
              {recorrido.region} · {recorrido.municipio}
              {recorrido.vereda ? ` · ${recorrido.vereda}` : ''}
            </span>
            {recorrido.duracion && (
              <span className={styles.heroFact}>
                <Clock size={16} aria-hidden="true" />
                {recorrido.duracion}
              </span>
            )}
            {recorrido.capacidad && (
              <span className={styles.heroFact}>
                <Users size={16} aria-hidden="true" />
                Hasta {recorrido.capacidad} personas
              </span>
            )}
          </div>
        </div>
      </section>

      <div className={styles.layout}>
        {/* ============ COLUMNA PRINCIPAL ============ */}
        <div className={styles.main}>
          {/* Descripción */}
          <section className={styles.section} aria-labelledby="descripcion-title">
            <p className={styles.sectionEyebrow}>Sobre esta experiencia</p>
            <h2 className={styles.sectionTitle} id="descripcion-title">Descripción</h2>
            <Ornament className={styles.sectionOrnament} />
            <p className={styles.bodyText}>{recorrido.descripcion}</p>
          </section>

          {/* Galería */}
          {galeria.length > 1 && (
            <section className={styles.section} aria-labelledby="galeria-title">
              <p className={styles.sectionEyebrow}>Imágenes</p>
              <h2 className={styles.sectionTitle} id="galeria-title">Galería</h2>
              <Ornament className={styles.sectionOrnament} />
              <div className={styles.gallery}>
                {galeria.map((url, i) => (
                  <div key={i} className={styles.galleryItem}>
                    <Image
                      src={getImageUrl(url, { width: 800 })}
                      alt={`${recorrido.nombre} — imagen ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className={styles.galleryImage}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Qué incluye / no incluye */}
          {(recorrido.incluye.length > 0 || recorrido.noIncluye.length > 0) && (
            <section className={styles.section} aria-labelledby="incluye-title">
              <p className={styles.sectionEyebrow}>Tu experiencia</p>
              <h2 className={styles.sectionTitle} id="incluye-title">¿Qué incluye?</h2>
              <Ornament className={styles.sectionOrnament} />

              {recorrido.incluye.length > 0 && (
                <ul className={styles.checkList}>
                  {recorrido.incluye.map((item) => (
                    <li key={item} className={styles.checkItem}>
                      <span className={styles.checkMark} aria-hidden="true">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {recorrido.noIncluye.length > 0 && (
                <>
                  <h3 className={styles.subTitle}>No incluye</h3>
                  <ul className={styles.checkList}>
                    {recorrido.noIncluye.map((item) => (
                      <li key={item} className={`${styles.checkItem} ${styles.checkItemMuted}`}>
                        <span className={styles.crossMark} aria-hidden="true">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          {/* Itinerario */}
          {recorrido.itinerario.length > 0 && (
            <section className={styles.section} aria-labelledby="itinerario-title">
              <p className={styles.sectionEyebrow}>Plan del día</p>
              <h2 className={styles.sectionTitle} id="itinerario-title">Itinerario</h2>
              <Ornament className={styles.sectionOrnament} />
              <ol className={styles.itinerario}>
                {recorrido.itinerario.map((paso, i) => (
                  <li key={i} className={styles.itinerarioItem}>
                    <span className={styles.itinerarioNumber}>{i + 1}</span>
                    <span className={styles.itinerarioText}>{paso}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Recorridos relacionados */}
          {relacionados.length > 0 && (
            <section className={styles.section} aria-labelledby="relacionados-title">
              <p className={styles.sectionEyebrow}>También en {recorrido.region}</p>
              <h2 className={styles.sectionTitle} id="relacionados-title">Recorridos relacionados</h2>
              <Ornament className={styles.sectionOrnament} />
              <div className={styles.relatedGrid}>
                {relacionados.map((r) => (
                  <RecorridoCard key={r.id} recorrido={r} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ============ SIDEBAR / RESUMEN ============ */}
        <aside className={styles.sidebar}>
          <div className={styles.resumeCard}>
            <div className={styles.priceRow}>
              <div className={styles.priceBlock}>
                {hasDiscount && (
                  <span className={styles.comparePrice}>{formatPesos(recorrido.precioOriginal!)}</span>
                )}
                <p className={styles.price}>{formatPesos(recorrido.precio)}</p>
              </div>
              {recorrido.destacado && <Badge variant="forest">Recomendado</Badge>}
            </div>

            <dl className={styles.factList}>
              {recorrido.duracion && (
                <>
                  <dt className={styles.factTerm}>Duración</dt>
                  <dd className={styles.factValue}>{recorrido.duracion}</dd>
                </>
              )}
              {recorrido.dificultad && (
                <>
                  <dt className={styles.factTerm}>Dificultad</dt>
                  <dd className={styles.factValue}>{recorrido.dificultad}</dd>
                </>
              )}
              {recorrido.capacidad && (
                <>
                  <dt className={styles.factTerm}>Capacidad</dt>
                  <dd className={styles.factValue}>Hasta {recorrido.capacidad} personas</dd>
                </>
              )}
              <dt className={styles.factTerm}>Ubicación</dt>
              <dd className={styles.factValue}>
                <span className={styles.locationLine}>{recorrido.region}</span>
                <span className={styles.locationLine}>{recorrido.municipio}</span>
                {recorrido.vereda && <span className={styles.locationLine}>{recorrido.vereda}</span>}
              </dd>
            </dl>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waButton}
            >
              <MessageCircle size={18} aria-hidden="true" />
              Reservar por WhatsApp
            </a>
          </div>

          {/* Formulario de solicitud */}
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Solicitar información</h3>
            <p className={styles.formSubtitle}>
              Cuéntanos tu interés y te respondemos por WhatsApp.
            </p>
            <SolicitarInfoForm
              recorridoNombre={recorrido.nombre}
              recorridoSlug={recorrido.slug}
            />
          </div>
        </aside>
      </div>
    </>
  )
}
