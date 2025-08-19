'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  // 🚀 FIX 1: React Strict Mode + Hook 방식 대응
  const processingRef = useRef(false)
  const mountedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 🚀 FIX 2: 이미 처리 중이면 무시
    if (processingRef.current) return
    
    processingRef.current = true
    mountedRef.current = true
    
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 OAuth callback 처리 시작...')
        
        // 🚀 FIX 3: unmount 체크
        if (!mountedRef.current) return
        
        // URL 파라미터 확인
        const url = new URL(window.location.href)
        const urlParams = url.searchParams
        
        console.log('Callback URL params:', Object.fromEntries(urlParams))
        
        // OAuth 에러 체크
        const oauthError = urlParams.get('error')
        const oauthErrorDescription = urlParams.get('error_description')
        
        if (oauthError) {
          console.error('OAuth URL error:', oauthError, oauthErrorDescription)
          
          if (mountedRef.current) {
            setError(`Authentication failed: ${oauthErrorDescription || oauthError}`)
          }
          
          // 🚀 FIX 4: 타임아웃 관리 (메모리 누수 방지)
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              router.replace('/?auth_error=oauth_failed')
            }
          }, 3000)
          return
        }
        
        // Auth code 확인
        const authCode = urlParams.get('code')
        
        if (!authCode) {
          console.log('❌ Auth code 없음, 홈으로 리다이렉트...')
          
          if (mountedRef.current) {
            timeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                router.replace('/?auth_error=no_code')
              }
            }, 1000)
          }
          return
        }
        
        console.log('✅ Auth code 발견, 세션 교환 중...')
        
        // 🚀 FIX 5: 타임아웃이 있는 세션 교환 (느린 네트워크 대응)
        const exchangePromise = supabase.auth.exchangeCodeForSession(authCode)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Exchange timeout')), 10000)
        )
        
        let exchangeResult
        try {
          exchangeResult = await Promise.race([exchangePromise, timeoutPromise]) as any
        } catch (timeoutError) {
          console.error('세션 교환 타임아웃:', timeoutError)
          
          if (mountedRef.current) {
            setError('Authentication timeout. Please try again.')
            timeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                router.replace('/?auth_error=timeout')
              }
            }, 3000)
          }
          return
        }
        
        const { data, error: exchangeError } = exchangeResult
        
        // unmount 체크
        if (!mountedRef.current) return
        
        if (exchangeError) {
          console.error('Code exchange error:', exchangeError)
          
          // 🚀 FIX 6: 구체적인 에러 메시지
          let errorMessage = 'Failed to complete authentication'
          if (exchangeError.message?.includes('invalid_grant')) {
            errorMessage = 'Authentication code expired. Please try again.'
          } else if (exchangeError.message?.includes('network')) {
            errorMessage = 'Network error. Please check your connection.'
          }
          
          setError(errorMessage)
          
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              router.replace('/?auth_error=exchange_failed')
            }
          }, 3000)
          return
        }
        
        if (data?.session) {
          console.log('✅ 인증 성공! 홈으로 리다이렉트...')
          
          // 🚀 FIX 7: Hook 방식에서는 즉시 리다이렉트 (AuthContext가 상태 관리)
          if (mountedRef.current) {
            router.replace('/')
          }
          return
        }
        
        // 세션이 없는 경우 (예상치 못한 상황)
        console.warn('⚠️ 코드 교환 성공했지만 세션 없음')
        if (mountedRef.current) {
          setError('Authentication completed but session not found')
          
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              router.replace('/?auth_error=no_session')
            }
          }, 3000)
        }
        
      } catch (err) {
        console.error('Callback processing error:', err)
        
        if (mountedRef.current) {
          setError('Authentication failed')
          
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              router.replace('/?auth_error=processing_failed')
            }
          }, 3000)
        }
      } finally {
        processingRef.current = false
      }
    }

    handleAuthCallback()

    // 🚀 FIX 8: cleanup 함수
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, []) // 🚨 빈 dependency array - router 의존성 제거

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