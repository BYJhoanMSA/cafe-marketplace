'use client'

// src/components/admin/RecorridoDeleteButton.tsx
// Botón de eliminar (soft delete) con confirmación.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { eliminarRecorrido } from '@/server/actions/turismo.actions'

interface RecorridoDeleteButtonProps {
  recorridoId: string
  nombre: string
}

export function RecorridoDeleteButton({ recorridoId, nombre }: RecorridoDeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar el recorrido "${nombre}"? Esta acción lo oculta del sitio.`)) return
    setLoading(true)
    try {
      const result = await eliminarRecorrido(recorridoId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Error al eliminar el recorrido')
      }
    } catch {
      alert('Error inesperado al eliminar el recorrido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      style={{ background: 'none', border: 'none', color: 'var(--terra-500)', cursor: 'pointer', padding: 'var(--space-2)' }}
      title="Eliminar recorrido"
      aria-label={`Eliminar ${nombre}`}
    >
      <Trash2 size={16} />
    </button>
  )
}
