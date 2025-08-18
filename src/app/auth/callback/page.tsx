'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout
    
    const handleCallback = async () => {
      if (!mounted) return
      
      try {
        console.log('🔄 Processing OAuth callback')
        
        // Check for error in URL
        const urlParams = new URLSearchParams(window.location.search)
        const urlError = urlParams.get('error')
        
        if (urlError) {
          console.error('OAuth error:', urlError)
          if (mounted) {
            setStatus('error')
            setMessage('Authentication failed. Please try again.')
            setTimeout(() => router.push('/'), 2000)
          }
          return
        }
        
        // Wait for Supabase to process OAuth automatically
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check session multiple times
        for (let attempt = 1; attempt <= 3; attempt++) {
          if (!mounted) return
          
          console.log(`Checking session attempt ${attempt}/3`)
          const { data, error } = await supabase.auth.getSession()
          
          if (data.session?.user) {
            console.log('✅ Authentication successful:', data.session.user.email)
            
            if (mounted) {
              // Cache session
              if (data.session.expires_at) {
                const cacheData = {
                  user: data.session.user,
                  expiresAt: data.session.expires_at * 1000
                }
                localStorage.setItem('koouk-session-cache', JSON.stringify(cacheData))
              }
              
              setStatus('success')
              setMessage('Authentication successful! Redirecting...')
              
              setTimeout(() => {
                router.push('/?tab=my-folder')
              }, 500)
            }
            return
          }
          
          if (error) {
            console.error('Session error:', error)
            if (mounted) {
              setStatus('error')
              setMessage('Authentication failed. Please try again.')
              setTimeout(() => router.push('/'), 2000)
            }
            return
          }
          
          // Wait before next attempt
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
        
        // If we get here, no session was found
        if (mounted) {
          console.error('No session found after 3 attempts')
          setStatus('error')
          setMessage('Authentication incomplete. Please try again.')
          setTimeout(() => router.push('/'), 2000)
        }
        
      } catch (error) {
        console.error('Callback error:', error)
        if (mounted) {
          setStatus('error')
          setMessage('An unexpected error occurred. Redirecting...')
          setTimeout(() => router.push('/'), 2000)
        }
      }
    }
    
    // Start processing after small delay
    timeoutId = setTimeout(handleCallback, 500)
    
    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
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