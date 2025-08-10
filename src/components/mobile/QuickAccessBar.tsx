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
    <div className="bg-white border-b border-gray-100">
      <div className="px-4 py-3">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={16} color="#F59E0B" />
            <span className="text-sm font-medium text-gray-700">Quick Access</span>
            <span className="text-xs text-gray-500">({state.preferences.quickAccess.length}/6)</span>
          </div>
          
          <motion.button
            onClick={toggleEditMode}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {isEditing ? (
              <X size={14} color="#6B7280" />
            ) : (
              <Settings size={14} color="#6B7280" />
            )}
          </motion.button>
        </div>

        {/* Quick Access 항목들 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          <AnimatePresence mode="popLayout">
            {state.preferences.quickAccess.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative flex-shrink-0"
              >
                <motion.button
                  onClick={() => !isEditing && handleFolderSelect(item.id, item.name)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    isEditing 
                      ? 'border-red-200 bg-red-50' 
                      : state.navigation.selectedFolderId === item.id
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{ minWidth: '44px', minHeight: '44px' }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isEditing}
                >
                  <FolderOpen 
                    size={16} 
                    color={isEditing ? '#EF4444' : state.navigation.selectedFolderId === item.id ? '#3B82F6' : '#6B7280'} 
                  />
                  <div className="flex flex-col items-start">
                    <span 
                      className={`text-xs font-medium truncate max-w-[80px] ${
                        isEditing ? 'text-red-700' : state.navigation.selectedFolderId === item.id ? 'text-blue-700' : 'text-gray-700'
                      }`}
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    {!device.isMobile && (
                      <span className="text-[10px] text-gray-500">
                        {item.frequency}회 사용
                      </span>
                    )}
                  </div>
                </motion.button>

                {/* 편집 모드에서의 삭제 버튼 */}
                {isEditing && (
                  <motion.button
                    onClick={() => removeQuickAccessItem(item.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ×
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Quick Access 슬롯이 비어있는 경우 안내 */}
          {state.preferences.quickAccess.length < 6 && !isEditing && (
            <div className="flex items-center justify-center px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex-shrink-0">
              <span className="text-xs text-gray-500">폴더를 자주 사용하면 여기에 추가됩니다</span>
            </div>
          )}
        </div>

        {/* 편집 모드 안내 */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg"
          >
            <span className="text-xs text-red-700">
              × 버튼을 눌러 Quick Access에서 제거할 수 있습니다
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}