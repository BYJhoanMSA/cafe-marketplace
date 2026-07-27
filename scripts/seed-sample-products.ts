import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PRODUCTS = [
  {
    title: 'Finca El Paraíso — Geisha Natural',
    description: 'Café de especialidad cultivado en las montañas del Huila. Proceso natural con fermentación extendida que resalta notas dulces y afrutadas. Puntuación SCA 88.5.',
    region: 'Huila',
    farmName: 'El Paraíso',
    producerName: 'María Jiménez',
    altitudeMasl: '1850',
    varietal: 'Geisha',
    roastLevel: 'medium',
    processingMethod: 'natural',
    cuppingScore: 88.5,
    flavorNotes: ['Frambuesa', 'Miel', 'Jazmín'],
    isNew: true,
    imageUrl: 'https://res.cloudinary.com/dcrsncau/image/upload/v1785111896/sample/p1.jpg',
  },
  {
    title: 'Café San Alberto — Bourbon Washed',
    description: 'Bourbon rojo lavado de la finca San Alberto en Cauca. Taza limpia con acidez cítrica brillante y final dulce prolongado.',
    region: 'Cauca',
    farmName: 'San Alberto',
    producerName: 'Carlos Rojas',
    altitudeMasl: '1720',
    varietal: 'Bourbon Rojo',
    roastLevel: 'medium-light',
    processingMethod: 'washed',
    cuppingScore: 87.0,
    flavorNotes: ['Naranja', 'Panela', 'Te Negro'],
    isNew: false,
    imageUrl: 'https://res.cloudinary.com/dcrsncau/image/upload/v1785111897/sample/p11.jpg',
  },
  {
    title: 'La Pradera — Castillo Honey',
    description: 'Café honey process de la Pradera en Nariño. Fermentación controlada que potencia dulzor natural y cuerpo sedoso.',
    region: 'Nariño',
    farmName: 'La Pradera',
    producerName: 'Ana Valencia',
    altitudeMasl: '1950',
    varietal: 'Castillo',
    roastLevel: 'medium',
    processingMethod: 'honey',
    cuppingScore: 86.5,
    flavorNotes: ['Caramelo', 'Durazno', 'Chocolate con Leche'],
    isNew: true,
    isFeatured: true,
    imageUrl: 'https://res.cloudinary.com/dcrsncau/image/upload/v1785111898/sample/p2.jpg',
  },
  {
    title: 'Monteverde — Caturra Especial',
    description: 'Caturra de alta montaña cultivado por la comunidad Monteverde en la Sierra Nevada. Perfil complejo con notas a frutos rojos y vinoso.',
    region: 'Sierra Nevada',
    farmName: 'Monteverde',
    producerName: 'Pedro García',
    altitudeMasl: '2000',
    varietal: 'Caturra',
    roastLevel: 'medium-dark',
    processingMethod: 'washed',
    cuppingScore: 87.5,
    flavorNotes: ['Cereza', 'Vino Tinto', 'Cacao'],
    isNew: false,
    imageUrl: 'https://res.cloudinary.com/dcrsncau/image/upload/v1785111900/sample/p3.jpg',
  },
  {
    title: 'Los Arrayanes — Colombia Excelso',
    description: 'Excelso de los Arrayanes en Quindío. Café equilibrado, perfecto para filtro, con notas a fruta fresca y nuez.',
    region: 'Quindío',
    farmName: 'Los Arrayanes',
    producerName: 'Luis Moreno',
    altitudeMasl: '1550',
    varietal: 'Castillo, Colombia',
    roastLevel: 'medium',
    processingMethod: 'washed',
    cuppingScore: 85.0,
    flavorNotes: ['Manzana Verde', 'Almendra', 'Miel'],
    isNew: false,
    imageUrl: 'https://res.cloudinary.com/dcrsncau/image/upload/v1785111901/sample/p4.jpg',
  },
  {
    title: 'El Encanto — Pacamara Natural',
    description: 'Pacamara de proceso natural de El Encanto en Tolima. Grano grande con perfil exótico: frutas tropicales, fermento controlado y final goloso.',
    region: 'Tolima',
    farmName: 'El Encanto',
    producerName: 'Rosa María Díaz',
    altitudeMasl: '1780',
    varietal: 'Pacamara',
    roastLevel: 'medium-light',
    processingMethod: 'natural',
    cuppingScore: 88.0,
    flavorNotes: ['Mango', 'Maracuyá', 'Chocolate Amargo'],
    isNew: true,
    isLimited: true,
    imageUrl: 'https://res.cloudinary.com/dcrsncau/image/upload/v1785111903/sample/p6.webp',
  },
  {
    title: 'Buenavista — Typica Honey',
    description: 'Typica honey de Buenavista en el Cauca. Acidez suave y cuerpo aterciopelado con notas a fruta deshidratada.',
    region: 'Cauca',
    farmName: 'Buenavista',
    producerName: 'Jorge Hernández',
    altitudeMasl: '1680',
    varietal: 'Typica',
    roastLevel: 'medium',
    processingMethod: 'honey',
    cuppingScore: 86.0,
    flavorNotes: ['Higos', 'Panela', 'Cacao'],
    isNew: false,
    imageUrl: 'https://res.cloudinary.com/dcrsncau/image/upload/v1785111905/sample/p7.webp',
  },
  {
    title: 'Altozano — Caturra Anaeróbico',
    description: 'Caturra fermentado anaeróbicamente en tanques de acero inoxidable. Perfil intenso y frutal con acidez vibrante y final complejo.',
    region: 'Huila',
    farmName: 'Altozano',
    producerName: 'Fernando Torres',
    altitudeMasl: '1900',
    varietal: 'Caturra',
    roastLevel: 'light',
    processingMethod: 'anaerobic',
    cuppingScore: 89.0,
    flavorNotes: ['Frutos Rojos', 'Vainilla', 'Cítricos'],
    isNew: true,
    isFeatured: true,
    isLimited: true,
    imageUrl: 'https://res.cloudinary.com/dcrsncau/image/upload/v1785111906/sample/p9.jpg',
  },
]

async function main() {
  const defaultVendor = await prisma.vendor.findFirst()
  const defaultCategory = await prisma.category.findFirst()

  if (!defaultVendor || !defaultCategory) {
    console.error('No hay vendor o category en la DB. Créalos primero.')
    process.exit(1)
  }

  for (const p of PRODUCTS) {
    const regionSlug = 'colombia-' + p.region.toLowerCase().replace(/\s+/g, '-')
    const origin = await prisma.origin.upsert({
      where: { slug: regionSlug },
      update: { region: p.region },
      create: {
        country: 'Colombia',
        countryCode: 'CO',
        region: p.region,
        slug: regionSlug,
      },
    })

    const slug = 'sample-' + p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')

    const product = await prisma.product.create({
      data: {
        title: p.title,
        slug,
        description: p.description,
        status: 'active',
        roastLevel: p.roastLevel,
        processingMethod: p.processingMethod,
        farmName: p.farmName,
        producerName: p.producerName,
        altitudeMasl: p.altitudeMasl,
        varietal: p.varietal,
        cuppingScore: p.cuppingScore,
        isFeatured: p.isFeatured ?? false,
        isNew: p.isNew,
        isLimited: p.isLimited ?? false,
        isOrganic: false,
        isPublicity: false,
        vendorId: defaultVendor.id,
        categoryId: defaultCategory.id,
        originId: origin.id,
        flavorNotes: {
          create: p.flavorNotes.map(note => ({ note })),
        },
        images: {
          create: {
            url: p.imageUrl,
            alt: p.title,
            position: 0,
            type: 'product',
          },
        },
      },
    })

    const sku = 'SAMPLE-' + slug.slice(-8).toUpperCase()
    await prisma.variant.create({
      data: {
        productId: product.id,
        sku: sku + '-250-WB',
        title: '250g — Grano Entero',
        weightGrams: 250,
        priceInCents: 2200,
        stockQuantity: 50,
      },
    })

    await prisma.variant.create({
      data: {
        productId: product.id,
        sku: sku + '-500-WB',
        title: '500g — Grano Entero',
        weightGrams: 500,
        priceInCents: 3800,
        stockQuantity: 30,
      },
    })

    await prisma.variant.create({
      data: {
        productId: product.id,
        sku: sku + '-250-FL',
        title: '250g — Molido Filtro (V60)',
        weightGrams: 250,
        grindType: 'filter',
        priceInCents: 2200,
        stockQuantity: 20,
      },
    })

    console.log('✓ ' + p.title + ' -> ' + slug)
  }

  console.log('\n8 productos de muestra creados exitosamente.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
