import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import '@/styles/globals.css'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SessionProvider } from '@/components/providers/SessionProvider'

// ============================================================
// Fuentes — tipografía de styledk (Casa del Cafeto), cargadas
// y optimizadas por Next.js Font.
// --font-primary  → Cinzel (inscripciones / display)
// --font-secondary→ EB Garamond (cuerpo)
// --font-mono     → DM Mono (datos / métricas)
// NOTA: Cormorant y Libre Baskerville se descartaron en Fase 1
// (estaban cargadas pero sin uso real en la app).
// Se usan fuentes LOCALES (next/font/local) para que el build no
// dependa de Google Fonts: el host de producción fallaba al
// descargar EB Garamond en build-time por problemas de red.
// ============================================================
const cinzel = localFont({
  src: [
    { path: './fonts/woff2/cinzel-400-normal0.woff2', weight: '400' },
    { path: './fonts/woff2/cinzel-500-normal1.woff2', weight: '500' },
    { path: './fonts/woff2/cinzel-600-normal2.woff2', weight: '600' },
    { path: './fonts/woff2/cinzel-700-normal3.woff2', weight: '700' },
  ],
  variable: '--font-primary',
  display: 'swap',
})

const ebGaramond = localFont({
  src: [
    { path: './fonts/woff2/ebgaramond-400-normal3.woff2', weight: '400', style: 'normal' },
    { path: './fonts/woff2/ebgaramond-500-normal4.woff2', weight: '500', style: 'normal' },
    { path: './fonts/woff2/ebgaramond-600-normal5.woff2', weight: '600', style: 'normal' },
    { path: './fonts/woff2/ebgaramond-400-italic0.woff2', weight: '400', style: 'italic' },
    { path: './fonts/woff2/ebgaramond-500-italic1.woff2', weight: '500', style: 'italic' },
    { path: './fonts/woff2/ebgaramond-600-italic2.woff2', weight: '600', style: 'italic' },
  ],
  variable: '--font-secondary',
  display: 'swap',
})

const dmMono = localFont({
  src: [
    { path: './fonts/woff2/dmmono-400-normal0.woff2', weight: '400' },
    { path: './fonts/woff2/dmmono-500-normal1.woff2', weight: '500' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

// ============================================================
// Metadata por defecto (se sobrescribe en cada página)
// ============================================================
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  title: {
    default: 'Cafe Seleccion — Café Artesanal Premium',
    template: '%s | Cafe Seleccion',
  },
  description:
    'Descubre los mejores cafés de especialidad del mundo. Compra directamente a tostadores premium con envío a domicilio.',
  keywords: [
    'café de especialidad',
    'specialty coffee',
    'café premium',
    'tostadores artesanales',
    'café colombia',
    'café etiopía',
  ],
  authors: [{ name: 'Cafe Seleccion' }],
  creator: 'Cafe Seleccion',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Cafe Seleccion',
    title: 'Cafe Seleccion — Café Artesanal Premium',
    description:
      'Descubre los mejores cafés de especialidad del mundo. Compra directamente a tostadores premium.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cafe Seleccion',
    description: 'Café de especialidad premium, directo al tostador.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon-32x32.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FDFAF6' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0C0A' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${cinzel.variable} ${ebGaramond.variable} ${dmMono.variable}`}
    >
      <head>
        {/*
         * Script inline para detectar el tema ANTES de que React hidrate.
         * Previene el "flash" de tema incorrecto (FOUC).
         * CRÍTICO: debe ser síncrono, sin defer ni async.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var theme = stored || 'dark';
                  document.documentElement.dataset.theme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <SessionProvider>
          <FavoritesProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </FavoritesProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
