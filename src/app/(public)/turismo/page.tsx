// src/app/(public)/turismo/page.tsx
import type { Metadata } from 'next'
import { Ornament } from '@/components/ui/Ornament'
import { RecorridoCard } from '@/components/turismo/RecorridoCard'
import { TurismoFilterBar } from '@/components/turismo/TurismoFilterBar'
import { getRecorridos } from '@/server/actions/turismo.actions'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Turismo — Recorridos y Experiencias',
  description:
    'Explora recorridos turísticos por las regiones de Colombia: rutas del café, avistamiento de aves, selvas y paisajes. Reserva tu experiencia.',
}

export const revalidate = 3600

const MARQUEE_ITEMS = [
  'Recorridos guiados',
  'Paisajes de Colombia',
  'Ruta del café',
  'Naturaleza y selva',
  'Experiencias locales',
  'Acompañamiento en WhatsApp',
]

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TurismoPage({ searchParams }: PageProps) {
  const params = await searchParams
  const getParam = (key: string): string | undefined => {
    const val = params[key]
    return typeof val === 'string' ? val : undefined
  }

  const region = getParam('region')
  const municipio = getParam('municipio')

  const recorridos = await getRecorridos({ region, municipio })

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGrain} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Experiencias de viaje
          </p>
          <h1 className={styles.heroTitle}>Descubre Colombia con nosotros</h1>
          <p className={styles.heroSubtitle}>
            Recorridos guiados por las regiones del país: rutas del café,
            avistamiento de aves, selvas del Pacífico y más. Vive el territorio
            con acompañamiento cercano y reserva por WhatsApp.
          </p>
          <Ornament tone="light" className={styles.heroOrnament} />
        </div>
      </section>

      {/* MARQUESINA DE MARCA (decorativa) */}
      <section className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[0, 1].map((dup) => (
            <div key={dup} className={styles.marqueeGroup}>
              {MARQUEE_ITEMS.map((item) => (
                <span key={item} className={styles.marqueeItem}>{item}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* LISTADO */}
      <section className={styles.section} aria-labelledby="turismo-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Recorridos</p>
            <h2 className={styles.sectionTitle} id="turismo-title">
              {region ? `Recorridos en ${region}` : 'Nuestros recorridos'}
            </h2>
            <Ornament className={styles.sectionOrnament} />
          </div>

          <TurismoFilterBar initialRegion={region} initialMunicipio={municipio} />

          {recorridos.length > 0 ? (
            <div className={styles.grid}>
              {recorridos.map((recorrido, i) => (
                <RecorridoCard key={recorrido.id} recorrido={recorrido} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No encontramos recorridos con esos filtros.</p>
              <p className={styles.emptyText}>
                Prueba con otra región o municipio, o contacta con nosotros por WhatsApp
                para armarte una experiencia a medida.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* BANNER CTA */}
      <section className={styles.banner}>
        <div className={styles.bannerBg} aria-hidden="true" />
        <div className={styles.bannerInner}>
          <h2 className={styles.bannerTitle}>¿Buscas una experiencia a medida?</h2>
          <p className={styles.bannerText}>
            Escríbenos por WhatsApp y armamos tu recorrido ideal según tus fechas,
            grupo y preferencias.
          </p>
        </div>
      </section>
    </>
  )
}
