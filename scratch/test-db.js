const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

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
  datasources: {
    db: {
      url: loadDbUrl()
    }
  }
});

async function testConnection() {
  console.log('Testing Prisma connection to Hostinger MySQL...');
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('SUCCESS: Connected to Hostinger MySQL!', result);
  } catch (err) {
    console.error('ERROR connecting to MySQL:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
