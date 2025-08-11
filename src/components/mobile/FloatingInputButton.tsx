'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit, FileText } from 'lucide-react'
import { FolderItem, StorageItem } from '@/types/folder'
import UniversalInputBar from '@/components/ui/UniversalInputBar'

interface FloatingInputButtonProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onAddItem: (item: StorageItem, folderId: string) => void
  onFolderSelect: (folderId: string) => void
  onOpenMemo: () => void
  onOpenNote: () => void
}

export default function FloatingInputButton({
  folders,
  selectedFolderId,
  onAddItem,
  onFolderSelect,
  onOpenMemo,
  onOpenNote
}: FloatingInputButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const quickActions = [
    {
      icon: Plus,
      label: '입력',
      color: '#10B981',
      action: () => {
        setIsExpanded(!isExpanded)
      }
    },
    {
      icon: Edit,
      label: '메모',
      color: '#F59E0B',
      action: () => {
        onOpenMemo()
      }
    },
    {
      icon: FileText,
      label: '노트',
      color: '#3B82F6',
      action: () => {
        onOpenNote()
      }
    }
  ]

  // 항상 표시되는 버튼들이므로 별도의 클릭 핸들러 불필요

  return (
    <>
      {/* Backdrop - 입력바 열렸을 때만 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Expanded Input Bar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg"
            style={{ 
              paddingTop: 'env(safe-area-inset-top)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">새 항목 추가</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Universal Input Bar */}
            <div className="p-4">
              <UniversalInputBar
                folders={folders}
                selectedFolderId={selectedFolderId}
                onAddItem={(item, folderId) => {
                  onAddItem(item, folderId)
                  setIsExpanded(false)
                }}
                onFolderSelect={onFolderSelect}
                onOpenMemo={() => {
                  onOpenMemo()
                  setIsExpanded(false)
                }}
                onOpenNote={() => {
                  onOpenNote()
                  setIsExpanded(false)
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always Visible Action Buttons - 나란히 배치 */}
      <div className="fixed bottom-6 right-4 z-40">
        <div className="flex gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={action.action}
              className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
              style={{ backgroundColor: action.color }}
              title={action.label}
            >
              <action.icon size={20} color="white" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* 메인 플로팅 버튼 제거 - 세 개 버튼이 나란히 표시됨 */}
    </>
  )
}