// src/app/(public)/tostadores/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicVendorBySlug } from '@/server/actions/catalog.actions'
import { ProductCard } from '@/components/product/ProductCard'
import { LogoCafeIcon } from '@/components/ui/Icons/NavIcons'
import { ArrowLeft, MapPin, Globe, Instagram, Star, CheckCircle } from 'lucide-react'
import styles from './page.module.css'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const vendor = await getPublicVendorBySlug(slug)
  return {
    title: vendor ? `${vendor.storeName} — Tostador` : 'Tostador no encontrado',
    description: vendor?.shortDescription || 'Tostador artesanal de café de especialidad.',
  }
}

export default async function TostadorDetailPage({ params }: PageProps) {
  const { slug } = await params
  const vendor = await getPublicVendorBySlug(slug)

  if (!vendor) notFound()

  return (
    <div className={styles.container}>
      <div className={styles.back}>
        <Link href="/tostadores" className={styles.backLink}>
          <ArrowLeft size={16} />
          Todos los tostadores
        </Link>
      </div>

      <header className={styles.header}>
        {vendor.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vendor.bannerUrl} alt="" className={styles.banner} />
        ) : (
          <div className={`${styles.banner} ${styles.bannerPlaceholder}`} />
        )}

        <div className={styles.headerContent}>
          <div className={styles.logoWrapper}>
            {vendor.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vendor.logoUrl} alt={`Logo de ${vendor.storeName}`} className={styles.logo} />
            ) : (
              <span className={styles.logoPlaceholder}><LogoCafeIcon size={56} strokeWidth={1} /></span>
            )}
          </div>

          <h1 className={styles.name}>{vendor.storeName}</h1>

          <div className={styles.meta}>
            <span className={styles.rating}>
              <Star size={14} fill="var(--gold-500)" color="var(--gold-500)" />
              {vendor.avgRating.toFixed(1)} ({vendor.reviewCount})
            </span>
            {vendor.city && (
              <span className={styles.metaItem}>
                <MapPin size={14} /> {vendor.city}{vendor.country ? `, ${vendor.country}` : ''}
              </span>
            )}
            {vendor.instagram && (
              <a href={`https://instagram.com/${vendor.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={styles.metaItem}>
                <Instagram size={14} /> @{vendor.instagram.replace('@', '')}
              </a>
            )}
            {vendor.website && (
              <a href={vendor.website} target="_blank" rel="noopener noreferrer" className={styles.metaItem}>
                <Globe size={14} /> Sitio web
              </a>
            )}
          </div>

          {vendor.certifications && (
            <div className={styles.certs}>
              <CheckCircle size={14} />
              {vendor.certifications}
            </div>
          )}

          {vendor.description && (
            <p className={styles.description}>{vendor.description}</p>
          )}
        </div>
      </header>

      <section aria-label={`Cafés de ${vendor.storeName}`}>
        <h2 className={styles.sectionTitle}>
          {vendor.productCount} {vendor.productCount === 1 ? 'café disponible' : 'cafés disponibles'}
        </h2>

        {vendor.products.length > 0 ? (
          <div className={styles.grid}>
            {vendor.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>Por el momento no hay cafés publicados de este tostador.</p>
            <Link href="/catalogo" className={styles.emptyLink}>Explorar el catálogo</Link>
          </div>
        )}
      </section>
    </div>
  )
}
