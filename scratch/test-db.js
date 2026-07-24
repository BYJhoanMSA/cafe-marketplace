const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://u882052138_dkar:Emperadorjaguar312@82.197.82.176:3306/u882052138_mcoffe?connect_timeout=30&sslmode=prefer"
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
