import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ============================================================
  // Optimización de imágenes
  // ============================================================
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        // Cloudflare R2 con custom domain
        protocol: 'https',
        hostname: 'assets.tudominio.com',
      },
      {
        // R2 bucket directo (para desarrollo)
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        // Sanity CMS
        protocol: 'https',
        hostname: 'cdn.sanity.io',
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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' https:; frame-src 'none'; object-src 'none'",
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
  serverExternalPackages: ['sharp'],

  // Standalone para despliegue en Hostinger:
  // Solo requiere: .next/standalone + .next/static + public
  output: 'standalone',

  compress: true,

  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

export default nextConfig
