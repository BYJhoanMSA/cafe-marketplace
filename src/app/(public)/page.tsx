// src/app/(public)/page.tsx
// Homepage — Server Component
// Estructura: Hero → Filtros → Destacados → Orígenes → Valores → Perfil de Sabor

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard'
import { OriginCard } from '@/components/home/OriginCard'
import { Suspense } from 'react'
import { getHomepageSettings } from '@/server/actions/settings.actions'
import { getActiveProducts } from '@/server/actions/catalog.actions'
import { PillSelector } from '@/components/ui/PillSelector/PillSelector'
import { FLAVOR_ITEMS } from '@/components/ui/PillSelector/PillSelector.data'
import { HomepageOrigins, HomepageValues } from './HomepageLazy'
import styles from './page.module.css'

// ================================================================
// SEO
// ================================================================
export const metadata: Metadata = {
  title: 'Café de Especialidad Premium — Directo al Tostador',
  description:
    'Descubre más de 200 cafés de especialidad de Colombia, Etiopía, Guatemala y más. Compra directamente a tostadores verificados con envío a domicilio.',
}

// Caching: Revalidar la página cada hora (ISR) para no saturar MySQL.
export const revalidate = 3600

// ================================================================
// Página
// ================================================================
export default async function HomePage() {
  const [config, allProducts] = await Promise.all([
    getHomepageSettings(),
    getActiveProducts(),
  ])

  const featuredProducts = allProducts.slice(0, 4)

  return (
    <>
      {/* ============================================================
          1. HERO
          ============================================================ */}
      <section className={styles.hero} aria-label="Bienvenida">
        {/* Imagen de fondo */}
        <div className={styles.heroBackground}>
          <Image
            src={config.heroImageUrl}
            alt="Finca cafetera al amanecer con montañas en el fondo"
            fill
            priority
            className={styles.heroImage}
            sizes="100vw"
          />
        </div>
        <div className={styles.heroOverlay} aria-hidden="true" />

        {/* Contenido */}
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow} aria-hidden="true">
            <span className={styles.heroEyebrowLine} />
            Café de Especialidad
          </div>

          <h1 className={styles.heroTitle} style={{ whiteSpace: 'pre-line' }}>
            {config.heroTitle}
          </h1>

          <p className={styles.heroSubtitle}>
            {config.heroSubtitle}
          </p>

          <div className={styles.heroActions}>
            <Link href="/catalogo" className={styles.heroCTA}>
              Explorar catálogo →
            </Link>
            <Link href="/catalogo" className={styles.heroCTASecondary}>
              Ver selecciones →
            </Link>
          </div>

          {/* Stats */}
          <div className={styles.heroStats} role="list" aria-label="Estadísticas">
            {[
              { number: '200+', label: 'Orígenes' },
              { number: '40+', label: 'Tostadores' },
              { number: '80+', label: 'Score SCA mín.' },
            ].map((stat) => (
              <div key={stat.label} className={styles.heroStat} role="listitem">
                <span className={styles.heroStatNumber}>{stat.number}</span>
                <span className={styles.heroStatLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          2. FILTROS RÁPIDOS — PillSelector
          ============================================================ */}
      <div className={styles.filterBar}>
        <PillSelector
          items={FLAVOR_ITEMS}
          activeId="coffee"
        />
      </div>

      {/* ============================================================
          3. PRODUCTOS DESTACADOS
          ============================================================ */}
      <section className={styles.section} aria-labelledby="featured-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Selección del mes</p>
              <h2 className={styles.sectionTitle} id="featured-title">
                Destacados
              </h2>
            </div>
            <Link href="/catalogo" className={styles.sectionLink}>
              Ver todos →
            </Link>
          </div>

          <Suspense
            fallback={
              <div className={styles.productGrid}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <div className={styles.productGrid}>
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 2}
                  />
                ))
              ) : (
                <p className={styles.emptyProducts}>
                  Pronto tendremos cafés disponibles.
                </p>
              )}
            </div>
          </Suspense>
        </div>
      </section>

      {/* ============================================================
          4. ORÍGENES DEL MUNDO
          ============================================================ */}
      <section className={styles.originBanner} aria-labelledby="origins-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={`${styles.sectionEyebrow}`} style={{ color: 'var(--gold-300)' }}>
                Viaja sin salir de casa
              </p>
              <h2
                className={styles.sectionTitle}
                id="origins-title"
                style={{ color: 'var(--neutral-0)' }}
              >
                Orígenes de Colombia
              </h2>
            </div>
            <Link
              href="/catalogo"
              className={styles.sectionLink}
              style={{ color: 'var(--neutral-400)' }}
            >
              Ver todos →
            </Link>
          </div>

          <div className={styles.originGrid}>
            <Suspense fallback={
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 200, background: 'var(--neutral-800)', borderRadius: 'var(--radius-xl)' }} />
              ))}
            </div>
          }>
            <HomepageOrigins />
          </Suspense>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. PROPUESTA DE VALOR
          ============================================================ */}
      <section className={styles.section} aria-labelledby="values-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Por qué elegirnos</p>
              <h2 className={styles.sectionTitle} id="values-title">
                Café como debe ser
              </h2>
            </div>
          </div>

          <Suspense fallback={
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 160, background: 'var(--neutral-100)', borderRadius: 'var(--radius-xl)' }} />
              ))}
            </div>
          }>
            <HomepageValues />
          </Suspense>
        </div>
      </section>

      {/* ============================================================
          6. BANNER PERFIL DE SABOR
          ============================================================ */}
      <section
        className={styles.section}
        aria-labelledby="taste-profile-title"
        style={{ paddingTop: 0 }}
      >
        <div className={styles.sectionInner}>
          <div className={styles.tasteProfileBanner}>
            <div className={styles.tasteProfileBannerText}>
              <h2 className={styles.tasteProfileBannerTitle} id="taste-profile-title">
                ¿No sabes por dónde empezar?
              </h2>
              <p className={styles.tasteProfileBannerDesc}>
                Descubre tu perfil de sabor en 2 minutos y recibe recomendaciones
                personalizadas basadas en lo que ya amas tomar.
              </p>
            </div>
            <Link href="/catalogo" className={styles.tasteProfileBannerCTA}>
              Explorar variedades →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
