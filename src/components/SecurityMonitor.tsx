'use client'

import { useEffect } from 'react'

// 간단한 로깅 함수 (배포용)
const trackEvents = (event: string, data: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Security Event:', event, data)
  }
}

export default function SecurityMonitor() {
  useEffect(() => {
    // API 오류 모니터링
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // 오류 상태 코드 추적
        if (response.status >= 400) {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url
          const endpoint = typeof window !== 'undefined' 
            ? new URL(url, window.location.origin).pathname
            : new URL(url).pathname
          
          if (response.status === 403) {
            trackEvents('cors_blocked', endpoint)
          } else if (response.status === 429) {
            trackEvents('rate_limit_hit', endpoint)
          } else {
            trackEvents('api_error', { endpoint, status: response.status })
          }
          
          console.warn('API Error Tracked:', {
            endpoint,
            status: response.status,
            timestamp: new Date().toISOString()
          })
        }
        
        return response
      } catch (error) {
        console.error('Fetch error:', error)
        throw error
      }
    }
    
    // 페이지 언로드 시 fetch 복원
    return () => {
      window.fetch = originalFetch
    }
  }, [])
  
  return null // 이 컴포넌트는 UI를 렌더링하지 않음
}