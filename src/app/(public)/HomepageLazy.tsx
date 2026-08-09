// src/app/(public)/HomepageLazy.tsx
// Secciones de la homepage que consultan la BD.
// Cada sección obtiene sus propios datos para que el shell y el hero
// se rendericen de inmediato y el resto llegue por streaming (Suspense).

import Link from 'next/link'
import Image from 'next/image'
import { Ornament } from '@/components/ui/Ornament'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { OriginCard } from '@/components/home/OriginCard'
import { ValueIcon } from '@/components/home/ValueIcon'
import { ProductCard } from '@/components/product/ProductCard'
import { prisma } from '@/server/db/client'
import { getHomepageOrigins, getActiveProducts } from '@/server/actions/catalog.actions'
import { getHomepageSettings } from '@/server/actions/settings.actions'
import styles from './page.module.css'

async function getProductCounts(): Promise<{ total: number | null; organic: number | null }> {
  try {
    const [total, organic] = await Promise.all([
      prisma.product.count({ where: { status: 'active', deletedAt: null } }),
      prisma.product.count({ where: { status: 'active', deletedAt: null, isOrganic: true } }),
    ])
    return { total, organic }
  } catch {
    return { total: null, organic: null }
  }
}

export async function HomeHero() {
  const [config, counts] = await Promise.all([
    getHomepageSettings(),
    getProductCounts(),
  ])

  const { total: totalProducts, organic: organicProducts } = counts

  return (
    <section className={styles.hero} aria-label="Bienvenida">
      {/* Imagen de fondo */}
      <div className={styles.heroBackground}>
        <picture>
          <source media="(min-width: 768px)" srcSet={config.heroImageUrl} />
          <source media="(max-width: 767px)" srcSet={config.heroImageUrlMobile || config.heroImageUrl} />
          <Image
            src={config.heroImageUrl}
            alt="Finca cafetera al amanecer con montañas en el fondo"
            fill
            priority
            className={styles.heroImage}
            sizes="100vw"
          />
        </picture>
      </div>
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={styles.heroGrain} aria-hidden="true" />

      {/* Contenido */}
      <div className={styles.heroContent}>
        <div className={styles.heroEyebrow} aria-hidden="true">
          <span className={styles.heroEyebrowLine} />
          Café Artesanal
        </div>

        <h1 className={styles.heroTitle} style={{ whiteSpace: 'pre-line' }}>
          {config.heroTitle}
        </h1>

        <Ornament tone="light" className={styles.heroOrnament} />

        <p className={styles.heroSubtitle}>
          {config.heroSubtitle}
        </p>

        <div className={styles.heroActions}>
          <Link href="/catalogo" className={styles.heroCTA}>
            Explorar catálogo →
          </Link>
          <Link href="/nosotros" className={styles.heroCTASecondary}>
            Nosotros →
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.heroStats} role="list" aria-label="Estadísticas">
          <div className={styles.heroStat} role="listitem">
            <span className={styles.heroStatNumber}><AnimatedNumber value={totalProducts} /></span>
            <span className={styles.heroStatLabel}>Cafés disponibles</span>
          </div>
          <div className={styles.heroStat} role="listitem">
            <span className={styles.heroStatNumber}><AnimatedNumber value={organicProducts} /></span>
            <span className={styles.heroStatLabel}>Orgánicos certificados</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export async function FeaturedProducts() {
  const allProducts = await getActiveProducts()
  const featuredProducts = allProducts.slice(0, 4)

  if (featuredProducts.length === 0) {
    return (
      <p className={styles.emptyProducts}>
        Pronto tendremos cafés disponibles.
      </p>
    )
  }

  return (
    <div className={styles.productGrid}>
      {featuredProducts.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 2}
        />
      ))}
    </div>
  )
}

export async function HomepageOrigins() {
  const origins = await getHomepageOrigins()

  if (origins.length === 0) {
    return (
      <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: 'var(--space-8)' }}>
        Pronto agregaremos más orígenes.
      </p>
    )
  }

  return (
    <div className={styles.originGrid}>
      {origins.map((origin) => (
        <OriginCard
          key={origin.slug}
          label={origin.label}
          slug={origin.slug}
          count={origin.count}
          images={origin.images}
        />
      ))}
    </div>
  )
}

export async function HomepageValues() {
  const { features } = await getHomepageSettings()

  return (
    <div className={styles.valueGrid}>
      {features.map((value) => (
        <div key={value.title} className={styles.valueCard}>
          <span className={styles.valueIcon} aria-hidden="true">
            <ValueIcon icon={value.icon} />
          </span>
          <h3 className={styles.valueTitle}>{value.title}</h3>
          <p className={styles.valueDesc}>{value.desc}</p>
        </div>
      ))}
    </div>
  )
}

export async function HomepageTestimonials() {
  const testimonials = await getApprovedTestimonials()

  if (testimonials.length === 0) {
    return (
      <p className={styles.emptyTestimonials}>
        Todavía no hay reseñas públicas. Sé el primero en compartir tu experiencia.
      </p>
    )
  }

  return (
    <div className={styles.testimonialGrid}>
      {testimonials.map((t) => (
        <figure key={t.id} className={styles.testimonialCard}>
          <div className={styles.testimonialStars} aria-label={`Calificación ${t.rating} de 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`${styles.testimonialStar}${i < t.rating ? ` ${styles.testimonialStarFilled}` : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <blockquote className={styles.testimonialQuote}>
            <p>{t.body}</p>
          </blockquote>
          <figcaption className={styles.testimonialMeta}>
            <span className={styles.testimonialName}>{t.author}</span>
            <Link href={`/productos/${t.productSlug}`} className={styles.testimonialProduct}>
              {t.productTitle}
            </Link>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

async function getApprovedTestimonials() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        status: 'approved',
        body: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        rating: true,
        body: true,
        product: { select: { slug: true, title: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    })

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      body: review.body as string,
      author: [review.user.firstName, review.user.lastName].filter(Boolean).join(' '),
      productTitle: review.product.title,
      productSlug: review.product.slug,
    }))
  } catch {
    return []
  }
}
