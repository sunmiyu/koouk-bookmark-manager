import type { Metadata, Viewport } from 'next'
import './globals.css'
// AuthProvider removed - using Netflix-style optimistic auth
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration'
import GoogleAnalytics, { ConsentBanner, PerformanceMonitor } from '@/components/analytics/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'Koouk - Personal Knowledge Management',
  description: 'Store, organize, and find your information effortlessly. From notes to links, everything in one place.',
  keywords: ['knowledge management', 'notes', 'organization', 'productivity'],
  authors: [{ name: 'Koouk Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Koouk',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <ServiceWorkerRegistration />
        <GoogleAnalytics />
        <PerformanceMonitor />
        <ConsentBanner />
      </body>
    </html>
  )
}