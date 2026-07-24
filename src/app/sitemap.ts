import { MetadataRoute } from 'next'

// Forzar renderizado dinámico para evitar consultar la DB en build time
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tudominio.com'

  let productEntries: MetadataRoute.Sitemap = []

  // Intentar consultar la DB; si no está disponible en build, continuar sin productos
  try {
    const { prisma } = await import('@/server/db/client')
    const products = await prisma.product.findMany({
      where: { status: 'active', deletedAt: null },
      select: { slug: true, updatedAt: true },
    })
    productEntries = products.map((product) => ({
      url: `${appUrl}/productos/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // DB no disponible durante el build — el sitemap se generará sin productos
  }

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${appUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${appUrl}/favoritos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  return [...staticEntries, ...productEntries]
}
