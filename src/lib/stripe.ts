// src/lib/stripe.ts
// Cliente de Stripe — SOLO importar en Server Components y API Routes.

import Stripe from 'stripe'

// Stripe se inicializa de forma perezosa: el error solo se lanza si se usa de
// verdad (pagos), nunca en el import del build. Evita que la compilación falle
// cuando STRIPE_SECRET_KEY no está definida en el entorno de build.
export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
      timeout: 15000,
    })
  : null

export async function getOrCreateStripeCustomer({
  userId,
  email,
  name,
}: {
  userId: string
  email: string
  name: string
}): Promise<string> {
  const { prisma } = await import('@/server/db/client')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  })

  if (user?.stripeCustomerId) return user.stripeCustomerId

  if (!stripe) {
    throw new Error('Stripe no configurado (falta STRIPE_SECRET_KEY)')
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}
