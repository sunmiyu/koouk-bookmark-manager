/**
 * Google Analytics 4 컴포넌트
 * Next.js App Router와 호환되는 GA4 구현
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initializeAnalytics, trackPageView, enableDebugMode, setConsentMode } from '@/lib/analytics'

function GoogleAnalyticsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Analytics 초기화
    initializeAnalytics()
    
    // 개발환경에서 디버그 모드 활성화
    if (process.env.NODE_ENV === 'development') {
      enableDebugMode()
    }
  }, [])

  useEffect(() => {
    // 페이지 변경 시 페이지뷰 추적
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(url)
  }, [pathname, searchParams])

  return null
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  )
}

/**
 * Consent Banner Component
 * GDPR/CCPA 준수를 위한 동의 배너
 */


interface ConsentBannerProps {
  onConsent?: (granted: boolean) => void
}

export function ConsentBanner({ onConsent }: ConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [language, setLanguage] = useState<'ko' | 'en'>('ko')

  useEffect(() => {
    // 브라우저 언어 감지
    const detectLanguage = () => {
      if (typeof window !== 'undefined') {
        const userLang = navigator.language || navigator.languages?.[0] || 'ko'
        const isKorean = userLang.startsWith('ko')
        setLanguage(isKorean ? 'ko' : 'en')
      }
    }

    detectLanguage()

    // 로컬 스토리지에서 동의 상태 확인
    const consentGiven = localStorage.getItem('analytics_consent')
    if (!consentGiven) {
      setShowBanner(true)
    } else {
      // 이전 동의 상태 적용
      setConsentMode(consentGiven === 'granted')
    }
  }, [])

  const handleConsent = (granted: boolean) => {
    // 동의 상태 저장
    localStorage.setItem('analytics_consent', granted ? 'granted' : 'denied')
    localStorage.setItem('analytics_consent_date', new Date().toISOString())
    
    // GA4 동의 모드 설정
    setConsentMode(granted)
    
    // 배너 숨기기
    setShowBanner(false)
    
    // 콜백 실행
    onConsent?.(granted)
  }

  const texts = {
    ko: {
      title: '쿠키 및 개인정보 수집 동의',
      description: '서비스 개선을 위해 Google Analytics를 사용합니다. 익명화된 사용 데이터만 수집되며, 개인정보는 수집하지 않습니다.',
      decline: '거부',
      accept: '동의'
    },
    en: {
      title: 'Cookie & Privacy Consent',
      description: 'We use Google Analytics to improve our service. Only anonymized usage data is collected, and no personal information is gathered.',
      decline: 'Decline',
      accept: 'Accept'
    }
  }

  const currentTexts = texts[language]

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {currentTexts.title}
            </h3>
            <p className="text-sm text-gray-600">
              {currentTexts.description}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => handleConsent(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {currentTexts.decline}
            </button>
            <button
              onClick={() => handleConsent(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentTexts.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Performance Monitor Component
 * Core Web Vitals 및 성능 지표 추적
 */

export function PerformanceMonitor() {
  useEffect(() => {
    // Core Web Vitals 추적
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        
        if (lastEntry && window.gtag) {
          window.gtag('event', 'LCP', {
            event_category: 'Web Vitals',
            value: Math.round(lastEntry.startTime),
            metric_rating: lastEntry.startTime > 2500 ? 'poor' : lastEntry.startTime > 1200 ? 'needs_improvement' : 'good'
          })
        }
      })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
          if (window.gtag && entry.processingStart) {
            window.gtag('event', 'FID', {
              event_category: 'Web Vitals',
              value: Math.round(entry.processingStart - entry.startTime),
              metric_rating: entry.processingStart - entry.startTime > 100 ? 'poor' : entry.processingStart - entry.startTime > 25 ? 'needs_improvement' : 'good'
            })
          }
        })
      })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
          if (!entry.hadRecentInput && entry.value) {
            clsValue += entry.value
          }
        })

        if (window.gtag) {
          window.gtag('event', 'CLS', {
            event_category: 'Web Vitals',
            value: Math.round(clsValue * 1000),
            metric_rating: clsValue > 0.25 ? 'poor' : clsValue > 0.1 ? 'needs_improvement' : 'good'
          })
        }
      })

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        fidObserver.observe({ entryTypes: ['first-input'] })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.log('Performance Observer not supported:', error)
      }

      return () => {
        lcpObserver.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
      }
    }
  }, [])

  return null
}