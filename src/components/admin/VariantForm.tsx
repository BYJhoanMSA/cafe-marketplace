'use client'

// src/components/admin/VariantForm.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createVariant, updateVariant } from '@/server/actions/admin/inventory.actions'
import type { VariantSizeOption, GrindTypeOption } from '@/server/actions/settings.actions'

interface VariantFormProps {
  products: Array<{ id: string; title: string }>
  variantSizes?: VariantSizeOption[]
  grindTypes?: GrindTypeOption[]
  initialData?: any
}

export function VariantForm({ products, variantSizes = [], grindTypes = [], initialData }: VariantFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    productId: initialData?.productId || (products[0]?.id ?? ''),
    sku: initialData?.sku || '',
    title: initialData?.title || '',
    sizeValue: initialData?.weightGrams
      ? (variantSizes.find(s => s.grams === initialData.weightGrams)?.value ?? '')
      : '',
    weightGrams: initialData?.weightGrams ? String(initialData.weightGrams) : '',
    grindType: initialData?.grindType || 'whole-bean',
    price: initialData?.priceInCents ? String(initialData.priceInCents / 100) : '',
    comparePrice: initialData?.comparePriceInCents ? String(initialData.comparePriceInCents / 100) : '',
    stockQuantity: initialData?.stockQuantity ? String(initialData.stockQuantity) : '0',
    lowStockAlert: initialData?.lowStockAlert ? String(initialData.lowStockAlert) : '5',
    status: initialData?.status || 'active',
  })

  // Auto-generar título cuando se seleccionan tamaño y molienda
  useEffect(() => {
    if (!isEditing && formData.sizeValue && formData.grindType) {
      const size = variantSizes.find(s => s.value === formData.sizeValue)
      const grind = grindTypes.find(g => g.value === formData.grindType)
      if (size && grind) {
        setFormData(prev => ({ ...prev, title: `${size.label} - ${grind.label}` }))
      }
    }
  }, [formData.sizeValue, formData.grindType, isEditing, variantSizes, grindTypes])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.productId) {
      setError('Debes seleccionar un producto')
      return
    }

    setLoading(true)

    try {
      if (isEditing) {
        const result = await updateVariant(initialData.id, formData)
        if (result.success) {
          router.push('/admin/inventario')
          router.refresh()
          return
        } else {
          setError(result.error || 'Error al actualizar variante')
        }
      } else {
        const result = await createVariant(formData)
        if (result.success) {
          router.push('/admin/inventario')
          router.refresh()
          return
        } else {
          setError(result.error || 'Error al crear variante')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '800px' }}>
      {error && (
        <div style={{ color: 'var(--terra-500)', padding: '1rem', background: 'var(--terra-50)', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Producto Padre</label>
        <Select
          options={products.map((p) => ({ label: p.title, value: p.id }))}
          value={formData.productId}
          onChange={(val) => handleSelectChange('productId', val)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label="SKU (Código único)"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          required
          placeholder="EJ: COL-HUILA-250G"
        />
        <Input
          label="Título de Variante"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="EJ: 250g - Grano Entero"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Tamaño / Presentación</label>
          <Select
            options={variantSizes.map(s => ({ label: s.label, value: s.value }))}
            value={formData.sizeValue}
            onChange={(val) => {
              const size = variantSizes.find(s => s.value === val)
              handleSelectChange('sizeValue', val)
              handleSelectChange('weightGrams', size ? String(size.grams) : '')
            }}
            placeholder="Seleccionar tamaño..."
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Tipo de Molienda</label>
          <Select
            options={grindTypes.map(g => ({ label: g.label, value: g.value }))}
            value={formData.grindType}
            onChange={(val) => handleSelectChange('grindType', val)}
            placeholder="Seleccionar molienda..."
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label="Precio (COP)"
          name="price"
          type="number"
          step="1"
          value={formData.price}
          onChange={handleChange}
          required
          placeholder="22000"
        />
        <Input
          label="Precio Comparativo / Antes (COP)"
          name="comparePrice"
          type="number"
          step="1"
          value={formData.comparePrice}
          onChange={handleChange}
          placeholder="28000"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label="Cantidad en Stock"
          name="stockQuantity"
          type="number"
          value={formData.stockQuantity}
          onChange={handleChange}
          required
        />
        <Input
          label="Alerta de Stock Bajo"
          name="lowStockAlert"
          type="number"
          value={formData.lowStockAlert}
          onChange={handleChange}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Estado</label>
          <Select
            options={[
              { label: 'Activa', value: 'active' },
              { label: 'Inactiva', value: 'inactive' },
              { label: 'Agotada', value: 'out_of_stock' },
            ]}
            value={formData.status}
            onChange={(val) => handleSelectChange('status', val)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          {isEditing ? 'Guardar Cambios' : 'Crear Variante'}
        </Button>
      </div>
    </form>
  )
}
