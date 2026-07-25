'use client'

// src/app/(public)/buscar/page.tsx
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlass, Coffee } from '@phosphor-icons/react'
import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { searchProducts } from '@/server/actions/search.actions'
import styles from './page.module.css'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    let cancelled = false
    setIsSearching(true)

    searchProducts(query).then((data) => {
      if (!cancelled) {
        setResults(data)
        setIsSearching(false)
      }
    })

    return () => { cancelled = true }
  }, [query])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query)}`)
    } else {
      router.push('/buscar')
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>¿Qué estás buscando?</h1>
        <form className={styles.searchBox} onSubmit={handleSearch}>
          <MagnifyingGlass size={24} className={styles.searchIcon} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por origen, tostador o nota de sabor..."
            className={styles.input}
            autoFocus
          />
        </form>
      </header>

      {!query.trim() ? (
        <div className={styles.suggestions}>
          <h2 className={styles.suggestionsTitle}>Búsquedas populares</h2>
          <div className={styles.suggestionTags}>
            <Link href="/buscar?q=Etiopia" className={styles.tag}>Etiopía Natural</Link>
            <Link href="/buscar?q=Geisha" className={styles.tag}>Variedad Geisha</Link>
            <Link href="/buscar?q=Descafeinado" className={styles.tag}>Descafeinado</Link>
            <Link href="/buscar?q=Chocolatoso" className={styles.tag}>Notas a Chocolate</Link>
            <Link href="/buscar?q=Filtro" className={styles.tag}>Para Filtro (V60)</Link>
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsCount}>
              {isSearching ? 'Buscando...' : `${results.length} resultados para "${query}"`}
            </span>
          </div>

          {!isSearching && results.length === 0 ? (
            <div className={styles.emptyState}>
              <Coffee size={48} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No encontramos resultados</h2>
              <p>Intenta con otros términos o busca por origen.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {results.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
