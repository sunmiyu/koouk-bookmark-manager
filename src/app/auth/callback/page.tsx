'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Auth callback error:', error)
            router.push('/?error=auth_failed')
            return
          }
          
          if (data?.session) {
            // Success! Redirect to home
            router.push('/')
            return
          }
        }
        
        // If no code or other issues, redirect to home
        router.push('/')
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-medium">K</span>
        </div>
        <div className="flex items-center justify-center space-x-1 mb-3">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
        </div>
        <p className="text-gray-600 text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}