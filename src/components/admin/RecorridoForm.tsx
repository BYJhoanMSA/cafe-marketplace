'use client'

// src/components/admin/RecorridoForm.tsx
// Formulario de creación/edición de recorridos turísticos (solo rol admin).
// - Precios se ingresan en PESOS y la acción los convierte a centavos.
// - La primera imagen del ImageUploader es la imagen principal.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ImageUploader, type UploadedImage } from '@/components/admin/ImageUploader'
import { crearRecorrido, actualizarRecorrido } from '@/server/actions/turismo.actions'
import { slugify } from '@/lib/utils'

export const REGIONES_TURISMO = ['Andina', 'Cafetera', 'Caribe', 'Pacífico', 'Orinoquía', 'Amazonía', 'Insular']

const DIFICULTADES = ['baja', 'media', 'alta']

function parseList(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map((s) => String(s)) : []
  } catch {
    return []
  }
}

interface RecorridoFormProps {
  initialData?: any
}

export function RecorridoForm({ initialData }: RecorridoFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    slug: initialData?.slug || '',
    descripcionCorta: initialData?.descripcionCorta || '',
    descripcion: initialData?.descripcion || '',
    precio: initialData?.precio ? String(initialData.precio) : '',
    precioOriginal: initialData?.precioOriginal ? String(initialData.precioOriginal) : '',
    region: initialData?.region || REGIONES_TURISMO[0] || '',
    municipio: initialData?.municipio || '',
    vereda: initialData?.vereda || '',
    duracion: initialData?.duracion || '',
    dificultad: initialData?.dificultad || 'media',
    capacidad: initialData?.capacidad ? String(initialData.capacidad) : '',
    destacado: initialData?.destacado || false,
    activo: initialData?.activo ?? true,
  })

  const [images, setImages] = useState<UploadedImage[]>(
    (initialData?.imagenes?.length
      ? initialData.imagenes
      : initialData?.imagen
        ? [{ url: initialData.imagen }]
        : []
    ).map((img: any, i: number) => ({
      url: img.url,
      alt: img.alt || '',
      position: i,
    }))
  )

  const [incluye, setIncluye] = useState(parseList(initialData?.incluye ?? null).join('\n'))
  const [noIncluye, setNoIncluye] = useState(parseList(initialData?.noIncluye ?? null).join('\n'))
  const [itinerario, setItinerario] = useState(parseList(initialData?.itinerario ?? null).join('\n'))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'nombre' && !isEditing) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle = (name: 'destacado' | 'activo') => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  // Sube a Cloudinary solo las imágenes pendientes (sin URL real)
  const uploadPendingImages = async (imgs: UploadedImage[]): Promise<UploadedImage[]> => {
    const uploaded: UploadedImage[] = []
    for (const img of imgs) {
      if (img.file) {
        const fd = new FormData()
        fd.append('file', img.file)
        fd.append('type', 'feature')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Error subiendo imagen: ${img.file.name}`)
        }
        uploaded.push({ url: data.url, alt: img.alt, position: img.position })
      } else {
        uploaded.push({ url: img.url, alt: img.alt, position: img.position })
      }
    }
    return uploaded
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const toArray = (text: string) =>
      text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

    try {
      const finalImages = await uploadPendingImages(images)
      const imagenUrls = finalImages.map((img) => img.url).filter(Boolean)
      const payload = {
        ...formData,
        incluye: toArray(incluye),
        noIncluye: toArray(noIncluye),
        itinerario: toArray(itinerario),
        imagen: imagenUrls[0] || '',
        imagenUrls,
      }

      if (isEditing) {
        const result = await actualizarRecorrido(initialData.id, payload)
        if (result.success) {
          router.push('/admin/turismo')
          router.refresh()
          return
        }
        setError(result.error || 'Error al actualizar el recorrido')
      } else {
        const result = await crearRecorrido(payload)
        if (result.success) {
          router.push('/admin/turismo')
          router.refresh()
          return
        }
        setError(result.error || 'Error al crear el recorrido')
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-default)',
    background: 'var(--color-bg-primary)',
    fontFamily: 'var(--font-secondary)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-ink-primary)',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '800px' }}>
      {error && <div style={{ color: 'var(--terra-500)', padding: '1rem', background: 'var(--terra-50)', borderRadius: 'var(--radius-md)' }}>{error}</div>}

      {/* Datos básicos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input label="Nombre del recorrido" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Ruta del Café Tico" />
        <Input label="Slug (URL)" name="slug" value={formData.slug} onChange={handleChange} required />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Descripción corta</label>
        <textarea name="descripcionCorta" value={formData.descripcionCorta} onChange={handleChange} required rows={2} maxLength={140} style={textareaStyle} placeholder="Frase corta para la tarjeta (máx 140 caracteres)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Descripción completa</label>
        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required rows={5} style={textareaStyle} />
      </div>

      {/* Precios */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input label="Precio (COP, en pesos)" name="precio" type="number" min="0" value={formData.precio} onChange={handleChange} required hint="Ej: 185000" />
        <Input label="Precio anterior (COP, opcional)" name="precioOriginal" type="number" min="0" value={formData.precioOriginal} onChange={handleChange} hint="Se muestra tachado si es mayor al precio." />
      </div>

      {/* Ubicación */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Región</label>
        <Select
          options={REGIONES_TURISMO.map((r) => ({ label: r, value: r }))}
          value={formData.region}
          onChange={(val) => handleSelectChange('region', val)}
          aria-label="Región"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
        <Input label="Municipio" name="municipio" value={formData.municipio} onChange={handleChange} required placeholder="Ej: Pereira" />
        <Input label="Vereda (opcional)" name="vereda" value={formData.vereda} onChange={handleChange} placeholder="Ej: El Placer" />
        <Input label="Duración" name="duracion" value={formData.duracion} onChange={handleChange} placeholder="Ej: 5 horas" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Dificultad</label>
          <Select
            options={DIFICULTADES.map((d) => ({ label: d.charAt(0).toUpperCase() + d.slice(1), value: d }))}
            value={formData.dificultad}
            onChange={(val) => handleSelectChange('dificultad', val)}
            aria-label="Dificultad"
          />
        </div>
        <Input label="Capacidad (personas, opcional)" name="capacidad" type="number" min="0" value={formData.capacidad} onChange={handleChange} />
      </div>

      {/* Galería */}
      <div style={{
        padding: 'var(--space-5)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-default)',
      }}>
        <ImageUploader
          images={images}
          onChange={setImages}
          type="feature"
          maxImages={10}
          label="📸 Imágenes del recorrido (la primera es la principal)"
        />
      </div>

      {/* Listas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>¿Qué incluye? (uno por línea)</label>
          <textarea value={incluye} onChange={(e) => setIncluye(e.target.value)} rows={4} style={textareaStyle} placeholder={'Transporte desde Pereira\nGuía local\nAlmuerzo campesino'} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>¿Qué NO incluye? (uno por línea)</label>
          <textarea value={noIncluye} onChange={(e) => setNoIncluye(e.target.value)} rows={3} style={textareaStyle} placeholder={'Hidratación extra\nRecuerdos'} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Itinerario (un paso por línea)</label>
          <textarea value={itinerario} onChange={(e) => setItinerario(e.target.value)} rows={5} style={textareaStyle} placeholder={'08:00 Salida desde Pereira\n09:00 Caminata por cafetales\n11:00 Cosecha y beneficio'} />
        </div>
      </div>

      {/* Flags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
          <input type="checkbox" checked={formData.destacado} onChange={() => handleToggle('destacado')} />
          Destacado (aparece primero y con insignia)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
          <input type="checkbox" checked={formData.activo} onChange={() => handleToggle('activo')} />
          Activo (visible en el sitio)
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          {isEditing ? 'Guardar Cambios' : 'Crear Recorrido'}
        </Button>
      </div>
    </form>
  )
}
