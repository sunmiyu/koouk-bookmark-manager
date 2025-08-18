'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...')
        
        // Get URL parameters and hash for debugging
        const url = new URL(window.location.href)
        const urlParams = url.searchParams
        const fragment = url.hash
        
        console.log('Callback URL params:', Object.fromEntries(urlParams))
        console.log('Callback URL fragment:', fragment)
        
        // Check for OAuth errors in URL parameters
        const oauthError = urlParams.get('error')
        const oauthErrorDescription = urlParams.get('error_description')
        
        if (oauthError) {
          console.error('OAuth URL error:', oauthError, oauthErrorDescription)
          setError(`Authentication failed: ${oauthErrorDescription || oauthError}`)
          setTimeout(() => {
            router.push('/?auth_error=oauth_failed')
          }, 3000)
          return
        }
        
        // Handle the auth callback from URL hash/query params
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('OAuth callback error:', error)
          setError(error.message)
          // Redirect to home with error
          setTimeout(() => {
            router.push('/?auth_error=callback_failed')
          }, 3000)
          return
        }
        
        if (data.session) {
          console.log('✅ Authentication successful, redirecting...')
          // Success - redirect to home
          router.push('/')
        } else {
          console.log('No session found, checking for auth code in URL...')
          // Check if we need to exchange auth code
          const url = new URL(window.location.href)
          const authCode = url.searchParams.get('code')
          
          if (authCode) {
            console.log('Auth code found, exchanging for session...')
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode)
            
            if (exchangeError) {
              console.error('Code exchange error:', exchangeError)
              setError('Failed to complete authentication')
              setTimeout(() => {
                router.push('/?auth_error=exchange_failed')
              }, 2000)
            } else {
              console.log('✅ Code exchange successful, redirecting...')
              router.push('/')
            }
          } else {
            console.log('No auth code found, redirecting to home...')
            router.push('/')
          }
        }
      } catch (err) {
        console.error('Callback processing error:', err)
        setError('Authentication failed')
        setTimeout(() => {
          router.push('/?auth_error=processing_failed')
        }, 2000)
      }
    }

    handleAuthCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <p className="text-xs text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">Completing authentication...</p>
        <p className="text-xs text-gray-500 mt-2">Please wait while we process your login</p>
      </div>
    </div>
  )
}