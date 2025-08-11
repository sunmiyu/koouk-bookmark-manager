'use client'

import { motion } from 'framer-motion'
import { FolderOpen, Bookmark, ShoppingBag } from 'lucide-react'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useDevice } from '@/hooks/useDevice'

interface BottomTabNavigationProps {
  activeTab?: 'my-folder' | 'bookmarks' | 'marketplace'
  onTabChange?: (tab: 'my-folder' | 'bookmarks' | 'market-place') => void
}

export default function BottomTabNavigation({ activeTab, onTabChange }: BottomTabNavigationProps) {
  const { state, updateNavigation } = useCrossPlatformState()
  const device = useDevice()

  // PC에서는 렌더링하지 않음
  if (device.isDesktop) return null

  const tabs = [
    {
      id: 'my-folder' as const,
      label: 'My Folder',
      icon: FolderOpen,
      activeColor: '#3B82F6',
      bgColor: '#EFF6FF'
    },
    {
      id: 'bookmarks' as const,
      label: 'Bookmarks',
      icon: Bookmark,
      activeColor: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    {
      id: 'market-place' as const,
      label: 'Market Place',
      icon: ShoppingBag,
      activeColor: '#10B981',
      bgColor: '#ECFDF5'
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
    <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          // App.tsx의 activeTab 상태를 우선 사용
          const appTabMap = {
            'my-folder': 'my-folder',
            'bookmarks': 'bookmarks', 
            'marketplace': 'market-place'
          }
          const isActive = activeTab ? appTabMap[activeTab] === tab.id : state.navigation.activeTab === tab.id
          const Icon = tab.icon

          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              className="flex items-center justify-center min-h-[44px] px-3 py-1.5 relative"
              whileTap={{ scale: 0.95 }}
              style={{ minWidth: '44px' }} // 최소 터치 영역 보장
            >
              {/* 활성 상태 배경 */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: tab.bgColor }}
                  layoutId="activeTabBackground"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                />
              )}
              
              {/* 라벨만 표시 (아이콘 제거) */}
              <span 
                className={`text-sm font-medium relative z-10 ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
              
              {/* 활성 인디케이터 언더라인 */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 h-0.5 w-8 rounded-full"
                  style={{ backgroundColor: tab.activeColor }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.1 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      
      {/* 안전 영역 패딩 (iPhone 등) */}
      <div className="h-safe-area-bottom bg-white" />
    </div>
  )
}