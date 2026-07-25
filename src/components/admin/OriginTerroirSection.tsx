'use client'

import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MapPin } from '@phosphor-icons/react'

interface OriginTerroirSectionProps {
  regionName: string
  farmName: string
  producerName: string
  altitudeMasl: string
  varietal: string
  cuppingScore: string
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (name: string, value: string) => void
}

export function OriginTerroirSection({
  regionName, farmName, producerName, altitudeMasl, varietal, cuppingScore,
  onFieldChange, onSelectChange
}: OriginTerroirSectionProps) {
  return (
    <div style={{
      padding: 'var(--space-5)',
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--color-border-default)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }}>
      <h3 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)' }}>
        <MapPin size={18} weight="fill" /> Ficha de Ubicación y Terruño (Origen Colombia)
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Región / Origen</label>
          <Select
            options={[
              { label: '🇨🇴 Huila', value: 'Huila' },
              { label: '🇨🇴 Nariño', value: 'Nariño' },
              { label: '🇨🇴 Tolima', value: 'Tolima' },
              { label: '🇨🇴 Antioquia', value: 'Antioquia' },
              { label: '🇨🇴 Cauca', value: 'Cauca' },
              { label: '🇨🇴 Quindío / Eje Cafetero', value: 'Quindío' },
              { label: '🇨🇴 Caldas', value: 'Caldas' },
              { label: '🇨🇴 Risaralda', value: 'Risaralda' },
              { label: '🇨🇴 Cundinamarca', value: 'Cundinamarca' },
              { label: '🇨🇴 Santander', value: 'Santander' },
              { label: '🇨🇴 Sierra Nevada', value: 'Sierra Nevada' },
            ]}
            value={regionName}
            onChange={(val) => onSelectChange('regionName', val)}
          />
        </div>

        <Input
          label="Finca / Lote"
          name="farmName"
          value={farmName}
          onChange={onFieldChange}
          placeholder="Ej: Finca La Palma"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label="Productor"
          name="producerName"
          value={producerName}
          onChange={onFieldChange}
          placeholder="Ej: Familia Ortiz"
        />
        <Input
          label="Altitud en Metros (Número msnm)"
          name="altitudeMasl"
          type="number"
          value={altitudeMasl}
          onChange={onFieldChange}
          placeholder="1850"
        />
        <Input
          label="Variedad de Grano"
          name="varietal"
          value={varietal}
          onChange={onFieldChange}
          placeholder="Ej: Bourbon Rosado, Geisha"
        />
      </div>
    </div>
  )
}