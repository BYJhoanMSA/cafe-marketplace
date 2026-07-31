// src/app/(public)/page.tsx
// Homepage — Server Component
// El shell (nav, headers y secciones estáticas) se renderiza al instante.
// Las secciones que consultan la BD viven en Suspense y llegan por streaming,
// evitando la pantalla blanca cuando la BD tarda o falla.

import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductCardSkeleton } from '@/components/product/ProductCard'
import { Suspense } from 'react'
import { PillBarWrapper } from '@/components/ui/PillSelector/PillBarWrapper'
import { FLAVOR_ITEMS } from '@/components/ui/PillSelector/PillSelector.data'
import { HomeHero, FeaturedProducts, HomepageOrigins, HomepageValues } from './HomepageLazy'
import styles from './page.module.css'

// ================================================================
// SEO
// ================================================================
export const metadata: Metadata = {
  title: 'Café Artesanal Premium — Directo al Tostador',
  description:
    'Descubre más de 200 cafés de especialidad de Colombia, Etiopía, Guatemala y más. Compra directamente a tostadores verificados con envío a domicilio.',
}

// Caching: Revalidar la página cada hora (ISR) para no saturar MySQL.
export const revalidate = 3600

// ================================================================
// Fallbacks (skeletons) — mismo layout que el contenido real para evitar CLS
// ================================================================
function HomeHeroFallback() {
  return (
    <section className={styles.hero} aria-label="Cargando bienvenida" aria-busy="true">
      <div className={styles.heroBackground} style={{ backgroundColor: 'var(--neutral-800)' }} />
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={styles.heroContent}>
        <div className="skeleton" style={{ height: 12, width: 180 }} />
        <div className="skeleton" style={{ height: 56, width: 'min(85%, 640px)' }} />
        <div className="skeleton" style={{ height: 40, width: 'min(75%, 560px)' }} />
        <div className="skeleton" style={{ height: 40, width: 'min(90%, 700px)' }} />
        <div className="skeleton" style={{ height: 16, width: 320, marginTop: 'var(--space-4)' }} />
      </div>
    </section>
  )
}

function FeaturedFallback() {
  return (
    <div className={styles.productGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

function OriginsFallback() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ height: 200, background: 'var(--neutral-800)', borderRadius: 'var(--radius-xl)' }} />
      ))}
    </div>
  )
}

function ValuesFallback() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ height: 160, background: 'var(--neutral-100)', borderRadius: 'var(--radius-xl)' }} />
      ))}
    </div>
  )
}

// ================================================================
// Página
// ================================================================
export default function HomePage() {
  return (
    <>
      {/* ============================================================
          1. HERO
          ============================================================ */}
      <Suspense fallback={<HomeHeroFallback />}>
        <HomeHero />
      </Suspense>

      {/* ============================================================
          2. FILTROS RÁPIDOS — PillSelector (flotante en mobile)
          ============================================================ */}
      <PillBarWrapper
        items={FLAVOR_ITEMS}
        activeId="coffee"
      />

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

          <Suspense fallback={<FeaturedFallback />}>
            <FeaturedProducts />
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
            <Suspense fallback={<OriginsFallback />}>
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

          <Suspense fallback={<ValuesFallback />}>
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
