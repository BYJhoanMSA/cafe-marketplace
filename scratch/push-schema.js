const { execSync } = require('child_process');
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

const dbUrl = loadDbUrl();

console.log('Running prisma db push via Node script...');
try {
  const output = execSync('npx prisma db push', {
    env: { ...process.env, DATABASE_URL: dbUrl },
    encoding: 'utf-8',
    timeout: 120000
  });
  console.log('OUTPUT:', output);
} catch (err) {
  console.error('ERROR:', err.stdout || err.message);
}
