'use client'

// src/components/admin/VendorForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createVendor, updateVendor } from '@/server/actions/admin/vendor.actions'
import { slugify } from '@/lib/utils'

interface VendorFormProps {
  initialData?: any
}

export function VendorForm({ initialData }: VendorFormProps) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    storeName: initialData?.storeName || '',
    slug: initialData?.slug || '',
    shortDescription: initialData?.shortDescription || '',
    country: initialData?.country || 'CO',
    city: initialData?.city || '',
    instagram: initialData?.instagram || '',
    website: initialData?.website || '',
    status: initialData?.status || 'active',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'storeName' && !isEditing) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isEditing) {
        const result = await updateVendor(initialData.id, formData)
        if (result.success) {
          router.push('/admin/marcas')
          router.refresh()
          return
        } else {
          setError(result.error || 'Error al actualizar la marca')
        }
      } else {
        const result = await createVendor(formData)
        if (result.success) {
          router.push('/admin/marcas')
          router.refresh()
          return
        } else {
          setError(result.error || 'Error al crear la marca')
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
      {error && <div style={{ color: 'var(--terra-500)', padding: '1rem', background: 'var(--terra-50)', borderRadius: 'var(--radius-md)' }}>{error}</div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input 
          label="Nombre de la marca (Tostador)" 
          name="storeName" 
          value={formData.storeName} 
          onChange={handleChange} 
          required 
        />
        <Input 
          label="Slug (URL)" 
          name="slug" 
          value={formData.slug} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Breve Descripción</label>
        <textarea
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          required
          rows={3}
          maxLength={500}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input 
          label="País (Código ISO, Ej: CO)" 
          name="country" 
          value={formData.country} 
          onChange={handleChange}
          maxLength={2}
          required 
        />
        <Input 
          label="Ciudad" 
          name="city" 
          value={formData.city} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
        <Input 
          label="Instagram Handle" 
          name="instagram" 
          value={formData.instagram} 
          onChange={handleChange} 
          placeholder="@cafe.origen"
        />
        <Input 
          label="Sitio Web" 
          name="website" 
          value={formData.website} 
          onChange={handleChange} 
          placeholder="https://..."
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Estado</label>
          <Select 
            options={[
              { label: 'Activo', value: 'active' },
              { label: 'Pendiente', value: 'pending' },
              { label: 'Suspendido', value: 'suspended' },
            ]}
            value={formData.status}
            onChange={(val) => handleSelectChange('status', val)}
          />
        </div>
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
          {isEditing ? 'Guardar Cambios' : 'Registrar Marca'}
        </Button>
      </div>
    </form>
  )
}
