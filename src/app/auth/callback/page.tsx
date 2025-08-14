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
        console.log('🎬 Auth callback started')
        
        // URL에서 해시와 쿼리 파라미터 모두 확인
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(window.location.search)
        
        // 에러 체크 (hash와 search 모두)
        const authError = hashParams.get('error') || searchParams.get('error')
        const authCode = searchParams.get('code')
        const accessToken = hashParams.get('access_token')
        
        console.log('🎬 Auth params:', { 
          hasCode: !!authCode, 
          hasToken: !!accessToken, 
          error: authError,
          hash: window.location.hash,
          search: window.location.search
        })

        if (authError) {
          console.error('🎬 OAuth error:', authError)
          setError(getErrorMessage(authError))
          setTimeout(() => router.push('/'), 3000)
          return
        }

        // PKCE 플로우 (authorization code)
        if (authCode) {
          console.log('🎬 Processing authorization code...')
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(authCode)
          
          if (error) {
            console.error('🎬 Code exchange error:', error)
            setError(`인증 실패: ${error.message}`)
            setTimeout(() => router.push('/'), 3000)
            return
          }
          
          if (data.session) {
            console.log('🎬 ✅ 세션 생성 성공:', data.session.user.email)
            router.push('/')
            return
          }
        }

        // Implicit 플로우 (access token in hash)
        if (accessToken) {
          console.log('🎬 Processing access token from hash...')
          
          // Supabase가 자동으로 URL 해시를 처리하도록 함
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('🎬 Session retrieval error:', error)
            setError(`세션 오류: ${error.message}`)
            setTimeout(() => router.push('/'), 3000)
            return
          }
          
          if (data.session) {
            console.log('🎬 ✅ 세션 확인 성공:', data.session.user.email)
            router.push('/')
            return
          }
        }

        // 기존 세션 확인
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('🎬 Session check error:', sessionError)
          setError('세션 확인 중 오류가 발생했습니다')
          setTimeout(() => router.push('/'), 3000)
          return
        }
        
        if (sessionData?.session) {
          console.log('🎬 ✅ 기존 세션 발견:', sessionData.session.user.email)
          router.push('/')
          return
        }

        // 모든 경우에 해당하지 않으면 홈으로
        console.log('🎬 No valid auth state found, redirecting home')
        setError('인증 정보를 찾을 수 없습니다')
        setTimeout(() => router.push('/'), 2000)
        
      } catch (error) {
        console.error('🎬 Auth callback error:', error)
        setError('인증 처리 중 오류가 발생했습니다')
        setTimeout(() => router.push('/'), 3000)
      }
    }

    // DOM이 완전히 로드된 후 실행
    if (typeof window !== 'undefined') {
      handleAuthCallback()
    }
  }, [router])

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'server_error':
        return 'OAuth 설정을 확인해주세요'
      case 'access_denied':
        return '사용자가 접근을 거부했습니다'
      case 'invalid_request':
        return '잘못된 OAuth 요청입니다'
      case 'unauthorized_client':
        return 'OAuth 클라이언트가 승인되지 않았습니다'
      default:
        return `인증 오류: ${error}`
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-400 mb-2">{error}</p>
            <p className="text-gray-500 text-sm">잠시 후 홈페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">🎬 Netflix-style 인증을 완료하는 중...</p>
          </>
        )}
      </div>
    </div>
  )
}