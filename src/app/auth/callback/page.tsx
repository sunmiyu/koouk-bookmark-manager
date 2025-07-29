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
        
        // First, try to get session from URL params
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('Session data:', sessionData, 'Error:', sessionError)
        
        if (sessionData?.session) {
          console.log('Session found immediately:', sessionData.session.user.email)
          router.push('/')
          return
        }

        // If no session, check for auth code in URL and exchange it
        const urlParams = new URLSearchParams(window.location.search)
        const authCode = urlParams.get('code')
        const authError = urlParams.get('error')
        
        console.log('URL params - code:', !!authCode, 'error:', authError)

        if (authError) {
          console.error('OAuth error from URL:', authError)
          router.push('/?error=oauth_error')
          return
        }

        if (authCode) {
          console.log('Auth code found, exchanging for session...')
          // Wait a bit for the session to be processed
          let retries = 0
          const maxRetries = 5
          
          const checkSession = async (): Promise<void> => {
            const { data: retryData } = await supabase.auth.getSession()
            
            if (retryData?.session) {
              console.log('Session established after retry:', retryData.session.user.email)
              router.push('/')
              return
            }
            
            retries++
            if (retries < maxRetries) {
              console.log(`Retry ${retries}/${maxRetries} - waiting for session...`)
              setTimeout(checkSession, 1000)
            } else {
              console.log('Max retries reached, redirecting to home')
              router.push('/')
            }
          }
          
          setTimeout(checkSession, 500)
        } else {
          console.log('No auth code found, redirecting home')
          router.push('/')
        }
        
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/?error=callback_error')
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