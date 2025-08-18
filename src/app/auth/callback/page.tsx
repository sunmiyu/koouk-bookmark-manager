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
        // 🚀 OPTIMIZATION 6: Faster callback processing with immediate session handling
        const startTime = performance.now()
        
        // 🔧 FIX: Check if this is a popup callback
        const isPopup = window.opener && window.opener !== window
        
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
          
          // 🔧 FIX: Handle popup error
          if (isPopup) {
            window.opener?.postMessage({
              type: 'OAUTH_ERROR',
              error: error.message
            }, window.location.origin)
            window.close()
          } else {
            setTimeout(() => router.push('/'), 1000)
          }
          return
        }

        if (data.session) {
          // 🚀 OPTIMIZATION 8: Cache session immediately for faster subsequent loads
          if (typeof window !== 'undefined' && data.session.expires_at) {
            const cacheData = {
              user: data.session.user,
              expiresAt: data.session.expires_at * 1000
            }
            localStorage.setItem('koouk-session-cache', JSON.stringify(cacheData))
          }
          
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // 🔧 FIX: Handle popup vs normal callback differently
          if (isPopup) {
            // For popup: Send message to parent and close
            window.opener?.postMessage({
              type: 'OAUTH_SUCCESS',
              session: data.session
            }, window.location.origin)
            window.close()
          } else {
            // For normal redirect: Navigate as usual
            const processingTime = performance.now() - startTime
            const minDisplayTime = 800
            const remainingTime = Math.max(0, minDisplayTime - processingTime)
            
            setTimeout(() => {
              router.push('/?tab=my-folder')
            }, remainingTime)
          }
          
        } else {
          setStatus('error')
          setMessage('No session found. Redirecting...')
          setTimeout(() => router.push('/'), 1000)
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Redirecting...')
        setTimeout(() => router.push('/'), 1000)
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