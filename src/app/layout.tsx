import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthContext'

export const metadata: Metadata = {
  title: 'Koouk - Personal Knowledge Management',
  description: 'Store, organize, and find your information effortlessly. From notes to links, everything in one place.',
  keywords: ['knowledge management', 'notes', 'organization', 'productivity'],
  authors: [{ name: 'Koouk Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}