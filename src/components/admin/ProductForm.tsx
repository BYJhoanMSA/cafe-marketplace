'use client'

// src/components/admin/ProductForm.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ImageUploader, type UploadedImage } from '@/components/admin/ImageUploader'
import { FlavorNotePicker } from '@/components/admin/FlavorNotePicker'
import { OriginTerroirSection } from '@/components/admin/OriginTerroirSection'
import { ProductBadgesSection } from '@/components/admin/ProductBadgesSection'
import { createProduct, updateProduct } from '@/server/actions/admin/product.actions'
import { createVariantsBulk } from '@/server/actions/admin/inventory.actions'
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
  isAdmin?: boolean
}

export function ProductForm({ initialData, vendors = [], categories = [], variantSizes = [], grindTypes = [], isAdmin = false }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
    sortOrder: initialData?.sortOrder || 0,
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

  // Sube a Cloudinary solo las imágenes marcadas como pendientes (sin URL real)
  const uploadPendingImages = async (imgs: UploadedImage[]): Promise<UploadedImage[]> => {
    const uploaded: UploadedImage[] = []
    for (const img of imgs) {
      if (img.file) {
        const formData = new FormData()
        formData.append('file', img.file)
        formData.append('type', 'product')
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Error subiendo imagen: ${img.file.name}`)
        }
        uploaded.push({ url: data.url, alt: img.alt, width: data.width, height: data.height, position: img.position })
      } else {
        uploaded.push({ url: img.url, alt: img.alt, width: img.width, height: img.height, position: img.position })
      }
    }
    return uploaded
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Subir a Cloudinary las imágenes pendientes (solo al guardar)
      const finalImages = await uploadPendingImages(images)

      if (isEditing) {
          const result = await updateProduct(initialData.id, { ...formData, images: finalImages, vendorId: selectedVendorId, categoryId: selectedCategoryId, isFeatured: false })
        if (result.success) {
          router.push('/admin/productos')
          router.refresh()
          return
        } else {
          setError(result.error || 'Error al actualizar el producto')
        }
      } else {
        const result = await createProduct({ ...formData, images: finalImages, vendorId: selectedVendorId, categoryId: selectedCategoryId })
        if (!result.success) {
          setError(result.error || 'Error al guardar el producto')
          setLoading(false)
          return
        }

        // Crear variantes en batch (una sola query)
        if (selectedSizes.length > 0 && selectedGrinds.length > 0 && result.product) {
          const items = []
          for (const sizeValue of selectedSizes) {
            const size = variantSizes.find(s => s.value === sizeValue)
            for (const grindValue of selectedGrinds) {
              const price = combinationPrices[`${sizeValue}|${grindValue}`] || '0'
              const grind = grindTypes.find(g => g.value === grindValue)
              const sku = `${result.product.slug}-${sizeValue}-${grindValue}`.toUpperCase()
              items.push({
                productId: result.product.id,
                sku,
                title: `${size?.label || sizeValue} - ${grind?.label || grindValue}`,
                weightGrams: size?.grams ?? null,
                grindType: grindValue,
                priceInCents: Math.round(parseFloat(price) * 100),
                stockQuantity: 0,
                status: 'active',
              })
            }
          }
          const vResult = await createVariantsBulk(items)
          if (!vResult.success) {
            setError('Producto creado, pero algunas variantes fallaron')
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

      <FlavorNotePicker
        selected={formData.flavorNotes}
        onToggle={toggleFlavorNote}
      />

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
        <p style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-ink-secondary)' }}>
          Marca los tamaños y moliendas que ofrece este producto y asigna el precio a cada combinación.
        </p>

        {!initialData && (
          <>
            {isMobile ? (
              /* ── Vista mobile: chips + tarjetas de precios ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>
                    Tamaños disponibles
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {variantSizes.map(s => {
                      const checked = selectedSizes.includes(s.value)
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setSelectedSizes(prev =>
                            checked ? prev.filter(v => v !== s.value) : [...prev, s.value]
                          )}
                          style={{
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-pill)',
                            border: checked ? '1px solid var(--color-interactive)' : '1px solid var(--color-border-default)',
                            backgroundColor: checked ? 'var(--color-interactive-light, rgba(37,99,235,0.1))' : 'var(--color-bg-primary)',
                            color: checked ? 'var(--color-interactive)' : 'var(--color-ink-secondary)',
                            fontWeight: checked ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)',
                            fontSize: 'var(--text-base)',
                            cursor: 'pointer',
                            transition: 'all var(--duration-fast)',
                          }}
                        >
                          {checked ? '✓ ' : ''}{s.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>
                    Moliendas disponibles
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {grindTypes.map(g => {
                      const checked = selectedGrinds.includes(g.value)
                      return (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setSelectedGrinds(prev =>
                            checked ? prev.filter(v => v !== g.value) : [...prev, g.value]
                          )}
                          style={{
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-pill)',
                            border: checked ? '1px solid var(--color-interactive)' : '1px solid var(--color-border-default)',
                            backgroundColor: checked ? 'var(--color-interactive-light, rgba(37,99,235,0.1))' : 'var(--color-bg-primary)',
                            color: checked ? 'var(--color-interactive)' : 'var(--color-ink-secondary)',
                            fontWeight: checked ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)',
                            fontSize: 'var(--text-base)',
                            cursor: 'pointer',
                            transition: 'all var(--duration-fast)',
                          }}
                        >
                          {checked ? '✓ ' : ''}{g.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {selectedSizes.length > 0 && selectedGrinds.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {variantSizes.filter(s => selectedSizes.includes(s.value)).map(s => (
                      <div key={s.value} style={{
                        padding: 'var(--space-4)',
                        background: 'var(--color-bg-primary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border-default)',
                      }}>
                        <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>
                          {s.label}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                          {grindTypes.filter(g => selectedGrinds.includes(g.value)).map(g => {
                            const key = `${s.value}|${g.value}`
                            return (
                              <div key={g.value} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
                                  {g.label}
                                </span>
                                <input
                                  type="number"
                                  step="1"
                                  placeholder="Precio COP"
                                  value={combinationPrices[key] || ''}
                                  onChange={(e) => {
                                    setCombinationPrices(prev => ({ ...prev, [key]: e.target.value }))
                                  }}
                                  style={{
                                    width: '130px',
                                    padding: 'var(--space-2) var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border-default)',
                                    background: 'var(--color-bg-primary)',
                                    fontFamily: 'inherit',
                                    fontSize: 'var(--text-base)',
                                    textAlign: 'center',
                                    color: 'var(--color-ink-primary)',
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSizes.length > 0 && selectedGrinds.length > 0 && (
                  <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-ink-secondary)' }}>
                    Se generarán <strong>{selectedSizes.length * selectedGrinds.length}</strong> variantes
                  </div>
                )}
              </div>
            ) : (
              /* ── Vista desktop: matriz ── */
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
                  <div style={{ padding: 'var(--space-3) 0 0', fontSize: 'var(--text-base)', color: 'var(--color-ink-secondary)' }}>
                    Se generarán <strong>{selectedSizes.length * selectedGrinds.length}</strong> variantes
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <OriginTerroirSection
        regionName={formData.regionName}
        farmName={formData.farmName}
        producerName={formData.producerName}
        altitudeMasl={formData.altitudeMasl}
        varietal={formData.varietal}
        cuppingScore={formData.cuppingScore}
        onFieldChange={handleChange}
        onSelectChange={handleSelectChange}
      />

      {/* SECCIÓN: ATRIBUTOS TÉCNICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)' }}>
        {isAdmin ? (
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Estado</label>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
              {isEditing ? 'El estado actual se conserva.' : 'Borrador — lo publica el administrador.'}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Nivel de Tueste</label>
          <Select 
            options={[
              { label: 'Claro (Light)', value: 'light' },
              { label: 'Medio-Ligero', value: 'medium-light' },
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
              { label: 'Wet-Hulled', value: 'wet-hulled' },
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

        {isAdmin && (
          <Input 
            label="Prioridad de catálogo" 
            name="sortOrder" 
            type="number"
            min={0}
            step={1}
            value={formData.sortOrder}
            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value, 10) || 0 }))}
            placeholder="0"
            hint="Más alto aparece primero. 0 = orden normal."
          />
        )}
      </div>

      <ProductBadgesSection
        isNew={formData.isNew}
        isLimited={formData.isLimited}
        isOrganic={formData.isOrganic}
        isPublicity={formData.isPublicity}
        showPublicity={isAdmin}
        onToggle={(key) => setFormData(prev => ({ ...prev, [key]: !prev[key] }))}
      />

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
