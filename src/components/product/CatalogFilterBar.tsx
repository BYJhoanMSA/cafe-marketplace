'use client'

// src/components/product/CatalogFilterBar.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass, Funnel, X } from '@phosphor-icons/react'
import { getAvailableCatalogFilters } from '@/server/actions/catalog.actions'
import styles from './CatalogFilterBar.module.css'

interface OriginOption {
  label: string
  value: string
}

interface CatalogFilterBarProps {
  initialFilters?: {
    origin?: string
    altitude?: string
    flavorNote?: string
    process?: string
    roast?: string
  }
}

export function CatalogFilterBar({ initialFilters = {} }: CatalogFilterBarProps) {
  const router = useRouter()

  const [origins, setOrigins] = useState<OriginOption[]>([])
  const [selectedOrigin, setSelectedOrigin] = useState(initialFilters.origin || '')
  const [selectedAltitude, setSelectedAltitude] = useState(initialFilters.altitude || '')
  const [selectedNota, setSelectedNota] = useState(initialFilters.flavorNote || '')
  const [selectedProceso, setSelectedProceso] = useState(initialFilters.process || '')
  const [selectedTueste, setSelectedTueste] = useState(initialFilters.roast || '')

  useEffect(() => {
    async function loadFilters() {
      const res = await getAvailableCatalogFilters()
      if (res.origins) {
        setOrigins(res.origins)
      }
    }
    loadFilters()
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedOrigin) params.set('origen', selectedOrigin)
    if (selectedAltitude) params.set('altitud', selectedAltitude)
    if (selectedNota) params.set('nota', selectedNota)
    if (selectedProceso) params.set('proceso', selectedProceso)
    if (selectedTueste) params.set('tueste', selectedTueste)

    const queryString = params.toString()
    router.push(queryString ? `/catalogo?${queryString}` : '/catalogo')
  }

  const handleClear = () => {
    setSelectedOrigin('')
    setSelectedAltitude('')
    setSelectedNota('')
    setSelectedProceso('')
    setSelectedTueste('')
    router.push('/catalogo')
  }

  const hasActiveFilters = Boolean(selectedOrigin || selectedAltitude || selectedNota || selectedProceso || selectedTueste)

  return (
    <div className={styles.container}>
      <div className={styles.filtersGroup}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-ink-secondary)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
          <Funnel size={14} /> Filtros:
        </span>

        {/* 1. ORIGEN DINÁMICO (Solo regiones con stock > 0) */}
        <select
          className={styles.filterSelect}
          value={selectedOrigin}
          onChange={(e) => setSelectedOrigin(e.target.value)}
          aria-label="Filtrar por Origen en stock"
        >
          <option value="">📍 Todo Origen (En Stock)</option>
          {origins.map((o) => (
            <option key={o.value} value={o.value}>
              🇨🇴 {o.label}
            </option>
          ))}
        </select>

        {/* 2. ALTITUD (Pasos de 300m desde 0m) */}
        <select
          className={styles.filterSelect}
          value={selectedAltitude}
          onChange={(e) => setSelectedAltitude(e.target.value)}
          aria-label="Filtrar por Altitud msnm"
        >
          <option value="">⛰️ Cualquier Altitud</option>
          <option value="0-300">0m – 300m</option>
          <option value="300-600">300m – 600m</option>
          <option value="600-900">600m – 900m</option>
          <option value="900-1200">900m – 1.200m</option>
          <option value="1200-1500">1.200m – 1.500m</option>
          <option value="1500-1800">1.500m – 1.800m</option>
          <option value="1800-2100">1.800m – 2.100m</option>
          <option value="2100+">+2.100m</option>
        </select>

        {/* 3. NOTA DE SABOR (Sensorial) */}
        <select
          className={styles.filterSelect}
          value={selectedNota}
          onChange={(e) => setSelectedNota(e.target.value)}
          aria-label="Filtrar por Nota de sabor"
        >
          <option value="">🍒 Cualquier Perfil</option>
          <option value="frutal">Frutal</option>
          <option value="chocolatoso">Chocolatoso</option>
          <option value="floral">Floral</option>
          <option value="citrico">Cítrico</option>
          <option value="avellanado">Avellanado</option>
          <option value="caramelo">Caramelo</option>
        </select>

        {/* 4. PROCESO BENEFICIO */}
        <select
          className={styles.filterSelect}
          value={selectedProceso}
          onChange={(e) => setSelectedProceso(e.target.value)}
          aria-label="Filtrar por Proceso"
        >
          <option value="">💧 Cualquier Proceso</option>
          <option value="washed">Lavado (Washed)</option>
          <option value="natural">Natural</option>
          <option value="honey">Honey</option>
          <option value="anaerobic">Anaeróbico</option>
        </select>

        {/* LIMPIAR FILTROS */}
        {hasActiveFilters && (
          <button type="button" className={styles.clearButton} onClick={handleClear}>
            <X size={14} />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* 5. BOTÓN BUSCAR / APLICAR */}
      <button type="button" className={styles.searchButton} onClick={handleSearch}>
        <MagnifyingGlass size={16} />
        Buscar
      </button>
    </div>
  )
}
