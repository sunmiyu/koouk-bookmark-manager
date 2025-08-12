'use client'

import React from 'react'
import { useAuth } from '@/components/auth/AuthContext'
import LandingPage from '@/components/core/LandingPage'
import App from '@/components/core/App'

export default function AuthWrapper() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-secondary">Loading Koouk...</p>
        </div>
      </div>
    )
  }

  return user ? <App /> : <LandingPage />
}