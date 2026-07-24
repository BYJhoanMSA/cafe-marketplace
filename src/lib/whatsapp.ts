// src/lib/whatsapp.ts

export interface CartItemForWhatsApp {
  id: string
  title: string
  variantTitle?: string
  quantity: number
  priceInCents: number
  currency?: string
}

/**
 * Genera la URL de WhatsApp con el mensaje del pedido formateado.
 * @param items Lista de productos en el carrito
 * @param totalInCents Subtotal/Total en centavos
 * @param currency Moneda (USD, COP, etc.)
 * @param phoneNumber Número de WhatsApp destino (formato internacional sin +, ej: 573000000000)
 */
export function buildWhatsAppOrderUrl(
  items: CartItemForWhatsApp[],
  totalInCents: number,
  currency: string = 'USD',
  phoneNumber: string = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573008717377'
): string {
  const formattedTotal = (totalInCents / 100).toLocaleString('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'COP' ? 0 : 2,
  })

  let message = `☕ *¡Hola! Quiero realizar un pedido desde la tienda:* \n\n`
  message += `🛒 *Resumen del Pedido:*\n`

  items.forEach((item) => {
    const itemPrice = ((item.priceInCents * item.quantity) / 100).toLocaleString('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'COP' ? 0 : 2,
    })
    const variantStr = item.variantTitle ? ` (${item.variantTitle})` : ''
    message += `• ${item.quantity}x ${item.title}${variantStr} — *${itemPrice}*\n`
  })

  message += `\n💰 *Total Estimado:* ${formattedTotal}\n\n`
  message += `¿Me confirman disponibilidad y los datos para realizar el pago? ¡Gracias!`

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}
