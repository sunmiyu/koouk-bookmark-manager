'use client'

import { useAuth } from '@/components/auth/AuthContext'
import { lazy, Suspense } from 'react'

// Lazy load heavy components to reduce initial bundle size
const LandingPage = lazy(() => import('@/components/core/LandingPage'))
const App = lazy(() => import('@/components/core/App'))

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }>
        <LandingPage />
      </Suspense>
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