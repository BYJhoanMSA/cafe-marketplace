// scripts/migrate-add-product-owner.cjs
// =============================================================================
// Aplica la migración multiusuario: agrega `createdById` a products y
// asigna el propietario de los productos existentes.
//
// Fuente de propiedad:
//   1. Vendor.userId del producto (owner real actual).
//   2. Fallback → primer usuario con rol 'admin' (Administrador General).
//
// La migración es idempotente: si la columna ya existe no hace nada.
//
// Credenciales: se leen de PRODUCTION_DATABASE_URL (env) o de la variable
// DATABASE_URL de .env.production.local (archivo NO versionado).
// Este script NO contiene claves hardcodeadas.
//
// Uso:
//   node scripts/migrate-add-product-owner.cjs
//   PRODUCTION_DATABASE_URL="mysql://..." node scripts/migrate-add-product-owner.cjs
// =============================================================================

const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

// NOTA: @prisma/client carga .env al importarse y puede sobrescribir
// process.env.DATABASE_URL con la URL local. Por eso fijamos la URL de
// producción DESPUÉS del import y ANTES de instanciar el cliente.
function loadProductionUrl() {
  if (process.env.PRODUCTION_DATABASE_URL) {
    return process.env.PRODUCTION_DATABASE_URL
  }

  // Leer la URL real desde .env.production.local (gitignored)
  const envPath = path.join(__dirname, '..', '.env.production.local')
  try {
    const content = fs.readFileSync(envPath, 'utf8')
    const match = content.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)/m)
    if (match && match[1]) return match[1].trim()
  } catch {}

  return process.env.DATABASE_URL
}

const url = loadProductionUrl()
if (!url) {
  console.error('❌ No se encontró la URL de producción. Define PRODUCTION_DATABASE_URL o DATABASE_URL en .env.production.local')
  process.exit(1)
}

process.env.DATABASE_URL = url

const prisma = new PrismaClient()

const COLUMN_EXISTS_SQL = `
  SELECT COUNT(*) AS total
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'createdById'
`

async function run() {
  try {
    const [exists] = await prisma.$queryRawUnsafe(COLUMN_EXISTS_SQL)

    if (Number(exists.total) > 0) {
      console.log('✔ Columna createdById ya existe. Migración no requerida.')
      const orphans = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) AS total FROM products WHERE createdById IS NULL`
      )
      console.log(`Productos sin propietario: ${orphans[0].total}`)
      return
    }

    console.log('▶ Agregando columna createdById (nullable)...')
    await prisma.$executeRawUnsafe(
      `ALTER TABLE products ADD COLUMN createdById VARCHAR(36) NULL`
    )

    console.log('▶ Backfill desde vendor.userId...')
    const backfill = await prisma.$executeRawUnsafe(
      `UPDATE products p
         JOIN vendors v ON p.vendorId = v.id
        SET p.createdById = v.userId
       WHERE p.createdById IS NULL`
    )
    console.log(`Productos asignados por vendor: ${backfill}`)

    console.log('▶ Fallback a Administrador General...')
    const fallback = await prisma.$executeRawUnsafe(
      `UPDATE products
          SET createdById = (
            SELECT id FROM (
              SELECT id FROM users WHERE role = 'admin' ORDER BY createdAt ASC LIMIT 1
            ) t
          )
        WHERE createdById IS NULL`
    )
    console.log(`Productos asignados al admin (fallback): ${fallback}`)

    const unassigned = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) AS total FROM products WHERE createdById IS NULL`
    )
    if (Number(unassigned[0].total) > 0) {
      throw new Error(
        `Quedan ${unassigned[0].total} productos sin propietario y no existe ningún admin. Cancelo la migración.`
      )
    }

    console.log('▶ Creando índice...')
    await prisma.$executeRawUnsafe(
      `CREATE INDEX products_createdById_idx ON products(createdById)`
    )

    console.log('▶ Creando FK hacia users (ON DELETE RESTRICT)...')
    await prisma.$executeRawUnsafe(
      `ALTER TABLE products ADD CONSTRAINT products_createdById_fkey
         FOREIGN KEY (createdById) REFERENCES users(id)
         ON UPDATE CASCADE ON DELETE RESTRICT`
    )

    console.log('▶ Haciendo createdById NOT NULL...')
    await prisma.$executeRawUnsafe(
      `ALTER TABLE products MODIFY createdById VARCHAR(36) NOT NULL`
    )

    console.log('✅ Migración completada correctamente.')
  } catch (error) {
    console.error('❌ Error en migración:', error.message)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

run()
