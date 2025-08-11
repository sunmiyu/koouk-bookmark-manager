'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Settings, X, Star } from 'lucide-react'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useDevice } from '@/hooks/useDevice'
import { useState } from 'react'

interface QuickAccessBarProps {
  onFolderSelect?: (folderId: string, folderName: string) => void
}

export default function QuickAccessBar({ onFolderSelect }: QuickAccessBarProps) {
  const { state, updateQuickAccess, updateNavigation, updatePreferences } = useCrossPlatformState()
  const device = useDevice()
  const [isEditing, setIsEditing] = useState(false)

  // Quick Access 항목이 없으면 렌더링하지 않음
  if (!state.preferences.quickAccess.length) return null

  // 폴더 선택 핸들러
  const handleFolderSelect = (folderId: string, folderName: string) => {
    // 햅틱 피드백
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

    // 빈도수 업데이트
    updateQuickAccess(folderId, folderName)

    // 네비게이션 상태 업데이트
    updateNavigation({
      selectedFolderId: folderId,
      folderEntryMethod: 'quick-access',
      // Quick Access를 통한 진입이므로 브레드크럼은 해당 폴더만 포함
      breadcrumbs: [{ id: folderId, name: folderName, type: 'folder' }]
    })

    // 부모 컴포넌트에 알림
    onFolderSelect?.(folderId, folderName)
  }

  // Quick Access 항목 제거
  const removeQuickAccessItem = (folderId: string) => {
    const updatedQuickAccess = state.preferences.quickAccess.filter(item => item.id !== folderId)
    updatePreferences({ quickAccess: updatedQuickAccess })
  }

  // 편집 모드 토글
  const toggleEditMode = () => {
    setIsEditing(!isEditing)
    if ('vibrate' in navigator) {
      navigator.vibrate(15)
    }
  }

  return (
    <div className="bg-white">
      <div className="px-4 py-3">
        {/* 헤더 - 더 심플하게 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
            </div>
            <span className="text-sm font-semibold text-gray-800">즐겨찾기</span>
          </div>
          
          <motion.button
            onClick={toggleEditMode}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {isEditing ? (
              <X size={16} color="#6B7280" />
            ) : (
              <Settings size={16} color="#6B7280" />
            )}
          </motion.button>
        </div>

        {/* Quick Access 항목들 - 더 큰 터치 영역 */}
        <div className="grid grid-cols-2 gap-2">
          <AnimatePresence mode="popLayout">
            {state.preferences.quickAccess.slice(0, 6).map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <motion.button
                  onClick={() => !isEditing && handleFolderSelect(item.id, item.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isEditing 
                      ? 'bg-red-50 border-2 border-red-200' 
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  whileTap={{ scale: 0.97 }}
                  disabled={isEditing}
                  style={{ minHeight: '56px' }}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderOpen 
                      size={18} 
                      color={isEditing ? '#EF4444' : '#3B82F6'} 
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span 
                      className={`text-sm font-medium truncate block ${
                        isEditing ? 'text-red-700' : 'text-gray-800'
                      }`}
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </div>
                </motion.button>

                {/* 편집 모드에서의 삭제 버튼 */}
                {isEditing && (
                  <motion.button
                    onClick={() => removeQuickAccessItem(item.id)}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={12} />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 편집 모드 안내 */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl"
          >
            <span className="text-sm text-amber-800">
              ❌ 버튼을 눌러 즐겨찾기에서 제거할 수 있습니다
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}