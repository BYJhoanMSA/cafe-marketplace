const { execSync } = require('child_process');

const dbUrl = "mysql://u882052138_dkar:Emperadorjaguar312@82.197.82.176:3306/u882052138_mcoffe?connect_timeout=60&sslmode=prefer";

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
