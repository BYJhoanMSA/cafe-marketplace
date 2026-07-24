// src/lib/stripe.ts
// Cliente de Stripe — SOLO importar en Server Components y API Routes.

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

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
