'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useRef, useEffect } from 'react'

interface BreadcrumbNavigationProps {
  onNavigate?: (folderId: string) => void
}

export default function BreadcrumbNavigation({ onNavigate }: BreadcrumbNavigationProps) {
  const { state, updateNavigation, saveScrollPosition } = useCrossPlatformState()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 자동 스크롤 (긴 브레드크럼 경로)
  useEffect(() => {
    if (scrollRef.current) {
      // 새 브레드크럼이 추가되면 오른쪽 끝으로 스크롤
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [state.navigation.breadcrumbs])

  // 브레드크럼이 없으면 렌더링하지 않음
  if (!state.navigation.breadcrumbs.length) return null

  // 브레드크럼 클릭 핸들러
  const handleBreadcrumbClick = (index: number) => {
    // 햅틱 피드백
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

    const targetBreadcrumb = state.navigation.breadcrumbs[index]
    if (!targetBreadcrumb) return

    // 현재 스크롤 위치 저장
    const currentScrollKey = `folder-${state.navigation.selectedFolderId}`
    const scrollElement = document.querySelector('[data-folder-content]')
    if (scrollElement) {
      saveScrollPosition(currentScrollKey, scrollElement.scrollTop)
    }

    // 브레드크럼을 클릭한 위치까지만 유지
    const newBreadcrumbs = state.navigation.breadcrumbs.slice(0, index + 1)
    
    // 네비게이션 상태 업데이트
    updateNavigation({
      selectedFolderId: targetBreadcrumb.id,
      breadcrumbs: newBreadcrumbs,
      folderEntryMethod: 'breadcrumb'
    })

    // 부모 컴포넌트에 알림
    onNavigate?.(targetBreadcrumb.id)
  }

  // 홈(루트) 클릭 핸들러
  const handleHomeClick = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

    // 현재 스크롤 위치 저장
    const currentScrollKey = `folder-${state.navigation.selectedFolderId}`
    const scrollElement = document.querySelector('[data-folder-content]')
    if (scrollElement) {
      saveScrollPosition(currentScrollKey, scrollElement.scrollTop)
    }

    // 루트로 이동 (모든 브레드크럼 제거)
    updateNavigation({
      selectedFolderId: undefined,
      breadcrumbs: [],
      folderEntryMethod: 'direct'
    })

    onNavigate?.('')
  }

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div 
        ref={scrollRef}
        className="flex items-center gap-1 px-0 py-3 overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* 홈 버튼 */}
        <motion.button
          onClick={handleHomeClick}
          className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          whileTap={{ scale: 0.95 }}
          style={{ minWidth: '44px', minHeight: '44px' }} // 터치 영역 보장
        >
          <Home size={16} color="#6B7280" />
        </motion.button>

        {/* 브레드크럼 아이템들 */}
        {state.navigation.breadcrumbs.map((breadcrumb, index) => (
          <div key={`${breadcrumb.id}-${index}`} className="flex items-center gap-1 flex-shrink-0">
            {/* 화살표 구분자 */}
            <ChevronRight size={14} color="#D1D5DB" className="flex-shrink-0" />
            
            {/* 브레드크럼 버튼 */}
            <motion.button
              onClick={() => handleBreadcrumbClick(index)}
              className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 max-w-[120px]"
              whileTap={{ scale: 0.95 }}
              style={{ 
                minWidth: '44px', 
                minHeight: '44px',
                backgroundColor: index === state.navigation.breadcrumbs.length - 1 ? '#F3F4F6' : 'transparent'
              }}
            >
              <span 
                className={`text-sm font-medium truncate ${
                  index === state.navigation.breadcrumbs.length - 1 
                    ? 'text-gray-900' 
                    : 'text-gray-600'
                }`}
                title={breadcrumb.name}
              >
                {breadcrumb.name}
              </span>
            </motion.button>
          </div>
        ))}
      </div>

      {/* 그래디언트 오버레이 (긴 경로 표시) */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  )
}