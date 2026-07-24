'use client'

// src/components/admin/ProductForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ImageUploader, type UploadedImage } from '@/components/admin/ImageUploader'
import { createProduct, updateProduct } from '@/server/actions/admin/product.actions'
import { createVariant } from '@/server/actions/admin/inventory.actions'
import { slugify } from '@/lib/utils'
import type { VariantSizeOption, GrindTypeOption } from '@/server/actions/settings.actions'

interface VendorOption {
  id: string
  storeName: string
}

interface CategoryOption {
  id: string
  name: string
}

interface ProductFormProps {
  initialData?: any
  vendors?: VendorOption[]
  categories?: CategoryOption[]
  variantSizes?: VariantSizeOption[]
  grindTypes?: GrindTypeOption[]
}

const FLAVOR_NOTE_OPTIONS = [
  'Frambuesa', 'Durazno', 'Jazmín', 'Bergamota', 'Limón', 
  'Panela', 'Caramelo', 'Manzana', 'Chocolate', 'Mora', 
  'Fermentado', 'Cacao', 'Floral', 'Avellanado', 'Cítrico', 'Miel'
]

export function ProductForm({ initialData, vendors = [], categories = [], variantSizes = [], grindTypes = [] }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedVendorId, setSelectedVendorId] = useState(initialData?.vendorId || (vendors[0]?.id || ''))
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoryId || (categories[0]?.id || ''))
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedGrinds, setSelectedGrinds] = useState<string[]>([])
  const [combinationPrices, setCombinationPrices] = useState<Record<string, string>>({})
  const [images, setImages] = useState<UploadedImage[]>(
    initialData?.images?.map((img: any, i: number) => ({
      url: img.url,
      alt: img.alt || '',
      width: img.width,
      height: img.height,
      position: i,
    })) || []
  )
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    status: initialData?.status || 'draft',
    roastLevel: initialData?.roastLevel || 'medium',
    processingMethod: initialData?.processingMethod || 'washed',
    // Ficha de Ubicación y Terruño (Origen Colombiano)
    regionName: initialData?.origin?.region || 'Huila',
    farmName: initialData?.farmName || '',
    producerName: initialData?.producerName || '',
    altitudeMasl: initialData?.altitudeMasl || '1800',
    varietal: initialData?.varietal || 'Castillo, Caturra',
    cuppingScore: initialData?.cuppingScore ? String(initialData.cuppingScore) : '86.0',
    flavorNotes: initialData?.flavorNotes?.map((f: any) => f.note || f) || ['Frambuesa', 'Caramelo'],
    isNew: initialData?.isNew || false,
    isLimited: initialData?.isLimited || false,
    isOrganic: initialData?.isOrganic || false,
    isPublicity: initialData?.isPublicity || false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'title' && !isEditing) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleFlavorNote = (note: string) => {
    setFormData(prev => {
      const current = prev.flavorNotes
      const updated = current.includes(note)
        ? current.filter((n: string) => n !== note)
        : [...current, note]
      return { ...prev, flavorNotes: updated }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isEditing) {
          const result = await updateProduct(initialData.id, { ...formData, images, vendorId: selectedVendorId, categoryId: selectedCategoryId, isFeatured: false })
        if (result.success) {
          router.push('/admin/productos')
          router.refresh()
          return
        } else {
          setError(result.error || 'Error al actualizar el producto')
        }
      } else {
        const result = await createProduct({ ...formData, images, vendorId: selectedVendorId, categoryId: selectedCategoryId })
        if (!result.success) {
          setError(result.error || 'Error al guardar el producto')
          setLoading(false)
          return
        }

        // Crear variantes después del producto (combinaciones de tamaños × moliendas)
        if (selectedSizes.length > 0 && selectedGrinds.length > 0 && result.product) {
          const variantErrors: string[] = []
          for (const sizeValue of selectedSizes) {
            const size = variantSizes.find(s => s.value === sizeValue)
            for (const grindValue of selectedGrinds) {
              const price = combinationPrices[`${sizeValue}|${grindValue}`] || '0'
              const grind = grindTypes.find(g => g.value === grindValue)
              const sku = `${result.product.slug}-${sizeValue}-${grindValue}`.toUpperCase()
              const vResult = await createVariant({
                productId: result.product.id,
                sku,
                title: `${size?.label || sizeValue} - ${grind?.label || grindValue}`,
                sizeValue,
                weightGrams: size ? String(size.grams) : '',
                grindType: grindValue,
                price,
                stockQuantity: '0',
                status: 'active',
              })
              if (!vResult.success) {
                variantErrors.push(vResult.error || `Error creando variante ${sizeValue} - ${grindValue}`)
              }
            }
          }
          if (variantErrors.length > 0) {
            setError('Producto creado, pero algunas variantes fallaron: ' + variantErrors.join(', '))
            setLoading(false)
            return
          }
        }

        router.push('/admin/productos')
        router.refresh()
        return
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '800px' }}>
      {error && <div style={{ color: 'var(--terra-500)', padding: '1rem', background: 'var(--terra-50)', borderRadius: 'var(--radius-md)' }}>{error}</div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input 
          label="Título del producto" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          required 
          placeholder="Ej: Colombia Huila Natural"
        />
        <Input 
          label="Slug (URL)" 
          name="slug" 
          value={formData.slug} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Marca / Vendor</label>
          <Select
            options={vendors.map(v => ({ label: v.storeName, value: v.id }))}
            value={selectedVendorId}
            onChange={setSelectedVendorId}
            placeholder="Seleccionar marca..."
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Categoría</label>
          <Select
            options={categories.map(c => ({ label: c.name, value: c.id }))}
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            placeholder="Seleccionar categoría..."
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Descripción del Café</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={5}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-primary)',
            fontFamily: 'var(--font-secondary)',
            fontSize: 'var(--text-base)',
          }}
        />
      </div>

      {/* SECCIÓN: IMÁGENES DEL PRODUCTO */}
      <div style={{
        padding: 'var(--space-5)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-default)',
      }}>
        <ImageUploader
          images={images}
          onChange={setImages}
          type="product"
          maxImages={8}
          label="📸 Imágenes del producto"
        />
      </div>

      {/* SECCIÓN: NOTAS DE SABOR (EDITABLES) */}
      <div style={{
        padding: 'var(--space-5)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)' }}>
          🍒 Perfil Sensorial (Notas de Sabor)
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
          Selecciona las notas que caracterizan este café (se usarán para los filtros del catálogo):
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          {FLAVOR_NOTE_OPTIONS.map((note) => {
            const isSelected = formData.flavorNotes.includes(note)
            return (
              <button
                type="button"
                key={note}
                onClick={() => toggleFlavorNote(note)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-pill)',
                  border: isSelected ? '1px solid var(--color-interactive)' : '1px solid var(--color-border-default)',
                  backgroundColor: isSelected ? 'var(--color-interactive-light, rgba(37,99,235,0.1))' : 'var(--color-bg-primary)',
                  color: isSelected ? 'var(--color-interactive)' : 'var(--color-ink-secondary)',
                  fontWeight: isSelected ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast)',
                }}
              >
                {isSelected ? '✓ ' : ''}{note}
              </button>
            )
          })}
        </div>
      </div>

      {/* SECCIÓN: VARIANTES — MATRIZ DE PRECIOS */}
      <div style={{
        padding: 'var(--space-5)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)' }}>
          📦 Precios por Tamaño y Molienda
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
          Marca los tamaños y moliendas que ofrece este producto y asigna el precio a cada combinación.
        </p>

        {!initialData && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--text-sm)',
              minWidth: '500px',
            }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border-default)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Tamaño
                  </th>
                  {grindTypes.map(g => (
                    <th key={g.value} style={{
                      textAlign: 'center', padding: 'var(--space-2) var(--space-1)',
                      borderBottom: '1px solid var(--color-border-default)',
                      fontWeight: selectedGrinds.includes(g.value) ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)',
                      color: selectedGrinds.includes(g.value) ? 'var(--color-interactive)' : 'var(--color-ink-tertiary)',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={() => {
                      setSelectedGrinds(prev =>
                        prev.includes(g.value) ? prev.filter(v => v !== g.value) : [...prev, g.value]
                      )
                    }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={selectedGrinds.includes(g.value)}
                          readOnly
                        />
                        <span style={{ writingMode: 'horizontal-tb' }}>{g.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variantSizes.map(s => {
                  const sizeChecked = selectedSizes.includes(s.value)
                  return (
                    <tr key={s.value} style={{
                      backgroundColor: sizeChecked ? 'var(--color-bg-primary)' : 'transparent',
                    }}>
                      <td style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderBottom: '1px solid var(--color-border-default)',
                        fontWeight: sizeChecked ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => {
                        setSelectedSizes(prev =>
                          sizeChecked ? prev.filter(v => v !== s.value) : [...prev, s.value]
                        )
                      }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="checkbox"
                            checked={sizeChecked}
                            readOnly
                          />
                          {s.label}
                        </div>
                      </td>
                      {grindTypes.map(g => {
                        const isActive = sizeChecked && selectedGrinds.includes(g.value)
                        const key = `${s.value}|${g.value}`
                        return (
                          <td key={g.value} style={{
                            textAlign: 'center',
                            padding: 'var(--space-1)',
                            borderBottom: '1px solid var(--color-border-default)',
                          }}>
                            <input
                              type="number"
                              step="1"
                              placeholder="Precio COP"
                              disabled={!isActive}
                              value={isActive ? (combinationPrices[key] || '') : ''}
                              onChange={(e) => {
                                setCombinationPrices(prev => ({ ...prev, [key]: e.target.value }))
                              }}
                              style={{
                                width: '100%',
                                minWidth: '80px',
                                padding: 'var(--space-1) var(--space-2)',
                                borderRadius: 'var(--radius-md)',
                                border: isActive ? '1px solid var(--color-border-default)' : '1px solid transparent',
                                background: isActive ? 'var(--color-bg-primary)' : 'transparent',
                                fontFamily: 'inherit',
                                fontSize: 'var(--text-sm)',
                                textAlign: 'center',
                                color: isActive ? 'var(--color-ink-primary)' : 'var(--color-ink-tertiary)',
                                opacity: isActive ? 1 : 0.4,
                              }}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {selectedSizes.length > 0 && selectedGrinds.length > 0 && (
              <div style={{ padding: 'var(--space-3) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                Se generarán <strong>{selectedSizes.length * selectedGrinds.length}</strong> variantes
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN: FICHA DE ORIGEN Y TERRUÑO */}
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
          📍 Ficha de Ubicación y Terruño (Origen Colombia)
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
              value={formData.regionName}
              onChange={(val) => handleSelectChange('regionName', val)}
            />
          </div>

          <Input 
            label="Finca / Lote" 
            name="farmName" 
            value={formData.farmName} 
            onChange={handleChange} 
            placeholder="Ej: Finca La Palma"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
          <Input 
            label="Productor" 
            name="producerName" 
            value={formData.producerName} 
            onChange={handleChange} 
            placeholder="Ej: Familia Ortiz"
          />
          <Input 
            label="Altitud en Metros (Número msnm)" 
            name="altitudeMasl" 
            type="number"
            value={formData.altitudeMasl} 
            onChange={handleChange} 
            placeholder="1850"
          />
          <Input 
            label="Variedad de Grano" 
            name="varietal" 
            value={formData.varietal} 
            onChange={handleChange} 
            placeholder="Ej: Bourbon Rosado, Geisha"
          />
        </div>
      </div>

      {/* SECCIÓN: ATRIBUTOS TÉCNICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Estado</label>
          <Select 
            options={[
              { label: 'Borrador', value: 'draft' },
              { label: 'Activo', value: 'active' },
              { label: 'Archivado', value: 'archived' },
            ]}
            value={formData.status}
            onChange={(val) => handleSelectChange('status', val)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Nivel de Tueste</label>
          <Select 
            options={[
              { label: 'Claro (Light)', value: 'light' },
              { label: 'Medio (Medium)', value: 'medium' },
              { label: 'Medio-Oscuro', value: 'medium-dark' },
              { label: 'Oscuro (Dark)', value: 'dark' },
            ]}
            value={formData.roastLevel}
            onChange={(val) => handleSelectChange('roastLevel', val)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Proceso Beneficio</label>
          <Select 
            options={[
              { label: 'Lavado (Washed)', value: 'washed' },
              { label: 'Natural', value: 'natural' },
              { label: 'Honey', value: 'honey' },
              { label: 'Anaeróbico', value: 'anaerobic' },
            ]}
            value={formData.processingMethod}
            onChange={(val) => handleSelectChange('processingMethod', val)}
          />
        </div>

        <Input 
          label="Puntaje SCA (0-100)" 
          name="cuppingScore" 
          type="number"
          step="0.5"
          value={formData.cuppingScore} 
          onChange={handleChange} 
          placeholder="88.5"
        />
      </div>

      {/* SECCIÓN: BADGES / FLAGS */}
      <div style={{
        padding: 'var(--space-4) var(--space-5)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-default)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>🏷️ Badges</span>
        {[
          { key: 'isNew' as const, label: 'Nuevo', color: 'var(--gold-500)' },
          { key: 'isLimited' as const, label: 'Edición limitada', color: 'var(--terra-500)' },
          { key: 'isOrganic' as const, label: 'Orgánico', color: 'var(--forest-500)' },
          { key: 'isPublicity' as const, label: 'Publicidad', color: 'var(--color-interactive)' },
        ].map(({ key, label, color }) => (
          <label key={key} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            cursor: 'pointer', fontSize: 'var(--text-sm)',
          }}>
            <input
              type="checkbox"
              checked={formData[key]}
              onChange={() => setFormData(prev => ({ ...prev, [key]: !prev[key] }))}
            />
            <span style={{
              color: formData[key] ? color : undefined,
              fontWeight: formData[key] ? 'var(--font-weight-semibold)' : undefined,
            }}>{label}</span>
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  )
}
