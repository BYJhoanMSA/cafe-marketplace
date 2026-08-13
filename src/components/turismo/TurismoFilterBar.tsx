'use client'

// src/components/turismo/TurismoFilterBar.tsx
// Barra de filtros por región y municipio para /turismo.
// Navega con la URL (?region=...&municipio=...) como el filtro del catálogo.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, X } from 'lucide-react'
import { getRegiones, getMunicipios } from '@/server/actions/turismo.actions'
import styles from './TurismoFilterBar.module.css'

interface RegionOption {
  region: string
  count: number
}

interface MunicipioOption {
  municipio: string
  count: number
}

interface TurismoFilterBarProps {
  initialRegion?: string
  initialMunicipio?: string
}

export function TurismoFilterBar({ initialRegion = '', initialMunicipio = '' }: TurismoFilterBarProps) {
  const router = useRouter()

  const [regiones, setRegiones] = useState<RegionOption[]>([])
  const [municipios, setMunicipios] = useState<MunicipioOption[]>([])
  const [selectedRegion, setSelectedRegion] = useState(initialRegion)
  const [selectedMunicipio, setSelectedMunicipio] = useState(initialMunicipio)

  useEffect(() => {
    getRegiones().then((res) => setRegiones(res))
  }, [])

  useEffect(() => {
    setSelectedMunicipio('')
    getMunicipios(selectedRegion || undefined).then((res) => setMunicipios(res))
  }, [selectedRegion])

  const hasActiveFilters = Boolean(selectedRegion || selectedMunicipio)

  function applyFilters(region: string, municipio: string) {
    const params = new URLSearchParams()
    if (region) params.set('region', region)
    if (municipio) params.set('municipio', municipio)
    const query = params.toString()
    router.push(query ? `/turismo?${query}` : '/turismo')
  }

  function handleSearch() {
    applyFilters(selectedRegion, selectedMunicipio)
  }

  function handleClear() {
    setSelectedRegion('')
    setSelectedMunicipio('')
    router.push('/turismo')
  }

  return (
    <div className={styles.container}>
      <div className={styles.filtersGroup}>
        <span className={styles.label}>
          <Filter size={14} /> Filtros:
        </span>

        {/* DEPARTAMENTO */}
        <select
          className={styles.filterSelect}
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          aria-label="Filtrar por departamento"
        >
          <option value="">🌍 Todos los departamentos</option>
          {regiones.map((r) => (
            <option key={r.region} value={r.region}>
              {r.region} ({r.count})
            </option>
          ))}
        </select>

        {/* MUNICIPIO */}
        <select
          className={styles.filterSelect}
          value={selectedMunicipio}
          onChange={(e) => setSelectedMunicipio(e.target.value)}
          aria-label="Filtrar por municipio"
          disabled={municipios.length === 0}
        >
          <option value="">📍 Todos los municipios</option>
          {municipios.map((m) => (
            <option key={m.municipio} value={m.municipio}>
              {m.municipio} ({m.count})
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button type="button" className={styles.clearButton} onClick={handleClear}>
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      <button type="button" className={styles.searchButton} onClick={handleSearch}>
        Buscar recorridos
      </button>
    </div>
  )
}
