import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with initial Admin ("dkar") and essential data...')

  // 1. Crear el usuario Administrador único "dkar"
  const adminEmail = 'dkar@cafemarketplace.com'
  const hashedPassword = await bcrypt.hash('jaguar312', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'admin',
      firstName: 'dkar',
      lastName: 'Admin',
    },
    create: {
      email: adminEmail,
      firstName: 'dkar',
      lastName: 'Admin',
      passwordHash: hashedPassword,
      role: 'admin',
      status: 'active',
    },
  })

  console.log(`✅ Admin "dkar" creado / verificado: ${adminUser.email}`)

  // 2. Crear la Marca / Vendor principal administrada por dkar
  const vendor = await prisma.vendor.upsert({
    where: { slug: 'dkar-coffee' },
    update: {
      userId: adminUser.id,
      storeName: 'DKAR Specialty Coffee',
    },
    create: {
      userId: adminUser.id,
      storeName: 'DKAR Specialty Coffee',
      slug: 'dkar-coffee',
      shortDescription: 'Tostaduría artesanal y selección exclusiva de cafés de especialidad.',
      country: 'CO',
      city: 'Bogotá',
      status: 'active',
    },
  })

  console.log(`✅ Marca principal creada: ${vendor.storeName}`)

  // 3. Crear Categorías: Orgánico vs Convencional
  const categoryOrganico = await prisma.category.upsert({
    where: { slug: 'cafe-organico' },
    update: {},
    create: {
      name: 'Café Orgánico',
      slug: 'cafe-organico',
      description: 'Cultivado sin pesticidas ni fertilizantes químicos sintéticos. Libre de químicos.',
    },
  })

  const categoryConvencional = await prisma.category.upsert({
    where: { slug: 'cafe-convencional' },
    update: {},
    create: {
      name: 'Café Convencional',
      slug: 'cafe-convencional',
      description: 'Cultivado con métodos tradicionales que pueden incluir el uso controlado de fertilizantes y pesticidas.',
    },
  })

  // 4. Crear Orígenes iniciales
  const originColombia = await prisma.origin.upsert({
    where: { slug: 'colombia' },
    update: {},
    create: {
      country: 'Colombia',
      countryCode: 'CO',
      region: 'Huila',
      slug: 'colombia',
      description: 'Granos cosechados a altas altitudes en la región del Huila.',
    },
  })

  // 5. Crear opciones de variantes (tamaños y moliendas) en StoreSettings
  const variantSizes = [
    { label: '125 Gramos', value: '125g', grams: 125 },
    { label: '250 Gramos', value: '250g', grams: 250 },
    { label: '1 Libra', value: '1lb', grams: 454 },
    { label: '5 Libras', value: '5lb', grams: 2270 },
  ]

  const grindTypes = [
    { label: 'En Grano', value: 'whole-bean' },
    { label: 'Molido (Expresso)', value: 'espresso' },
    { label: 'Molido (Filtro)', value: 'filter' },
    { label: 'Molido (Prensa Francesa)', value: 'french-press' },
  ]

  await prisma.storeSettings.upsert({
    where: { key: 'variant_sizes' },
    update: { value: JSON.stringify(variantSizes) },
    create: {
      key: 'variant_sizes',
      value: JSON.stringify(variantSizes),
      group: 'variants',
    },
  })

  await prisma.storeSettings.upsert({
    where: { key: 'grind_types' },
    update: { value: JSON.stringify(grindTypes) },
    create: {
      key: 'grind_types',
      value: JSON.stringify(grindTypes),
      group: 'variants',
    },
  })

  console.log('✅ Opciones de variantes (tamaños y moliendas) creadas.')

  console.log('✨ Seed completado exitosamente.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error ejecutando seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
