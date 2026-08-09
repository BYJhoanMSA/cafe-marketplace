// Scratch script: migración puntual de la tabla `reviews` en producción
// - userId  → nullable (permite reseñas anónimas)
// - guestId → columna nueva (cookie del visitante anónimo)
// - authorName → columna nueva (nombre mostrado del anónimo)
// - índice único [productId, guestId] (1 reseña por producto por anónimo)
// Uso: node scratch/run-migration-reviews.js  (lee PRODUCTION_DATABASE_URL o .env.production.local)
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

async function columnExists(table, column) {
  const res = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    table,
    column
  );
  return res[0] && res[0].n > 0;
}

async function indexExists(indexName) {
  const res = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS n FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reviews' AND INDEX_NAME = ?",
    indexName
  );
  return res[0] && res[0].n > 0;
}

async function main() {
  try {
    // 1. userId nullable
    await prisma.$executeRawUnsafe('ALTER TABLE reviews MODIFY userId VARCHAR(36) NULL');
    console.log('userId → nullable OK');

    // 2. guestId
    if (await columnExists('reviews', 'guestId')) {
      console.log('guestId ya existe');
    } else {
      await prisma.$executeRawUnsafe('ALTER TABLE reviews ADD COLUMN guestId VARCHAR(64) NULL');
      console.log('guestId creada');
    }

    // 3. authorName
    if (await columnExists('reviews', 'authorName')) {
      console.log('authorName ya existe');
    } else {
      await prisma.$executeRawUnsafe('ALTER TABLE reviews ADD COLUMN authorName VARCHAR(50) NULL');
      console.log('authorName creada');
    }

    // 4. Índice único [productId, guestId]
    if (await indexExists('reviews_productId_guestId_key')) {
      console.log('índice único [productId, guestId] ya existe');
    } else {
      await prisma.$executeRawUnsafe(
        'CREATE UNIQUE INDEX reviews_productId_guestId_key ON reviews (productId, guestId)'
      );
      console.log('índice único [productId, guestId] creado');
    }

    const rowCount = await prisma.$queryRawUnsafe('SELECT COUNT(*) AS n FROM reviews');
    console.log('Filas en reviews:', rowCount[0].n);
    console.log('Migración puntual de reviews completada.');
  } catch (err) {
    console.error('ERROR:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
