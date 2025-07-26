// Google Analytics 커스텀 이벤트 추적
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// 페이지뷰 추적
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID!, {
      page_path: url,
    })
  }
}

// 이벤트 추적
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Koouk 전용 이벤트들
export const trackEvents = {
  // 컨텐츠 추가
  addContent: (type: 'video' | 'link' | 'image' | 'note') => {
    event({
      action: 'add_content',
      category: 'Content',
      label: type,
    })
  },
  
  // 플랜 업그레이드
  upgradePlan: (from: string, to: string) => {
    event({
      action: 'upgrade_plan',
      category: 'Plan',
      label: `${from}_to_${to}`,
    })
  },
  
  // 검색 사용
  search: (query: string) => {
    event({
      action: 'search',
      category: 'Search',
      label: query,
    })
  },
  
  // 모달 열기
  openModal: (type: 'image' | 'note') => {
    event({
      action: 'open_modal',
      category: 'Modal',
      label: type,
    })
  },
  
  // 외부 링크 클릭
  clickExternalLink: (url: string) => {
    event({
      action: 'click_external_link',
      category: 'External',
      label: url,
    })
  }
}

// Window 타입 확장
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}