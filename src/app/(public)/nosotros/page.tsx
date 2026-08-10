import type { Metadata } from 'next'
import Link from 'next/link'
import { Sprout, MapPin, HeartHandshake, Coffee } from 'lucide-react'
import { Ornament } from '@/components/ui/Ornament'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Nosotros',
  description:
    'Conoce nuestra historia, misión y valores. Somos un marketplace que conecta a pequeños productores de café de especialidad con amantes del café en todo el mundo.',
}

// Marquesina decorativa de marca (solo visual)
const MARQUEE_ITEMS = [
  'Café de especialidad',
  'Directo del productor',
  'Origen único',
  'Tueste artesanal',
  'Lotes pequeños',
  'Trazabilidad real',
]

const VALUE_CARDS = [
  {
    icon: Sprout,
    title: 'Directo del productor',
    desc: 'Coordinamos cada café con quien lo produce. No vendemos café de bodega ni de inventarios impersonales.',
  },
  {
    icon: MapPin,
    title: 'Trazabilidad real',
    desc: 'Sabes de dónde viene cada lote: su origen, variedad, proceso de beneficio y tueste.',
  },
  {
    icon: HeartHandshake,
    title: 'Comercio consciente',
    desc: 'Relaciones justas con pequeños productores, familias cafeteras y emprendimientos rurales.',
  },
  {
    icon: Coffee,
    title: 'Colección curada',
    desc: 'No buscamos cantidad, sino una selección cuidadosa de cafés con carácter propio.',
  },
]

export default function NosotrosPage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGrain} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Sobre nosotros
          </p>
          <h1 className={styles.heroTitle}>Nosotros</h1>
          <p className={styles.heroSubtitle}>
            Creemos que un gran café comienza mucho antes de llegar a la taza.
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

      {/* VISIÓN */}
      <section className={styles.section} aria-labelledby="vision-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Nuestra visión</p>
            <h2 className={styles.sectionTitle} id="vision-title">
              Café con identidad
            </h2>
            <Ornament className={styles.sectionOrnament} />
          </div>
          <div className={styles.textContent}>
            <p>
              Nacimos con una idea sencilla: acercar a más personas el verdadero
              café de especialidad, aquel que respeta su origen, honra el trabajo
              de quienes lo cultivan y revela sabores que solo pueden encontrarse
              cuando cada etapa del proceso se realiza con dedicación.
            </p>
            <p>
              Por eso seleccionamos cuidadosamente cafés de pequeños productores
              y tostadores artesanales, privilegiando la calidad, la trazabilidad
              y el carácter único de cada lote.
            </p>
            <div className={styles.highlight}>
              Cada origen, cada variedad y cada método de procesamiento cuentan
              una historia distinta. Nuestro propósito es ayudarte a descubrirlas,
              una taza a la vez.
            </div>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="values-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Lo que nos guía</p>
            <h2 className={styles.sectionTitle} id="values-title">
              Nuestros valores
            </h2>
            <Ornament className={styles.sectionOrnament} />
          </div>
          <div className={styles.valueGrid}>
            {VALUE_CARDS.map((value) => (
              <div key={value.title} className={styles.valueCard}>
                <span className={styles.valueIcon}>
                  <value.icon size={24} strokeWidth={1.8} />
                </span>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueDesc}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPROMISO / MISIÓN */}
      <section className={styles.section} aria-labelledby="compromise-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Nuestro compromiso</p>
            <h2 className={styles.sectionTitle} id="compromise-title">
              Más que vender café
            </h2>
            <Ornament className={styles.sectionOrnament} />
          </div>
          <div className={styles.textContent}>
            <p>
              Creemos en el consumo consciente, en las relaciones justas con
              quienes hacen posible este café y en disfrutar sin prisas. Porque
              detrás de cada grano hay personas, territorio y pasión.
            </p>
            <p>
              Más que vender café, queremos crear un puente entre quienes lo
              producen con excelencia y quienes disfrutan descubrirlo.
            </p>
            <p className={styles.closingText}>
              Bienvenido a un lugar donde cada taza tiene un origen, una historia
              y un motivo para ser recordada.
            </p>
          </div>
        </div>
      </section>

      {/* BANNER CTA */}
      <section className={styles.banner}>
        <div className={styles.bannerBg} aria-hidden="true" />
        <div className={styles.bannerInner}>
          <h2 className={styles.bannerTitle}>Descubre nuestro catálogo</h2>
          <p className={styles.bannerText}>
            Explora una colección curada de cafés con identidad propia.
          </p>
          <Link href="/catalogo" className={styles.bannerCTA}>
            Explorar catálogo →
          </Link>
        </div>
      </section>
    </>
  )
}
