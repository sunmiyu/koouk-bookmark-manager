'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // 10초 타임아웃 설정
      const timeout = setTimeout(() => {
        console.log('Auth callback timeout, redirecting...')
        router.push('/')
      }, 10000)

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
          clearTimeout(timeout)
          router.push('/')
          return
        }

        if (authCode) {
          console.log('Auth code found, attempting code exchange...')
          
          try {
            // 코드를 세션으로 교환
            const { data, error } = await supabase.auth.exchangeCodeForSession(authCode)
            
            if (error) {
              console.error('Code exchange error:', error)
              // 에러가 있어도 세션 확인 시도
            } else if (data.session) {
              console.log('Session established via code exchange:', data.session.user.email)
              clearTimeout(timeout)
              router.push('/')
              return
            }
          } catch (exchangeError) {
            console.error('Code exchange failed:', exchangeError)
          }
          
          // 코드 교환 실패 시 직접 세션 확인
          console.log('Checking session directly after code exchange attempt...')
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          const { data: sessionData } = await supabase.auth.getSession()
          if (sessionData?.session) {
            console.log('Session found after auth:', sessionData.session.user.email)
            clearTimeout(timeout)
            router.push('/')
            return
          }
        }

        // If no code, try to get existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('Session data:', sessionData, 'Error:', sessionError)
        
        if (sessionData?.session) {
          console.log('Existing session found:', sessionData.session.user.email)
          clearTimeout(timeout)
          router.push('/')
          return
        }

        console.log('No session found, redirecting home')
        clearTimeout(timeout)
        router.push('/')
        
      } catch (error) {
        console.error('Auth callback error:', error)
        clearTimeout(timeout)
        // Don't show alert - just redirect silently
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