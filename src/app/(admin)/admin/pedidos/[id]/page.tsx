// src/app/(admin)/admin/pedidos/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, User } from 'lucide-react'
import { getAdminOrderById } from '@/server/actions/admin/order.actions'
import { OrderStatusSelector } from '@/components/admin/OrderStatusSelector'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatRelativeDate } from '@/lib/utils'

export const metadata = {
  title: 'Detalle de Pedido | Panel Admin',
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await getAdminOrderById(id)

  if (!order) {
    notFound()
  }

  let shippingAddrObj: any = {}
  try {
    if (order.shippingAddress) {
      shippingAddrObj = JSON.parse(order.shippingAddress)
    }
  } catch (e) {
    shippingAddrObj = {}
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <Link 
          href="/admin/pedidos" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-ink-secondary)',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <ArrowLeft size={16} />
          Volver a pedidos
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
              Pedido #{order.displayId}
            </h1>
            <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)' }}>
              Realizado el {formatRelativeDate(order.createdAt)}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
              Pago: {order.paymentStatus}
            </Badge>
            <Badge variant={order.status === 'delivered' ? 'success' : 'forest'}>
              Envío: {order.status}
            </Badge>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Columna Izquierda: LineItems y Resumen Financiero */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Productos */}
          <div style={{ 
            backgroundColor: 'var(--color-bg-primary)', 
            border: '1px solid var(--color-border-default)', 
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Package size={20} /> Productos Comprados ({order.lineItems.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {order.lineItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--space-4)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{item.productTitle}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                      Variante: {item.variantTitle} | Cantidad: {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {formatPrice(item.totalInCents, order.currency)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ink-secondary)' }}>
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotalInCents, order.currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ink-secondary)' }}>
                <span>Envío:</span>
                <span>{formatPrice(order.shippingInCents, order.currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)', borderTop: '1px solid var(--color-border-default)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <span>Total:</span>
                <span>{formatPrice(order.totalInCents, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Selector de Estado Logístico */}
          <OrderStatusSelector
            orderId={order.id}
            currentStatus={order.status}
            currentTrackingNumber={order.trackingNumber}
            currentCarrier={order.shippingCarrier}
          />
        </div>

        {/* Columna Derecha: Datos de Cliente y Envío */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Cliente */}
          <div style={{ 
            backgroundColor: 'var(--color-bg-primary)', 
            border: '1px solid var(--color-border-default)', 
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-3)', fontSize: 'var(--text-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <User size={18} /> Cliente
            </h3>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              {order.customerFirstName} {order.customerLastName}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
              {order.customerEmail}
            </div>
            {order.customerPhone && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginTop: 'var(--space-1)' }}>
                Tel: {order.customerPhone}
              </div>
            )}
          </div>

          {/* Dirección de Envío */}
          <div style={{ 
            backgroundColor: 'var(--color-bg-primary)', 
            border: '1px solid var(--color-border-default)', 
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 'var(--space-3)', fontSize: 'var(--text-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Truck size={18} /> Dirección de Entrega
            </h3>

            {shippingAddrObj.address1 ? (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>{shippingAddrObj.firstName} {shippingAddrObj.lastName}</div>
                <div>{shippingAddrObj.address1} {shippingAddrObj.address2}</div>
                <div>{shippingAddrObj.city}, {shippingAddrObj.state}</div>
                <div>{shippingAddrObj.postalCode}, {shippingAddrObj.country}</div>
              </div>
            ) : (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-tertiary)' }}>
                No se registró dirección snapshot detallada.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
