// Scratch script: aplicar migración puntual (ADD COLUMN) a la DB de producción
// sin reconciliar el esquema completo (evita errores de índices/constraints).
// Uso: setear PRODUCTION_DATABASE_URL y ejecutar `node scratch/run-migration.js`
const { PrismaClient } = require('@prisma/client');

const fs = require('fs');
const path = require('path');

function loadDbUrl() {
  if (process.env.PRODUCTION_DATABASE_URL) return process.env.PRODUCTION_DATABASE_URL;
  const envPath = path.join(__dirname, '..', '.env.production.local');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)/m);
    if (match && match[1]) return match[1].trim();
  } catch {}
  return process.env.DATABASE_URL;
}

const prisma = new PrismaClient({
  datasources: { db: { url: loadDbUrl() } },
});

const STATEMENTS = [
  "SELECT 1",
];

async function columnExists(column) {
  const res = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = ?",
    column
  );
  return res[0] && res[0].n > 0;
}

async function main() {
  try {
    for (const col of ['favoritesCount', 'sharesCount']) {
      const exists = await columnExists(col);
      console.log(`${col} ya existe?`, exists);
      if (!exists) {
        await prisma.$executeRawUnsafe(`ALTER TABLE products ADD COLUMN ${col} INT NOT NULL DEFAULT 0`);
        console.log(`${col} creada`);
      }
    }
    console.log('Migración puntual completada.');
  } catch (err) {
    console.error('ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();