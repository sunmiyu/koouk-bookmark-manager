/**
 * GA4 Analytics Hook
 * React 컴포넌트에서 쉽게 사용할 수 있는 Analytics Hook
 */

import { useCallback } from 'react'
import { analytics, trackEvent, trackPageView } from '@/lib/analytics'

export function useAnalytics() {
  // 페이지뷰 추적
  const trackPage = useCallback((url?: string, title?: string) => {
    trackPageView(url, title)
  }, [])

  // 검색 추적
  const trackSearch = useCallback((query: string, resultCount: number, filters?: Record<string, string>) => {
    analytics.search(query, resultCount)
    
    // 필터가 있으면 각각 추적
    if (filters) {
      Object.entries(filters).forEach(([type, value]) => {
        if (value) {
          analytics.filterContent(type, value)
        }
      })
    }
  }, [])

  // 콘텐츠 상호작용 추적
  const trackContentInteraction = useCallback((action: string, contentType: string, contentId?: string) => {
    trackEvent('content_interaction', {
      action_type: action,
      content_type: contentType,
      content_id: contentId || '',
      event_category: 'content'
    })
  }, [])

  // 사용자 참여도 추적 (시간 기반)
  const trackEngagement = useCallback((action: string, startTime: number) => {
    const duration = Date.now() - startTime
    analytics.engagement(action, duration)
  }, [])

  // 에러 추적
  const trackError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error
    const errorType = error instanceof Error ? error.name : 'UnknownError'
    analytics.error(errorType, errorMessage, context)
  }, [])

  // 성능 측정
  const trackPerformance = useCallback((metricName: string, startTime: number, unit: string = 'ms') => {
    const duration = Date.now() - startTime
    analytics.performance(metricName, duration, unit)
  }, [])

  // PWA 관련 이벤트
  const trackPWA = useCallback(() => ({
    install: () => analytics.installPWA(),
    showPrompt: () => analytics.showInstallPrompt(),
    offlineAction: (action: string) => analytics.offlineAction(action)
  }), [])

  // 사용자 행동 추적
  const trackUserAction = useCallback((action: string, category: string, label?: string, value?: number) => {
    trackEvent(action, {
      event_category: category,
      event_label: label || '',
      value: value || 0
    })
  }, [])

  // 공유 추적
  const trackShare = useCallback((contentType: string, method: string, contentId?: string) => {
    trackEvent('share', {
      content_type: contentType,
      method,
      content_id: contentId || '',
      event_category: 'sharing'
    })
  }, [])

  // 전환 추적 (목표 달성)
  const trackGoal = useCallback((goalName: string, value?: number) => {
    analytics.conversion(goalName, value)
  }, [])

  return {
    // 기본 추적
    trackPage,
    trackSearch,
    trackError,
    trackPerformance,
    
    // 사용자 행동
    trackUserAction,
    trackContentInteraction,
    trackEngagement,
    trackShare,
    trackGoal,
    
    // PWA 관련
    trackPWA,
    
    // 직접 analytics 객체 접근
    analytics
  }
}

/**
 * 성능 측정을 위한 Hook
 */
export function usePerformanceTracker() {
  const trackTiming = useCallback((name: string, fn: () => Promise<unknown>) => {
    return async () => {
      const startTime = performance.now()
      try {
        const result = await fn()
        const duration = performance.now() - startTime
        analytics.performance(name, duration)
        return result
      } catch (error) {
        const duration = performance.now() - startTime
        analytics.performance(`${name}_error`, duration)
        analytics.error('PerformanceError', error instanceof Error ? error.message : 'Unknown error', name)
        throw error
      }
    }
  }, [])

  const trackSyncTiming = useCallback((name: string, fn: () => unknown) => {
    return () => {
      const startTime = performance.now()
      try {
        const result = fn()
        const duration = performance.now() - startTime
        analytics.performance(name, duration)
        return result
      } catch (error) {
        const duration = performance.now() - startTime
        analytics.performance(`${name}_error`, duration)
        analytics.error('PerformanceError', error instanceof Error ? error.message : 'Unknown error', name)
        throw error
      }
    }
  }, [])

  return {
    trackTiming,
    trackSyncTiming
  }
}