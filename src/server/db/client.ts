// src/server/db/client.ts
// =============================================================================
// Singleton del cliente Prisma
// =============================================================================
// En desarrollo, Next.js hace Hot Module Replacement que crea nuevas instancias
// del módulo. Sin este patrón de singleton, cada recarga crearía una conexión
// nueva a la base de datos, agotando el pool rápidamente.
// En producción, el módulo se instancia una sola vez, por lo que no hay riesgo.
// =============================================================================

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
