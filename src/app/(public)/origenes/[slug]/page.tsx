// src/app/(public)/origenes/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOriginBySlug } from '@/server/actions/catalog.actions'
import { ProductCard } from '@/components/product/ProductCard'
import { ArrowLeft } from 'lucide-react'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Origen del Café',
  description: 'Descubre los cafés de especialidad de este origen cafetero.',
}

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function OriginDetailPage({ params }: PageProps) {
  const { slug } = await params
  const origin = await getOriginBySlug(slug)

  if (!origin) notFound()

  const displayName = origin.region || origin.country || origin.slug

  return (
    <div className={styles.container}>
      <div className={styles.back}>
        <Link href="/origenes" className={styles.backLink}>
          <ArrowLeft size={16} />
          Todos los orígenes
        </Link>
      </div>

      <header className={styles.header}>
        {origin.imageUrl && (
          <div className={styles.headerImageWrapper}>
            {/* Usamos next/image solo con URL remota conocida; con localhost usamos <img> simple */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={origin.imageUrl}
              alt={`Paisaje cafetero de ${displayName}`}
              className={styles.headerImage}
            />
          </div>
        )}
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{displayName}</h1>
          {origin.subregion && (
            <p className={styles.subregion}>{origin.subregion}</p>
          )}
          {origin.description && (
            <p className={styles.description}>{origin.description}</p>
          )}
          <span className={styles.count}>
            {origin.products.length} {origin.products.length === 1 ? 'café' : 'cafés'} disponibles
          </span>
        </div>
      </header>

      <section aria-label={`Cafés de ${displayName}`}>
        {origin.products.length > 0 ? (
          <div className={styles.grid}>
            {origin.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>Por el momento no hay cafés disponibles de este origen.</p>
            <Link href="/catalogo" className={styles.emptyLink}>
              Explorar todo el catálogo
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
