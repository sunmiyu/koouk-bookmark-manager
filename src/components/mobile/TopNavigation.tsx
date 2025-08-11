'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useDevice } from '@/hooks/useDevice'
import FeedbackModal from '../modals/FeedbackModal'

interface TopNavigationProps {
  activeTab?: 'my-folder' | 'bookmarks' | 'marketplace'
  onTabChange?: (tab: 'my-folder' | 'bookmarks' | 'market-place') => void
}

export default function TopNavigation({ activeTab, onTabChange }: TopNavigationProps) {
  const { state, updateNavigation } = useCrossPlatformState()
  const device = useDevice()
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  // PC에서는 렌더링하지 않음 (PC는 기존 헤더 사용)
  if (device.isDesktop) return null

  const tabs = [
    {
      id: 'my-folder' as const,
      label: 'My Folder'
    },
    {
      id: 'bookmarks' as const,
      label: 'Bookmarks'
    },
    {
      id: 'market-place' as const,
      label: 'Market Place'
    }
  ]

  const handleTabPress = (tabId: 'my-folder' | 'bookmarks' | 'market-place') => {
    // 햅틱 피드백 (지원되는 경우)
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

    // 상태 업데이트
    updateNavigation({
      activeTab: tabId,
      // 탭 변경 시 선택된 폴더와 브레드크럼 초기화
      selectedFolderId: undefined,
      breadcrumbs: [],
      folderEntryMethod: undefined
    })

    // 부모 컴포넌트에 알림
    onTabChange?.(tabId)
  }

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* 헤더 영역 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 로고 - 클릭 시 My Folder로 이동 */}
          <div className="flex items-center">
            <button 
              onClick={() => handleTabPress('my-folder')}
              className="text-lg font-semibold tracking-wide text-black hover:opacity-80 transition-opacity"
            >
              KOOUK
            </button>
          </div>
          
          {/* 우측 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            {/* Feedback 버튼 */}
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              title="Feedback"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => {
          // 활성 탭 확인
          const appTabMap = {
            'my-folder': 'my-folder',
            'bookmarks': 'bookmarks', 
            'marketplace': 'market-place'
          }
          const isActive = activeTab ? appTabMap[activeTab] === tab.id : state.navigation.activeTab === tab.id

          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              className={`
                flex-1 px-4 py-3 text-sm font-medium relative
                border-b-2 transition-colors duration-200
                min-h-[44px] flex items-center justify-center
                ${isActive 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">
                {tab.label}
              </span>
              
              {/* 활성 상태 배경 효과 (미묘한) */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gray-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  )
}