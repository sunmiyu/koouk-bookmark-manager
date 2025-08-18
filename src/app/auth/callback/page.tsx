'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...')
        
        // Check for error in URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const urlError = urlParams.get('error')
        
        if (urlError) {
          console.error('OAuth error from URL:', urlError)
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
          setTimeout(() => router.push('/'), 2000)
          return
        }
        
        // Wait a moment for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check for session after OAuth processing
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setStatus('error')
          setMessage('Session creation failed. Please try again.')
          setTimeout(() => router.push('/'), 2000)
          return
        }

        if (data.session?.user) {
          console.log('✅ Authentication successful:', data.session.user.email)
          
          // Cache session
          if (typeof window !== 'undefined' && data.session.expires_at) {
            const cacheData = {
              user: data.session.user,
              expiresAt: data.session.expires_at * 1000
            }
            localStorage.setItem('koouk-session-cache', JSON.stringify(cacheData))
          }
          
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Navigate to dashboard after brief success display
          setTimeout(() => {
            router.push('/?tab=my-folder')
          }, 1000)
          
        } else {
          // If no session yet, wait a bit longer and try again
          console.log('⏳ Waiting for session...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { data: retryData, error: retryError } = await supabase.auth.getSession()
          
          if (retryError || !retryData.session?.user) {
            console.error('No session found after retry')
            setStatus('error')
            setMessage('Authentication incomplete. Please try again.')
            setTimeout(() => router.push('/'), 2000)
          } else {
            console.log('✅ Authentication successful on retry:', retryData.session.user.email)
            setStatus('success')
            setMessage('Authentication successful! Redirecting...')
            setTimeout(() => router.push('/?tab=my-folder'), 1000)
          }
        }
        
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Redirecting...')
        setTimeout(() => router.push('/'), 2000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'loading' && (
          <>
            {/* 🚀 OPTIMIZATION 10: Faster, smoother loading animation */}
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}