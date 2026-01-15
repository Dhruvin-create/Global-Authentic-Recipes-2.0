import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Navigation } from '@/components/navigation'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Global Authentic Recipes',
    template: '%s | Global Authentic Recipes',
  },
  description: 'Discover authentic recipes from around the world with detailed instructions, ingredients, and cultural stories. Perfect for food lovers and cooking enthusiasts.',
  keywords: [
    'recipes',
    'cooking',
    'authentic',
    'global cuisine',
    'food',
    'ingredients',
    'cooking instructions',
    'cultural recipes',
    'international food',
    'meal planning'
  ],
  authors: [{ name: 'Global Authentic Recipes Team' }],
  creator: 'Global Authentic Recipes',
  publisher: 'Global Authentic Recipes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://global-authentic-recipes.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://global-authentic-recipes.vercel.app',
    title: 'Global Authentic Recipes',
    description: 'Discover authentic recipes from around the world with detailed instructions, ingredients, and cultural stories.',
    siteName: 'Global Authentic Recipes',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Global Authentic Recipes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Authentic Recipes',
    description: 'Discover authentic recipes from around the world with detailed instructions, ingredients, and cultural stories.',
    images: ['/og-image.png'],
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
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#F97316' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Global Recipes',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F97316' },
    { media: '(prefers-color-scheme: dark)', color: '#1F2937' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://www.themealdb.com" />
        <link rel="dns-prefetch" href="https://www.themealdb.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navigation />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}