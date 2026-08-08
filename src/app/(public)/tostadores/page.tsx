// src/app/(public)/tostadores/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicVendors } from '@/server/actions/catalog.actions'
import { LogoCafeIcon } from '@/components/ui/Icons/NavIcons'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Tostadores Artesanales',
  description: 'Conoce a los tostadores y marcas artesanales que producen los cafés de Cafe Seleccion.',
}

export const revalidate = 3600

export default async function TostadoresPage() {
  const vendors = await getPublicVendors()

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tostadores artesanales</h1>
        <p className={styles.description}>
          Detrás de cada bolsa hay un tostador comprometido con la calidad y el origen.
          Compra directo, sin intermediarios, apoyando a quienes hacen posible el café.
        </p>
      </header>

      {vendors.length > 0 ? (
        <div className={styles.grid}>
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/tostadores/${vendor.slug}`}
              className={styles.card}
              aria-label={`Ver cafés de ${vendor.storeName}`}
            >
              <div className={styles.logoWrapper}>
                {vendor.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vendor.logoUrl} alt={`Logo de ${vendor.storeName}`} className={styles.logo} />
                ) : (
                  <span className={styles.logoPlaceholder}>
                    <LogoCafeIcon size={48} strokeWidth={1} />
                  </span>
                )}
              </div>

              <div className={styles.content}>
                <h2 className={styles.name}>{vendor.storeName}</h2>
                <p className={styles.shortDesc}>
                  {vendor.shortDescription || vendor.description?.slice(0, 120) || 'Tostador artesanal de café de especialidad.'}
                </p>
                <div className={styles.footer}>
                  <span className={styles.stats}>
                    {vendor.productCount} {vendor.productCount === 1 ? 'café' : 'cafés'}
                  </span>
                  <span className={styles.link}>Ver cafés →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>No hay tostadores publicados en este momento.</p>
          <Link href="/catalogo" className={styles.emptyLink}>Explorar el catálogo</Link>
        </div>
      )}
    </div>
  )
}
