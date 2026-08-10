// Scratch script: crear las tablas del módulo Turismo en la DB de producción
// sin reconciliar el esquema completo (evita errores de índices/constraints).
//
// Idempotente: si las tablas/FK ya existen no hace nada.
// Uso: setear PRODUCTION_DATABASE_URL (o .env.production.local) y ejecutar
//   node scratch/migrate-turismo.js
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

const CREATE_RECORRIDOS = `
  CREATE TABLE IF NOT EXISTS \`recorridos_turisticos\` (
    \`id\` VARCHAR(36) NOT NULL,
    \`nombre\` VARCHAR(160) NOT NULL,
    \`slug\` VARCHAR(180) NOT NULL,
    \`descripcionCorta\` VARCHAR(140) NOT NULL,
    \`descripcion\` TEXT NOT NULL,
    \`precio\` INTEGER NOT NULL,
    \`precioOriginal\` INTEGER NULL,
    \`region\` VARCHAR(80) NOT NULL,
    \`municipio\` VARCHAR(120) NOT NULL,
    \`vereda\` VARCHAR(120) NULL,
    \`duracion\` VARCHAR(60) NULL,
    \`dificultad\` VARCHAR(20) NULL,
    \`capacidad\` INTEGER NULL,
    \`incluye\` TEXT NULL,
    \`noIncluye\` TEXT NULL,
    \`itinerario\` TEXT NULL,
    \`imagen\` VARCHAR(500) NOT NULL,
    \`destacado\` BOOLEAN NOT NULL DEFAULT false,
    \`activo\` BOOLEAN NOT NULL DEFAULT true,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    \`deletedAt\` DATETIME(3) NULL,
    UNIQUE INDEX \`recorridos_turisticos_slug_key\`(\`slug\`),
    INDEX \`recorridos_turisticos_activo_idx\`(\`activo\`),
    INDEX \`recorridos_turisticos_region_idx\`(\`region\`),
    INDEX \`recorridos_turisticos_municipio_idx\`(\`municipio\`),
    INDEX \`recorridos_turisticos_destacado_idx\`(\`destacado\`),
    INDEX \`recorridos_turisticos_deletedAt_idx\`(\`deletedAt\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
`;

const CREATE_IMAGENES = `
  CREATE TABLE IF NOT EXISTS \`recorridos_imagenes\` (
    \`id\` VARCHAR(36) NOT NULL,
    \`recorridoId\` VARCHAR(36) NOT NULL,
    \`url\` VARCHAR(500) NOT NULL,
    \`orden\` INTEGER NOT NULL DEFAULT 0,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX \`recorridos_imagenes_recorridoId_orden_idx\`(\`recorridoId\`, \`orden\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
`;

const FK_IMAGENES = `
  ALTER TABLE \`recorridos_imagenes\`
    ADD CONSTRAINT \`recorridos_imagenes_recorridoId_fkey\`
    FOREIGN KEY (\`recorridoId\`) REFERENCES \`recorridos_turisticos\`(\`id\`)
    ON DELETE CASCADE ON UPDATE CASCADE
`;

async function tableExists(table) {
  const res = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
    table
  );
  return res[0] && res[0].n > 0;
}

async function fkExists(name) {
  const res = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS n FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = ?",
    name
  );
  return res[0] && res[0].n > 0;
}

async function main() {
  try {
    console.log('Verificando tablas de turismo...');

    const hasRecorridos = await tableExists('recorridos_turisticos');
    const hasImagenes = await tableExists('recorridos_imagenes');
    console.log('recorridos_turisticos existe?', hasRecorridos);
    console.log('recorridos_imagenes existe?', hasImagenes);

    if (!hasRecorridos) {
      await prisma.$executeRawUnsafe(CREATE_RECORRIDOS);
      console.log('Tabla recorridos_turisticos creada.');
    }
    if (!hasImagenes) {
      await prisma.$executeRawUnsafe(CREATE_IMAGENES);
      console.log('Tabla recorridos_imagenes creada.');
    }

    const hasFk = await fkExists('recorridos_imagenes_recorridoId_fkey');
    console.log('FK recorridos_imagenes_recorridoId_fkey existe?', hasFk);
    if (!hasFk) {
      await prisma.$executeRawUnsafe(FK_IMAGENES);
      console.log('FK recorridos_imagenes_recorridoId_fkey creada.');
    }

    console.log('Migración de turismo completada.');
  } catch (err) {
    console.error('ERROR:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
