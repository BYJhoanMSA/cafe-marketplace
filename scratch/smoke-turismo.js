// scratch/smoke-turismo.js
// Smoke test de las consultas públicas de turismo contra producción.
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

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })

function parseJsonArray(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

async function main() {
  // getRecorridos (activo && !deletedAt)
  const recorridos = await prisma.recorridoTuristico.findMany({
    where: { activo: true, deletedAt: null },
    orderBy: [{ destacado: 'desc' }, { createdAt: 'desc' }],
  })
  console.log(`\n[getRecorridos] → ${recorridos.length} recorridos activos:\n`)
  for (const r of recorridos) {
    console.log(`  • ${r.nombre}`)
    console.log(`    slug: ${r.slug} | región: ${r.region} | municipio: ${r.municipio} | dificultad: ${r.dificultad}`)
    console.log(`    precio: ${r.precio} pesos → $${r.precio.toLocaleString('es-CO')} (original: ${r.precioOriginal ? '$' + r.precioOriginal.toLocaleString('es-CO') : '—'})`)
    console.log(`    destacado: ${r.destacado} | activo: ${r.activo} | imagen: ${r.imagen}`)
    console.log('')
  }

  // getRecorridoBySlug para el destacado
  const destacado = recorridos.find((r) => r.destacado) || recorridos[0]
  if (destacado) {
    const detalle = await prisma.recorridoTuristico.findFirst({
      where: { slug: destacado.slug, activo: true, deletedAt: null },
      include: { imagenes: { orderBy: { orden: 'asc' } } },
    })
    console.log(`\n[getRecorridoBySlug '${detalle.slug}']`)
    console.log(`  incluye (${parseJsonArray(detalle.incluye).length}): ${parseJsonArray(detalle.incluye).join(' | ')}`)
    console.log(`  noIncluye (${parseJsonArray(detalle.noIncluye).length}): ${parseJsonArray(detalle.noIncluye).join(' | ')}`)
    console.log(`  itinerario (${parseJsonArray(detalle.itinerario).length} pasos)`)
    console.log(`  imágenes galería: ${detalle.imagenes.length}`)
  }

  // getRegiones / getMunicipios
  const regiones = await prisma.recorridoTuristico.groupBy({
    by: ['region'],
    where: { activo: true, deletedAt: null },
    _count: { _all: true },
    orderBy: { region: 'asc' },
  })
  console.log('\n[getRegiones]')
  for (const g of regiones) console.log(`  ${g.region}: ${g._count._all}`)

  const municipios = await prisma.recorridoTuristico.groupBy({
    by: ['municipio'],
    where: { activo: true, deletedAt: null, region: 'Andina' },
    _count: { _all: true },
  })
  console.log('\n[getMunicipios(Andina)]')
  for (const g of municipios) console.log(`  ${g.municipio}: ${g._count._all}`)

  console.log('\n✅ Smoke test completado.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
