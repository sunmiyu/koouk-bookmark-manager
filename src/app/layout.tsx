import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'
import GoogleAnalytics, { ConsentBanner, PerformanceMonitor } from '@/components/analytics/GoogleAnalytics'
import dynamic from 'next/dynamic'

// 🚀 OPTIMIZATION 3: Dynamic imports will be used in client components

// Optimized font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'KOOUK - Personal Lifestyle Management Platform',
    template: '%s | KOOUK'
  },
  description: 'Organize, bookmark, and discover amazing content with KOOUK. Your personal digital life manager with community-driven features.',
  keywords: [
    'personal organization',
    'lifestyle management', 
    'bookmarks',
    'digital organization',
    'content curation',
    'community sharing',
    'productivity',
    'KOOUK'
  ],
  authors: [{ name: 'KOOUK Team', url: 'https://koouk.im' }],
  creator: 'KOOUK Team',
  publisher: 'KOOUK',
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  metadataBase: new URL('https://koouk.im'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://koouk.im',
    title: 'KOOUK - Personal Lifestyle Management Platform',
    description: 'Organize, bookmark, and discover amazing content with your personal digital life manager.',
    siteName: 'KOOUK',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KOOUK - Personal Lifestyle Management Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KOOUK - Personal Lifestyle Management Platform',
    description: 'Organize, bookmark, and discover amazing content with your personal digital life manager.',
    images: ['/og-image.png'],
    creator: '@koouk_official'
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
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KOOUK',
    startupImage: [
      {
        url: '/apple-splash-2048-2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
      },
      {
        url: '/apple-splash-1668-2224.png', 
        media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
      },
      {
        url: '/apple-splash-1536-2048.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
      },
      {
        url: '/apple-splash-1125-2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
      },
      {
        url: '/apple-splash-1242-2208.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
      },
      {
        url: '/apple-splash-750-1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
      },
      {
        url: '/apple-splash-640-1136.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
      }
    ]
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#ffffff' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KOOUK" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* 🚀 OPTIMIZATION 3: Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://bpbfmitcwvqadtefgmek.supabase.co" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//bpbfmitcwvqadtefgmek.supabase.co" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* 🚀 OPTIMIZATION 3: Preload critical resources */}
      </head>
      
      <body 
        className={`${inter.className} antialiased bg-gray-50 text-gray-900`}
        suppressHydrationWarning
      >
        {/* Main app wrapped in AuthProvider */}
        <AuthProvider>
          <div id="__next">
            {children}
          </div>
        </AuthProvider>

        {/* PWA Service Worker */}
        <ServiceWorkerRegistration />
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
        
        {/* Analytics - loaded after main content */}
        <GoogleAnalytics />
        <PerformanceMonitor />
        <ConsentBanner />
        
        {/* NoScript fallback */}
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
            padding: '2rem',
            zIndex: 9999
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1f2937' }}>
              JavaScript Required
            </h1>
            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
              KOOUK requires JavaScript to run properly. Please enable JavaScript in your browser settings and reload this page.
            </p>
          </div>
        </noscript>
      </body>
    </html>
  )
}