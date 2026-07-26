import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ============================================================
  // Optimización de imágenes
  // ============================================================
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        // Dominio de produccion (configurar via NEXT_PUBLIC_CDN_URL si es necesario)
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_CDN_HOSTNAME || 'tudominio.com',
      },
      {
        // Assets locales en desarrollo
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        // Cloudinary
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ============================================================
  // Headers de seguridad
  // ============================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Cache de assets estáticos
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // ============================================================
  // Producción
  // ============================================================
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  serverExternalPackages: ['sharp'],

  // Standalone para despliegue en Hostinger:
  // Solo requiere: .next/standalone + .next/static + public
  output: 'standalone',

  compress: true,

  experimental: {
    cpus: 1,
  },

  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

export default nextConfig
