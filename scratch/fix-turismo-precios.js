// scratch/fix-turismo-precios.js
// Corrige precios de recorridos en producción.
// Los precios de turismo se almacenan en PESOS (sin centavos): 185000 = $185.000.
// Detecta valores en "centavos" (>= 1.000.000, el doble de cualquier precio realista)
// y los divide entre 100.
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.production.local')
const content = fs.readFileSync(envPath, 'utf8')
const match = content.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)/m)
const dbUrl =
  process.env.PRODUCTION_DATABASE_URL ||
  (match ? match[1].trim() : undefined) ||
  process.env.DATABASE_URL

if (!dbUrl) {
  console.error('No se encontró DATABASE_URL')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })

async function main() {
  const recorridos = await prisma.recorridoTuristico.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true, precio: true, precioOriginal: true },
  })

  for (const r of recorridos) {
    // Parecen "centavos" si el precio supera 1.000.000 (en pesos sería imposible para un recorrido)
    const needsFix = r.precio >= 1000000
    if (!needsFix) continue

    await prisma.recorridoTuristico.update({
      where: { id: r.id },
      data: {
        precio: Math.round(r.precio / 100),
        precioOriginal: r.precioOriginal !== null ? Math.round(r.precioOriginal / 100) : null,
      },
    })
    console.log(`→ ${r.slug}: ${r.precio} → ${Math.round(r.precio / 100)}`)
  }

  console.log('✅ Precios de recorridos corregidos a pesos.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
