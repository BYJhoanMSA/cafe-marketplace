'use client'

// src/components/admin/OrderStatusSelector.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { updateOrderStatus } from '@/server/actions/admin/order.actions'

interface OrderStatusSelectorProps {
  orderId: string
  currentStatus: string
  currentTrackingNumber?: string | null
  currentCarrier?: string | null
}

export function OrderStatusSelector({
  orderId,
  currentStatus,
  currentTrackingNumber = '',
  currentCarrier = '',
}: OrderStatusSelectorProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || '')
  const [shippingCarrier, setShippingCarrier] = useState(currentCarrier || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await updateOrderStatus(orderId, {
        status,
        trackingNumber,
        shippingCarrier,
      })

      if (result.success) {
        setMessage({ type: 'success', text: 'Estado actualizado correctamente' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al actualizar' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error inesperado' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--color-bg-primary)',
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      <h3 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)' }}>
        Actualizar Estado del Pedido
      </h3>

      {message && (
        <div
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            backgroundColor: message.type === 'success' ? 'var(--forest-100)' : 'var(--terra-100)',
            color: message.type === 'success' ? 'var(--forest-700)' : 'var(--terra-700)',
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Estado Logístico</label>
        <Select
          options={[
            { label: 'Pendiente', value: 'pending' },
            { label: 'Pago Pendiente', value: 'payment_pending' },
            { label: 'Pagado', value: 'paid' },
            { label: 'En Preparación (Processing)', value: 'processing' },
            { label: 'Enviado (Shipped)', value: 'shipped' },
            { label: 'Entregado (Delivered)', value: 'delivered' },
            { label: 'Cancelado (Cancelled)', value: 'cancelled' },
          ]}
          value={status}
          onChange={(val) => setStatus(val)}
        />
      </div>

      {(status === 'shipped' || status === 'delivered') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <Input
            label="Transportadora / Carrier"
            value={shippingCarrier}
            onChange={(e) => setShippingCarrier(e.target.value)}
            placeholder="Ej: DHL, Servientrega"
          />
          <Input
            label="Número de Guía / Tracking #"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Ej: 987654321"
          />
        </div>
      )}

      <Button type="submit" isLoading={loading} style={{ marginTop: 'var(--space-2)' }}>
        Guardar Cambios
      </Button>
    </form>
  )
}
