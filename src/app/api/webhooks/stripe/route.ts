// src/app/api/webhooks/stripe/route.ts
// Webhook de Stripe — recibe eventos y actualiza pedidos en la DB
// CRÍTICO: verificar la firma del webhook para evitar fraudes

import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/server/db/client'

// Desactivar body parser de Next.js — Stripe necesita el raw body
export const config = {
  api: { bodyParser: false },
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Firma de webhook faltante', { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response('STRIPE_WEBHOOK_SECRET no configurado', { status: 500 })
  }

  if (!stripe) {
    return new Response('STRIPE_SECRET_KEY no configurado', { status: 500 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error de verificación'
    console.error('[Stripe Webhook] Firma inválida:', message)
    return new Response(`Webhook error: ${message}`, { status: 400 })
  }

  // ============================================================
  // Procesar eventos de Stripe
  // ============================================================
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        await prisma.order.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: {
            status: 'processing',
            paymentStatus: 'paid',
            paidAt: new Date(),
          },
        })
        console.log('[Stripe] Pago exitoso:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        await prisma.order.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: {
            status: 'payment_pending',
            paymentStatus: 'failed',
          },
        })
        console.log('[Stripe] Pago fallido:', paymentIntent.id)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        if (charge.payment_intent) {
          await prisma.order.updateMany({
            where: {
              stripePaymentIntentId: charge.payment_intent as string,
            },
            data: {
              status: 'refunded',
              paymentStatus: 'refunded',
            },
          })
        }
        break
      }

      default:
        // Ignorar eventos no manejados
        console.log('[Stripe] Evento no manejado:', event.type)
    }
  } catch (err) {
    console.error('[Stripe Webhook] Error procesando evento:', err)
    return new Response('Error interno al procesar el evento', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
