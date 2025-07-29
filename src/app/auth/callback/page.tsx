'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error.message)
          // Wait a bit and try again
          setTimeout(() => {
            router.push('/?error=auth_error')
          }, 1000)
          return
        }

        if (data.session) {
          // Successfully authenticated
          console.log('User authenticated:', data.session.user.email)
          // Give some time for the session to be fully established
          setTimeout(() => {
            router.push('/')
          }, 500)
        } else {
          // No session yet, wait a bit more
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession()
            if (retryData.session) {
              router.push('/')
            } else {
              router.push('/')
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setTimeout(() => {
          router.push('/?error=auth_error')
        }, 1000)
      }
    }

    // Add a small delay to ensure the URL params are processed
    const timer = setTimeout(handleAuthCallback, 100)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-400">Completing authentication...</p>
      </div>
    </div>
  )
}