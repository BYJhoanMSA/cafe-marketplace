// src/app/api/cron/cleanup-carts/route.ts
// Limpieza de carritos abandonados — ejecutado por Hostinger Cron Jobs
// Configurar en hPanel → Cron Jobs: 0 3 * * * (diario a las 3am)
// URL: https://tudominio.com/api/cron/cleanup-carts
// Headers: Authorization: Bearer {CRON_SECRET}

import { NextRequest } from 'next/server'
import { prisma } from '@/server/db/client'
import { requireCronSecret } from '@/server/middleware/auth.middleware'

export async function GET(request: NextRequest) {
  try {
    requireCronSecret(request)
  } catch {
    return new Response('No autorizado', { status: 401 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    const result = await prisma.cart.updateMany({
      where: {
        status: 'active',
        updatedAt: { lt: thirtyDaysAgo },
      },
      data: { status: 'abandoned' },
    })

    console.log(`[Cron] Carritos marcados como abandonados: ${result.count}`)

    return Response.json({
      success: true,
      message: `${result.count} carritos marcados como abandonados`,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[Cron] Error en cleanup-carts:', err)
    return Response.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
