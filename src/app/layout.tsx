import type { Metadata, Viewport } from 'next'
import { Cinzel, Cormorant_Garamond, EB_Garamond, Libre_Baskerville, DM_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { CartDrawer } from '@/components/cart/CartDrawer'

// ============================================================
// Fuentes — tipografía de styledk (Casa del Cafeto), cargadas
// y optimizadas por Next.js Font. VERSIÓN PREVIEW (reversible).
// ============================================================
// --font-primary  → Cinzel (inscripciones / display)
// --font-secondary→ EB Garamond (cuerpo)
// --font-sub      → Cormorant Garamond (subtítulos)
// --font-quote    → Libre Baskerville (citas)
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-primary',
  display: 'swap',
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-secondary',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-sub',
  display: 'swap',
})

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-quote',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
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
      className={`${cinzel.variable} ${ebGaramond.variable} ${cormorant.variable} ${libreBaskerville.variable} ${dmMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
        <FavoritesProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </FavoritesProvider>
      </body>
    </html>
  )
}
