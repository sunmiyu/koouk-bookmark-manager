'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3 } from 'lucide-react'
import { useDevice } from '@/hooks/useDevice'
import BigNoteModal from './BigNoteModal'
import { FolderItem } from '@/types/folder'

interface NotepadEdgeTabProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onSave: (title: string, content: string, folderId: string) => void
}

export default function NotepadEdgeTab({ folders, selectedFolderId, onSave }: NotepadEdgeTabProps) {
  const [isNotepadOpen, setIsNotepadOpen] = useState(false)
  const device = useDevice()

  // Only show edge tab on wide screens (lg and above)
  const showEdgeTab = !device.isMobile && !device.isTablet

  if (!showEdgeTab) return null

  return (
    <>
      {/* Edge Tab - Always visible on right edge */}
      <motion.div
        className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40"
        style={{ marginRight: isNotepadOpen ? '384px' : '0px' }}
        animate={{ marginRight: isNotepadOpen ? '384px' : '0px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <motion.button
          onClick={() => setIsNotepadOpen(true)}
          className="bg-gray-900 text-white p-3 rounded-l-xl shadow-lg hover:bg-gray-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Open Quick Notes"
        >
          <Edit3 size={20} />
        </motion.button>
      </motion.div>

      {/* Notepad Drawer using BigNoteModal */}
      <BigNoteModal
        isOpen={isNotepadOpen}
        onClose={() => setIsNotepadOpen(false)}
        onSave={(title, content, folderId) => {
          // For drawer mode, auto-generate title if not provided
          const autoTitle = title || `Note ${new Date().toLocaleDateString()}`
          onSave(autoTitle, content, folderId)
          setIsNotepadOpen(false)
        }}
        allFolders={folders}
        selectedFolderId={selectedFolderId}
        variant="drawer"
      />
    </>
  )
}