const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL } },
});
(async () => {
  try {
    const r = await p.$queryRawUnsafe(
      "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME IN ('favoritesCount','sharesCount')"
    );
    console.log('Columnas:', JSON.stringify(r, null, 2));
    const c = await p.$queryRawUnsafe('SELECT COUNT(*) AS total FROM products');
    console.log('Total productos:', c[0].total);
  } catch (e) {
    console.error(e.message);
  } finally {
    await p.$disconnect();
  }
})();