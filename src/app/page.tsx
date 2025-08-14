'use client'

import { useAuth } from '@/components/auth/AuthContext'
import { lazy, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Lazy load heavy components to reduce initial bundle size
const App = lazy(() => import('@/components/core/App'))

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    }>
      <App />
    </Suspense>
  )
}