'use client'

import { motion } from 'framer-motion'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useDevice } from '@/hooks/useDevice'

interface TopNavigationProps {
  activeTab?: 'my-folder' | 'bookmarks' | 'marketplace'
  onTabChange?: (tab: 'my-folder' | 'bookmarks' | 'market-place') => void
}

export default function TopNavigation({ activeTab, onTabChange }: TopNavigationProps) {
  const { state, updateNavigation } = useCrossPlatformState()
  const device = useDevice()

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
    <div className="flex">
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
              px-3 py-2 text-sm font-medium relative
              transition-colors duration-200 rounded-md
              ${isActive 
                ? 'bg-gray-100 text-black' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }
            `}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">
              {tab.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}