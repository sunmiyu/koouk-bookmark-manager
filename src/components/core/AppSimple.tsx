'use client'

import { useAuth } from '../auth/AuthContext'

export default function AppSimple() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">KOOUK</h1>
        <p className="text-gray-600 mb-8">Personal Lifestyle Management Platform</p>
        {user ? (
          <p>Welcome back, {user.email}!</p>
        ) : (
          <p>Please sign in to continue</p>
        )}
      </div>
    </div>
  )
}