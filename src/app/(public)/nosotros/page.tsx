import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Nosotros',
  description:
    'Conoce nuestra historia, misión y valores. Somos un marketplace que conecta a pequeños productores de café de especialidad con amantes del café en todo el mundo.',
}

export default function NosotrosPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Sobre nosotros
          </p>
          <h1 className={styles.heroTitle}>Nosotros</h1>
          <p className={styles.heroSubtitle}>
            Creemos que un gran café comienza mucho antes de llegar a la taza.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Nuestra visión</p>
            <h2 className={styles.sectionTitle}>Café con identidad</h2>
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
              y el carácter único de cada lote. No buscamos ofrecer la mayor
              cantidad de opciones, sino una colección cuidadosamente curada de
              cafés con identidad propia.
            </p>
            <p>
              Cada origen, cada variedad y cada método de procesamiento cuentan
              una historia distinta. Nuestro propósito es ayudarte a descubrirlas,
              una taza a la vez.
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Nuestro compromiso</p>
            <h2 className={styles.sectionTitle}>Más que vender café</h2>
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
            <p>
              Bienvenido a un lugar donde cada taza tiene un origen, una historia
              y un motivo para ser recordada.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.banner}>
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
