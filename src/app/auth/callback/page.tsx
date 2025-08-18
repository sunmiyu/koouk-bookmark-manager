'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // 🔧 ULTRA SIMPLE: Just redirect to home and let AuthContext handle it
    console.log('OAuth callback received, redirecting to home...')
    
    // Small delay to ensure URL processing
    setTimeout(() => {
      router.push('/')
    }, 100)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}