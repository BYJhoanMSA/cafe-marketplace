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

  // =========================================================================
  // TURISMO — Recorridos turísticos de ejemplo (regiones Andina, Cafetera,
  // Caribe y Pacífico). Los sube únicamente el rol admin.
  // =========================================================================
  const recorridos = [
    {
      slug: 'ruta-del-cafe-tico',
      nombre: 'Ruta del Café Tico',
      descripcionCorta: 'Caminata por cafetales, cosecha y taza final.',
      descripcion: 'Recorrido guiado por fincas cafeteras del eje andino: recorres los cafetales, aprendes de cosecha y beneficio, y terminas con una cata guiada en pleno paisaje montañoso.',
      precio: 185000,
      precioOriginal: 220000,
      region: 'Andina',
      municipio: 'Pereira',
      vereda: 'El Placer',
      duracion: '5 horas',
      dificultad: 'media',
      capacidad: 12,
      incluye: ['Transporte desde Pereira', 'Guía local', 'Almuerzo campesino', 'Cata de café'],
      noIncluye: ['Hidratación extra', 'Recuerdos'],
      itinerario: ['08:00 Salida desde Pereira', '09:00 Caminata por cafetales', '11:00 Cosecha y beneficio', '13:00 Almuerzo campesino', '14:30 Cata guiada'],
      imagen: 'https://res.cloudinary.com/dcrsncau/image/upload/v1/turismo/ruta-cafe-tico',
      destacado: true,
      activo: true,
    },
    {
      slug: 'parque-del-cafe',
      nombre: 'Parque del Café y Granja Tradicional',
      descripcionCorta: 'Naturaleza, café y tradición cafetera para toda la familia.',
      descripcion: 'Experiencia familiar en el corazón cafetero: visita guiada al parque temático, recorrido por la granja tradicional, muestra cultural del sombrero y la guadua, y tiempo libre en el sendero ecológico.',
      precio: 145000,
      region: 'Cafetera',
      municipio: 'Quindío',
      vereda: 'La Linda',
      duracion: '8 horas',
      dificultad: 'baja',
      capacidad: 20,
      incluye: ['Entrada al parque', 'Transporte ida y vuelta', 'Guía', 'Souvenir de bienvenida'],
      noIncluye: ['Almuerzo', 'Actividades de pago adicional'],
      itinerario: ['07:00 Recogida en el hotel', '08:30 Llegada al parque', '09:00 Tour guiado', '13:00 Almuerzo libre', '16:00 Regreso'],
      imagen: 'https://res.cloudinary.com/dcrsncau/image/upload/v1/turismo/parque-cafe',
      destacado: false,
      activo: true,
    },
    {
      slug: 'avistamiento-aves-caribe',
      nombre: 'Avistamiento de Aves en el Caribe',
      descripcionCorta: 'Senderismo de aves y manglares en la costa caribeña.',
      descripcion: 'Amanecer en los humedales del Caribe colombiano: ruta de senderismo para avistamiento de especies nativas, recorrido en lancha por los manglares y desayuno típico al aire libre.',
      precio: 165000,
      precioOriginal: 190000,
      region: 'Caribe',
      municipio: 'Santa Marta',
      vereda: 'Los Naranjos',
      duracion: '6 horas',
      dificultad: 'media',
      capacidad: 10,
      incluye: ['Guía ornitológico', 'Recorrido en lancha', 'Binoculares', 'Desayuno típico'],
      noIncluye: ['Transporte desde el hotel'],
      itinerario: ['05:00 Salida del punto de encuentro', '05:45 Senderismo de aves', '09:00 Paseo en lancha', '11:00 Desayuno típico'],
      imagen: 'https://res.cloudinary.com/dcrsncau/image/upload/v1/turismo/aves-caribe',
      destacado: true,
      activo: true,
    },
    {
      slug: 'selva-pacifico',
      nombre: 'Expedición a la Selva del Pacífico',
      descripcionCorta: 'Noche en la selva húmeda del Pacífico con comunidad local.',
      descripcion: 'Expedición de dos días por la selva del Pacífico colombiano: caminata por senderos de flora endémica, intercambio cultural con la comunidad, y avistamiento de ballenas según temporada.',
      precio: 320000,
      region: 'Pacífico',
      municipio: 'Nuquí',
      vereda: 'Bahía Feliz',
      duracion: '2 días',
      dificultad: 'alta',
      capacidad: 8,
      incluye: ['Alojamiento en cabaña comunitaria', 'Alimentación completa', 'Guía experto', 'Seguro de aventura'],
      noIncluye: ['Vuelos', 'Transporte terrestre adicional'],
      itinerario: ['Día 1: Llegada y senderismo', 'Noche 1: Fogata comunitaria', 'Día 2: Playas y ballenas', 'Día 2 tarde: Regreso'],
      imagen: 'https://res.cloudinary.com/dcrsncau/image/upload/v1/turismo/selva-pacifico',
      destacado: false,
      activo: true,
    },
  ]

  for (const r of recorridos) {
    await prisma.recorridoTuristico.upsert({
      where: { slug: r.slug },
      update: {
        nombre: r.nombre,
        descripcionCorta: r.descripcionCorta,
        descripcion: r.descripcion,
        precio: r.precio,
        precioOriginal: r.precioOriginal ?? null,
        region: r.region,
        municipio: r.municipio,
        vereda: r.vereda,
        duracion: r.duracion,
        dificultad: r.dificultad,
        capacidad: r.capacidad,
        incluye: JSON.stringify(r.incluye),
        noIncluye: JSON.stringify(r.noIncluye),
        itinerario: JSON.stringify(r.itinerario),
        imagen: r.imagen,
        destacado: r.destacado,
        activo: r.activo,
      },
      create: {
        slug: r.slug,
        nombre: r.nombre,
        descripcionCorta: r.descripcionCorta,
        descripcion: r.descripcion,
        precio: r.precio,
        precioOriginal: r.precioOriginal ?? null,
        region: r.region,
        municipio: r.municipio,
        vereda: r.vereda,
        duracion: r.duracion,
        dificultad: r.dificultad,
        capacidad: r.capacidad,
        incluye: JSON.stringify(r.incluye),
        noIncluye: JSON.stringify(r.noIncluye),
        itinerario: JSON.stringify(r.itinerario),
        imagen: r.imagen,
        destacado: r.destacado,
        activo: r.activo,
      },
    })
  }

  console.log('✅ Recorridos turísticos de ejemplo creados (4).')

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
