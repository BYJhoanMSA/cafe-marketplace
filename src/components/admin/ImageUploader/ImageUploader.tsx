'use client'

// src/components/admin/ImageUploader/ImageUploader.tsx
// Componente de selección de imágenes con:
// - Drag & Drop
// - Vista previa local (blob) ANTES de subir
// - La subida real (optimización + Cloudinary) ocurre al enviar el formulario
// - Reordenamiento por arrastre
// - Eliminación individual

import { useState, useRef, useCallback } from 'react'
import { Upload, X, ImageIcon, GripVertical, Star } from 'lucide-react'
import styles from './ImageUploader.module.css'

export interface UploadedImage {
  url: string
  alt: string
  width?: number
  height?: number
  position: number
  file?: File
}

interface ImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  type?: 'product' | 'hero' | 'feature'
  maxImages?: number
  label?: string
}

export function ImageUploader({
  images,
  onChange,
  type = 'product',
  maxImages = 8,
  label = 'Imágenes del producto',
}: ImageUploaderProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const remaining = maxImages - images.length

    if (remaining <= 0) {
      setErrors([`Máximo ${maxImages} imágenes permitidas`])
      return
    }

    const toAdd = fileArray.slice(0, remaining)
    setErrors([])

    const newEntries: UploadedImage[] = toAdd.map((file) => ({
      url: URL.createObjectURL(file),
      alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      file,
      position: 0,
    }))

    const newImages = [...images, ...newEntries].map((img, i) => ({
      ...img,
      position: i,
    }))
    onChange(newImages)
  }, [images, maxImages, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleRemove = useCallback(async (index: number) => {
    const img = images[index]
    if (!img) return

    if (img.url.startsWith('blob:')) {
      // Imagen pendiente de subir: solo se revoca la vista previa local
      URL.revokeObjectURL(img.url)
    } else {
      // Imagen ya publicada: intentar eliminarla del almacenamiento
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: img.url }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch {
        // Silencioso: la imagen se quita del estado aunque el DELETE falle
      }
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
          className={`${styles.dropzone} ${isDraggingOver ? styles.dragActive : ''}`}
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
          <Upload size={32} className={styles.uploadIcon} />
          <div className={styles.dropzoneText}>
            <strong>Arrastra imágenes aquí</strong>
            <span>o haz clic para seleccionar</span>
            <span className={styles.hint}>JPG, PNG o WebP · Máx 10MB · Se subirán a Cloudinary al guardar</span>
          </div>
        </div>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <div className={styles.errorList}>
          {errors.map((err, i) => (
            <span key={i}>⚠️ {err}</span>
          ))}
        </div>
      )}

      {/* Grid de imágenes */}
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
                {img.file && (
                  <span className={styles.pendingBadge}>
                    Pendiente
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

      {images.length === 0 && (
        <div className={styles.emptyState}>
          <ImageIcon size={36} className={styles.emptyIcon} />
          <span>Sin imágenes aún</span>
        </div>
      )}

      <p className={styles.footerHint}>
        {images.length}/{maxImages} imágenes · La primera imagen es la principal del producto
      </p>
    </div>
  )
}
