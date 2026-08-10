// Scratch script: verificar estructura de las tablas de turismo en producción.
// Uso: setear PRODUCTION_DATABASE_URL (o .env.production.local) y ejecutar
//   node scratch/verify-turismo.js
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

// Reemplaza BigInt por String para que JSON.stringify no falle.
function replacer(_key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

const prisma = new PrismaClient({
  datasources: { db: { url: loadDbUrl() } },
});

async function main() {
  try {
    const cols = await prisma.$queryRawUnsafe(
      "SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('recorridos_turisticos','recorridos_imagenes') ORDER BY TABLE_NAME, ORDINAL_POSITION"
    );
    console.log('=== COLUMNAS ===');
    console.log(JSON.stringify(cols, replacer, 2));

    const idx = await prisma.$queryRawUnsafe(
      "SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('recorridos_turisticos','recorridos_imagenes') GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE ORDER BY TABLE_NAME"
    );
    console.log('=== ÍNDICES ===');
    console.log(JSON.stringify(idx, replacer, 2));

    const fks = await prisma.$queryRawUnsafe(
      "SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('recorridos_turisticos','recorridos_imagenes') AND REFERENCED_TABLE_NAME IS NOT NULL"
    );
    console.log('=== FK ===');
    console.log(JSON.stringify(fks, replacer, 2));
  } catch (err) {
    console.error('ERROR:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();

