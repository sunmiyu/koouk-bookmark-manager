/**
 * Google Analytics 4 (GA4) 통합 관리 시스템
 * 사용자 행동 추적, 전환율 측정, 성능 모니터링
 */

// GA4 Measurement ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-JDNMQKM9J4'

// gtag function and dataLayer are defined in global.d.ts

// Analytics 초기화
export const initializeAnalytics = () => {
  if (typeof window === 'undefined') return

  // Google Analytics 스크립트 동적 로딩
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script1)

  // gtag 초기화
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }
  
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    // 개인정보 보호 설정
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    // 성능 최적화
    send_page_view: true,
    cookie_expires: 28 * 24 * 60 * 60, // 28일
    // Enhanced measurement 활성화
    enhanced_measurements: {
      scrolls: true,
      outbound_clicks: true,
      site_search: true,
      video_engagement: true,
      file_downloads: true
    }
  })

  console.log('📊 Google Analytics 4 initialized:', GA_MEASUREMENT_ID)
}

// 페이지뷰 추적
export const trackPageView = (url?: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url || window.location.pathname,
    page_title: title || document.title,
    page_location: url ? `${window.location.origin}${url}` : window.location.href
  })
}

// 커스텀 이벤트 추적
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', eventName, {
    event_category: 'engagement',
    event_label: parameters?.label || '',
    value: parameters?.value || 0,
    ...parameters
  })
}

// 사용자 행동 추적 함수들
export const analytics = {
  // 인증 관련
  login: (method: string) => {
    trackEvent('login', {
      method,
      event_category: 'authentication'
    })
  },

  logout: () => {
    trackEvent('logout', {
      event_category: 'authentication'
    })
  },

  signup: (method: string) => {
    trackEvent('sign_up', {
      method,
      event_category: 'authentication'
    })
  },

  // 북마크 관리
  createFolder: (folderName: string) => {
    trackEvent('create_folder', {
      folder_name: folderName,
      event_category: 'folder_management'
    })
  },

  deleteFolder: (folderId: string) => {
    trackEvent('delete_folder', {
      folder_id: folderId,
      event_category: 'folder_management'
    })
  },

  addBookmark: (type: string, folderId: string) => {
    trackEvent('add_item', {
      content_type: type,
      folder_id: folderId,
      event_category: 'content_management'
    })
  },

  deleteBookmark: (itemId: string, type: string) => {
    trackEvent('remove_item', {
      item_id: itemId,
      content_type: type,
      event_category: 'content_management'
    })
  },

  // 검색 및 필터
  search: (searchTerm: string, resultCount: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      result_count: resultCount,
      event_category: 'search'
    })
  },

  filterContent: (filterType: string, filterValue: string) => {
    trackEvent('filter_content', {
      filter_type: filterType,
      filter_value: filterValue,
      event_category: 'search'
    })
  },

  // PWA 관련
  installPWA: () => {
    trackEvent('pwa_install', {
      event_category: 'pwa',
      event_label: 'user_initiated'
    })
  },

  showInstallPrompt: () => {
    trackEvent('pwa_install_prompt_shown', {
      event_category: 'pwa'
    })
  },

  offlineAction: (action: string) => {
    trackEvent('offline_action', {
      action_type: action,
      event_category: 'offline'
    })
  },

  // 공유 및 협업
  shareFolder: (folderId: string, method: string) => {
    trackEvent('share', {
      content_type: 'folder',
      content_id: folderId,
      method,
      event_category: 'sharing'
    })
  },

  downloadSharedFolder: (folderId: string) => {
    trackEvent('download_shared_content', {
      content_type: 'folder',
      content_id: folderId,
      event_category: 'marketplace'
    })
  },

  // 설정 및 개인화
  changeSettings: (settingType: string, newValue: string) => {
    trackEvent('change_settings', {
      setting_type: settingType,
      new_value: newValue,
      event_category: 'customization'
    })
  },

  // 에러 추적
  error: (errorType: string, errorMessage: string, location?: string) => {
    trackEvent('exception', {
      description: `${errorType}: ${errorMessage}`,
      fatal: false,
      error_location: location || window.location.pathname,
      event_category: 'errors'
    })
  },

  // 성능 측정
  performance: (metricName: string, value: number, unit: string = 'ms') => {
    trackEvent('timing_complete', {
      name: metricName,
      value: Math.round(value),
      event_category: 'performance',
      unit
    })
  },

  // 사용자 참여도
  engagement: (action: string, duration?: number) => {
    trackEvent('user_engagement', {
      engagement_time_msec: duration || 0,
      action_type: action,
      event_category: 'engagement'
    })
  },

  // 전환 추적
  conversion: (conversionType: string, value?: number) => {
    trackEvent('conversion', {
      currency: 'USD',
      value: value || 1,
      conversion_type: conversionType,
      event_category: 'conversions'
    })
  },

  // 피드백 및 만족도
  feedback: (rating: number, category: string, comment?: string) => {
    trackEvent('feedback_submitted', {
      rating,
      category,
      comment: comment ? 'provided' : 'none',
      event_category: 'user_feedback'
    })
  }
}

// Enhanced E-commerce 추적 (향후 유료 기능용)
export const ecommerce = {
  viewItem: (itemId: string, itemName: string, category: string, value: number) => {
    trackEvent('view_item', {
      currency: 'USD',
      value,
      items: [{
        item_id: itemId,
        item_name: itemName,
        item_category: category,
        price: value,
        quantity: 1
      }]
    })
  },

  purchase: (transactionId: string, value: number, items: unknown[]) => {
    trackEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency: 'USD',
      items
    })
  }
}

// 개인정보 보호 동의 관리
export const setConsentMode = (granted: boolean) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: 'denied', // 광고는 항상 거부
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  })
}

// 사용자 ID 설정 (로그인 후)
export const setUserId = (userId: string) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: userId,
    custom_map: {
      custom_dimension_1: 'user_type'
    }
  })
}

// 사용자 속성 설정
export const setUserProperties = (properties: Record<string, string>) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_properties: properties
  })
}

// 디버그 모드 (개발환경에서만)
export const enableDebugMode = () => {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      debug_mode: true
    })
    console.log('📊 GA4 Debug mode enabled')
  }
}