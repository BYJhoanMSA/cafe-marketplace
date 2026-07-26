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

function SvgBase({ children }: { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none" className={styles.filterEmoji} width="28" height="28">
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  )
}

const SVG_ICONS: Record<string, React.ReactNode> = {
  Todo: (
    <SvgBase>
      <path d="M42 86 H86"/>
      <path d="M44 46 H78 V69 C78 80 70 88 61 88 C52 88 44 80 44 69 Z"/>
      <path d="M78 53 C90 53 92 65 84 69 C82 70 80 70 78 70"/>
      <path d="M54 34 C50 40 58 44 54 50"/>
      <path d="M64 30 C60 37 68 42 64 50"/>
      <path d="M74 34 C70 40 78 44 74 50"/>
    </SvgBase>
  ),
  Frutal: (
    <SvgBase>
      <path d="M64 38 C58 28 46 24 36 30"/>
      <path d="M64 38 C70 28 82 24 92 30"/>
      <path d="M64 38 C64 46 64 50 64 54"/>
      <circle cx="46" cy="76" r="16"/>
      <circle cx="82" cy="76" r="16"/>
      <path d="M64 36 C72 22 88 22 92 34 C82 36 72 42 64 36 Z"/>
    </SvgBase>
  ),
  Chocolatoso: (
    <SvgBase>
      <rect x="34" y="30" width="60" height="68" rx="8"/>
      <path d="M54 30V98"/>
      <path d="M74 30V98"/>
      <path d="M34 52H94"/>
      <path d="M34 74H94"/>
      <path d="M40 40H48"/><path d="M60 40H68"/><path d="M80 40H88"/>
      <path d="M40 62H48"/><path d="M60 62H68"/><path d="M80 62H88"/>
      <path d="M40 84H48"/><path d="M60 84H68"/><path d="M80 84H88"/>
    </SvgBase>
  ),
  Floral: (
    <SvgBase>
      <circle cx="64" cy="64" r="8"/>
      <ellipse cx="64" cy="42" rx="10" ry="14"/>
      <ellipse cx="84" cy="56" rx="10" ry="14" transform="rotate(35 84 56)"/>
      <ellipse cx="76" cy="82" rx="10" ry="14" transform="rotate(-35 76 82)"/>
      <ellipse cx="52" cy="82" rx="10" ry="14" transform="rotate(35 52 82)"/>
      <ellipse cx="44" cy="56" rx="10" ry="14" transform="rotate(-35 44 56)"/>
    </SvgBase>
  ),
  Cítrico: (
    <SvgBase>
      <circle cx="64" cy="64" r="34"/>
      <circle cx="64" cy="64" r="4"/>
      <path d="M64 30V60"/><path d="M64 68V98"/>
      <path d="M30 64H60"/><path d="M68 64H98"/>
      <path d="M40 40L58 58"/><path d="M70 70L88 88"/>
      <path d="M88 40L70 58"/><path d="M58 70L40 88"/>
    </SvgBase>
  ),
  Avellanado: (
    <SvgBase>
      <path d="M64 26 C76 18 92 22 94 36 C80 38 70 42 64 50 C60 42 56 34 64 26Z"/>
      <path d="M64 48V56"/>
      <path d="M64 56 C48 56 38 68 38 84 C38 100 50 108 64 108 C78 108 90 100 90 84 C90 68 80 56 64 56Z"/>
      <path d="M48 62 C56 70 72 70 80 62"/>
      <path d="M64 70V96"/>
    </SvgBase>
  ),
  Caramelo: (
    <SvgBase>
      <path d="M34 64 L22 54 L22 74 Z"/>
      <path d="M94 64 L106 54 L106 74 Z"/>
      <rect x="34" y="46" width="60" height="36" rx="12"/>
      <path d="M48 54H80"/>
      <path d="M48 74H80"/>
    </SvgBase>
  ),
  Ligero: (
    <SvgBase>
      <circle cx="64" cy="64" r="20"/>
      <path d="M64 20V34"/><path d="M64 94V108"/>
      <path d="M20 64H34"/><path d="M94 64H108"/>
      <path d="M34 34L44 44"/><path d="M84 84L94 94"/>
      <path d="M94 34L84 44"/><path d="M44 84L34 94"/>
    </SvgBase>
  ),
  Oscuro: (
    <SvgBase>
      <path d="M76 28 C54 30 40 48 40 66 C40 88 56 102 78 102 C64 92 58 76 58 62 C58 46 66 34 76 28Z"/>
      <path d="M88 38V46"/><path d="M84 42H92"/>
      <path d="M94 58V64"/><path d="M91 61H97"/>
    </SvgBase>
  ),
}

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
          2. FILTROS RÁPIDOS — Sticky
          ============================================================ */}
      <div className={styles.filterBar} role="navigation" aria-label="Filtrar por nota de sabor">
        <p className={styles.filterTitle}>Escoge tu sabor</p>
        <div className={styles.filterBarInner}>
          {FILTER_CHIPS.map((chip) => (
            <Link key={chip.href} href={chip.href} className={styles.filterChip}>
              {SVG_ICONS[chip.label] ?? <span className={styles.filterEmoji}>{chip.emoji}</span>}
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
