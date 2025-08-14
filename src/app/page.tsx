'use client'

import { useAuth } from '@/components/auth/AuthContext'
import { lazy, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Lazy load heavy components to reduce initial bundle size
const App = lazy(() => import('@/components/core/App'))

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is not authenticated, redirect to Google OAuth login
    if (!loading && !user) {
      // Redirect to Supabase Google OAuth login
      window.location.href = '/auth/login'
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  // If no user, show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Redirecting to login...</div>
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