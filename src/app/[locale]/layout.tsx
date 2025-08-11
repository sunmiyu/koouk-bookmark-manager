import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import '../globals.css'
import { AuthProvider } from '@/components/auth/AuthContext'
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'Koouk - Personal Knowledge Management',
  description: 'Store, organize, and find your information effortlessly. From notes to links, everything in one place.',
  keywords: ['knowledge management', 'notes', 'organization', 'productivity'],
  authors: [{ name: 'Koouk Team' }],
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Koouk',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
            <ServiceWorkerRegistration />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}