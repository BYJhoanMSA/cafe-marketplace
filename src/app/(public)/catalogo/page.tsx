// src/app/(public)/catalogo/page.tsx
import type { Metadata } from 'next'
import { ProductCard } from '@/components/product/ProductCard'
import { MobileFeed } from '@/components/product/MobileFeed'
import { CatalogFilterBar } from '@/components/product/CatalogFilterBar'
import { getActiveProducts } from '@/server/actions/catalog.actions'
import type { CatalogFilters } from '@/server/actions/catalog.actions'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Catálogo de Cafés de Especialidad',
  description: 'Explora nuestra selección curada de cafés premium de todo el mundo.',
}

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams

  const getParam = (key: string): string | undefined => {
    const val = params[key]
    return typeof val === 'string' ? val : undefined
  }

  const filters: CatalogFilters = {
    origin: getParam('origen'),
    altitude: getParam('altitud'),
    flavorNote: getParam('nota'),
    process: getParam('proceso'),
  }

  const products = await getActiveProducts(filters)

  return (
    <div className={styles.container}>
      {/* VISTA MOBILE: Feed estilo TikTok */}
      {products.length > 0 && (
        <div className={styles.mobileView}>
          <MobileFeed products={products} />
        </div>
      )}

      {/* VISTA DESKTOP: Grid tradicional */}
      <div className={styles.desktopView}>
        <header className={styles.header}>
          <h1 className={styles.title}>Catálogo</h1>
          <p className={styles.description}>
            Descubre nuestra selección rotativa de los mejores cafés de especialidad.
          </p>
        </header>

        <CatalogFilterBar initialFilters={filters} />

        <div className={styles.grid}>
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className={styles.empty}>No hay productos disponibles en este momento.</p>
          )}
        </div>
      </div>
    </div>
  )
}
