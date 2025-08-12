'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, FileText } from 'lucide-react'
import { FolderItem, StorageItem } from '@/types/folder'
import UniversalInputBar from '@/components/ui/UniversalInputBar'
import { useDevice } from '@/hooks/useDevice'

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
  const device = useDevice()
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Don't render on desktop (PC has bottom UniversalInputBar)
  if (device.isDesktop) return null

  const quickActions = [
    {
      icon: Plus,
      label: 'Input',
      color: '#10B981',
      action: () => {
        setIsExpanded(!isExpanded)
      }
    },
    {
      icon: Edit,
      label: 'Memo',
      color: '#F59E0B',
      action: () => {
        onOpenMemo()
      }
    },
    {
      icon: FileText,
      label: 'Note',
      color: '#3B82F6',
      action: () => {
        onOpenNote()
      }
    }
  ]

  // Always visible buttons, no separate click handlers needed

  return (
    <>
      {/* Backdrop - Only when input bar is open */}
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

      {/* PC-style bottom input bar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
            style={{ 
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Universal Input Bar - PC style */}
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

      {/* Always Visible Action Buttons - Side by side layout */}
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

      {/* Main floating button removed - Three buttons displayed side by side */}
    </>
  )
}