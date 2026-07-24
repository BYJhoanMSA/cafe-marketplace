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
import { getActiveProducts, getHomepageOrigins } from '@/server/actions/catalog.actions'
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
// Datos estáticos de ejemplo (reemplazar con datos de DB en Fase 5)
// ================================================================
const FILTER_CHIPS = [
  { emoji: '☕', label: 'Todo', href: '/catalogo' },
  { emoji: '🍒', label: 'Frutal', href: '/catalogo?nota=frutal' },
  { emoji: '🍫', label: 'Chocolatoso', href: '/catalogo?nota=chocolatoso' },
  { emoji: '🌸', label: 'Floral', href: '/catalogo?nota=floral' },
  { emoji: '🍋', label: 'Cítrico', href: '/catalogo?nota=citrico' },
  { emoji: '🌰', label: 'Avellanado', href: '/catalogo?nota=avellanado' },
  { emoji: '🍬', label: 'Caramelo', href: '/catalogo?nota=caramelo' },
  { emoji: '☀️', label: 'Ligero', href: '/catalogo?tueste=light' },
  { emoji: '🌑', label: 'Oscuro', href: '/catalogo?tueste=dark' },
]

// ================================================================
// Página
// ================================================================
export default async function HomePage() {
  const [config, allProducts, origins] = await Promise.all([
    getHomepageSettings(),
    getActiveProducts(),
    getHomepageOrigins(),
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
          2. FILTROS RÁPIDOS — Sticky
          ============================================================ */}
      <div className={styles.filterBar} role="navigation" aria-label="Filtrar por nota de sabor">
        <p className={styles.filterTitle}>Escoge tu sabor</p>
        <div className={styles.filterBarInner}>
          {FILTER_CHIPS.map((chip) => (
            <Link key={chip.href} href={chip.href} className={styles.filterChip}>
              <span className={styles.filterEmoji}>{chip.emoji}</span>
              <span className={styles.filterLabel}>{chip.label}</span>
            </Link>
          ))}
        </div>
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
            {origins.length > 0 ? origins.map((origin) => (
              <OriginCard
                key={origin.slug}
                label={origin.label}
                slug={origin.slug}
                count={origin.count}
                images={origin.images}
              />
            )) : (
              <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: 'var(--space-8)' }}>
                Pronto agregaremos más orígenes.
              </p>
            )}
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

          <div className={styles.valueGrid}>
            {config.features.map((value) => (
              <div key={value.title} className={styles.valueCard}>
                <span className={styles.valueIcon} aria-hidden="true">
                  {value.icon}
                </span>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueDesc}>{value.desc}</p>
              </div>
            ))}
          </div>
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
