'use client'

import { useAuth } from '@/components/auth/AuthContext'
import LandingPage from '@/components/core/LandingPage'
import App from '@/components/core/App'

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
    return <LandingPage />
  }

  return <App />
}