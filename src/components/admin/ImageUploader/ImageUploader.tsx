'use client'

// src/components/admin/ImageUploader/ImageUploader.tsx
// Componente de subida de imágenes con:
// - Drag & Drop
// - Vista previa antes de subir
// - Optimización automática en servidor (sharp → WebP)
// - Indicador de ahorro de espacio
// - Reordenamiento por arrastre
// - Eliminación individual

import { useState, useRef, useCallback, type ReactNode } from 'react'
import { UploadSimple, X, Image, SpinnerGap, DotsSixVertical, Star, Warning } from '@phosphor-icons/react'
import styles from './ImageUploader.module.css'

export interface UploadedImage {
  url: string
  alt: string
  width?: number
  height?: number
  position: number
}

interface ImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  type?: 'product' | 'hero' | 'feature'
  maxImages?: number
  label?: ReactNode
}

export function ImageUploader({
  images,
  onChange,
  type = 'product',
  maxImages = 8,
  label = 'Imágenes del producto',
}: ImageUploaderProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [uploading, setUploading] = useState<string[]>([]) // nombres de archivos subiendo
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File): Promise<UploadedImage | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrors(prev => [...prev, data.error || 'Error subiendo imagen'])
        return null
      }

      return {
        url: data.url,
        alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        width: data.width,
        height: data.height,
        position: 0,
      }
    } catch {
      setErrors(prev => [...prev, `Error subiendo ${file.name}`])
      return null
    }
  }, [type])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const remaining = maxImages - images.length

    if (remaining <= 0) {
      setErrors([`Máximo ${maxImages} imágenes permitidas`])
      return
    }

    const toUpload = fileArray.slice(0, remaining)
    setErrors([])
    setUploading(toUpload.map(f => f.name))

    const results = await Promise.all(toUpload.map(uploadFile))
    const successful = results.filter(Boolean) as UploadedImage[]

    const newImages = [...images, ...successful].map((img, i) => ({
      ...img,
      position: i,
    }))
    onChange(newImages)
    setUploading([])
  }, [images, maxImages, onChange, uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleRemove = useCallback(async (index: number) => {
    const img = images[index]
    if (!img) return
    // Borrar del servidor si es un upload local
    if (img.url.startsWith('/uploads/')) {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: img.url }),
      })
    }
    const updated = images.filter((_, i) => i !== index).map((img, i) => ({ ...img, position: i }))
    onChange(updated)
  }, [images, onChange])

  const handleSetPrimary = useCallback((index: number) => {
    if (index === 0) return
    const updated = [...images]
    const [item] = updated.splice(index, 1)
    if (item) {
      updated.unshift(item)
      onChange(updated.map((img, i) => ({ ...img, position: i })))
    }
  }, [images, onChange])

  const handleAltChange = useCallback((index: number, value: string) => {
    const updated = images.map((img, i) => i === index ? { ...img, alt: value } : img)
    onChange(updated)
  }, [images, onChange])

  return (
    <div className={styles.wrapper}>
      <label className={styles.sectionLabel}>{label}</label>

      {/* Zona de arrastre */}
      {images.length < maxImages && (
        <div
          className={`${styles.dropzone} ${isDraggingOver ? styles.dragActive : ''} ${uploading.length > 0 ? styles.uploading : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className={styles.hiddenInput}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          {uploading.length > 0 ? (
            <div className={styles.uploadingIndicator}>
              <SpinnerGap size={28} className={styles.spin} />
              <span>Optimizando y subiendo {uploading.length} imagen{uploading.length > 1 ? 'es' : ''}...</span>
            </div>
          ) : (
            <>
              <UploadSimple size={32} className={styles.uploadIcon} />
              <div className={styles.dropzoneText}>
                <strong>Arrastra imágenes aquí</strong>
                <span>o haz clic para seleccionar</span>
                <span className={styles.hint}>JPG, PNG o WebP · Máx 10MB · Se optimizarán automáticamente a WebP</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <div className={styles.errorList}>
          {errors.map((err, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Warning size={14} weight="bold" /> {err}</span>
          ))}
        </div>
      )}

      {/* Grid de imágenes subidas */}
      {images.length > 0 && (
        <div className={styles.imageGrid}>
          {images.map((img, index) => (
            <div key={img.url} className={`${styles.imageCard} ${index === 0 ? styles.primary : ''}`}>
              <div className={styles.imagePreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className={styles.previewImg} />
                {index === 0 && (
                  <span className={styles.primaryBadge}>
                    <Star size={10} fill="currentColor" /> Principal
                  </span>
                )}
              </div>

              <div className={styles.imageActions}>
                <input
                  type="text"
                  value={img.alt}
                  onChange={(e) => handleAltChange(index, e.target.value)}
                  placeholder="Texto alternativo..."
                  className={styles.altInput}
                />
                <div className={styles.actionButtons}>
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      className={styles.btnSecondary}
                      title="Establecer como imagen principal"
                    >
                      <Star size={14} /> Principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className={styles.btnRemove}
                    title="Eliminar imagen"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && uploading.length === 0 && (
        <div className={styles.emptyState}>
          <Image size={36} className={styles.emptyIcon} />
          <span>Sin imágenes aún</span>
        </div>
      )}

      <p className={styles.footerHint}>
        {images.length}/{maxImages} imágenes · La primera imagen es la principal del producto
      </p>
    </div>
  )
}
