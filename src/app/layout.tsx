import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Koouk - Personal Knowledge Management',
  description: 'Store, organize, and find your information effortlessly. From notes to links, everything in one place.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}