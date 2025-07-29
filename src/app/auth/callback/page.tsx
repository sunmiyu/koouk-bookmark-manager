'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started')
        
        // Check for errors first
        const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
        const authError = urlParams.get('error')
        const authCode = urlParams.get('code')
        
        console.log('URL params - code:', !!authCode, 'error:', authError)

        if (authError) {
          console.error('OAuth error from URL:', authError)
          let errorMessage = 'Authentication failed'
          
          switch (authError) {
            case 'server_error':
              errorMessage = 'Server error during authentication. Please check your OAuth configuration.'
              break
            case 'access_denied':
              errorMessage = 'Access denied by user.'
              break
            case 'invalid_request':
              errorMessage = 'Invalid OAuth request.'
              break
            default:
              errorMessage = `Authentication error: ${authError}`
          }
          
          alert(errorMessage)
          router.push('/')
          return
        }

        if (authCode) {
          console.log('Auth code found, exchanging for session...')
          
          // Use exchangeCodeForSession for PKCE flow
          const { data, error } = await supabase.auth.exchangeCodeForSession(authCode)
          
          if (error) {
            console.error('Code exchange error:', error)
            alert(`Authentication failed: ${error.message}`)
            router.push('/')
            return
          }
          
          if (data?.session) {
            console.log('Session established:', data.session.user.email)
            router.push('/')
            return
          }
        }

        // If no code, try to get existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('Session data:', sessionData, 'Error:', sessionError)
        
        if (sessionData?.session) {
          console.log('Existing session found:', sessionData.session.user.email)
          router.push('/')
          return
        }

        console.log('No session found, redirecting home')
        router.push('/')
        
      } catch (error) {
        console.error('Auth callback error:', error)
        alert(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        router.push('/')
      }
    }

    handleAuthCallback()
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