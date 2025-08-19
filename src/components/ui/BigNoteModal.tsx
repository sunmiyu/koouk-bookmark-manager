'use client'

import { useState, useEffect } from 'react'
import { X, Save, Edit3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderItem } from '@/types/folder'
import { useDevice } from '@/hooks/useDevice'

interface BigNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, content: string, folderId: string) => void
  allFolders: FolderItem[]
  selectedFolderId?: string
  editNote?: {
    id: string
    title: string
    content: string
    folderId: string
  }
  // New prop for drawer mode
  variant?: 'modal' | 'drawer'
}

export default function BigNoteModal({
  isOpen,
  onClose,
  onSave,
  allFolders,
  selectedFolderId,
  editNote,
  variant = 'modal'
}: BigNoteModalProps) {
  const device = useDevice()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetFolderId, setTargetFolderId] = useState(selectedFolderId || '')

  useEffect(() => {
    if (isOpen) {
      if (editNote) {
        setTitle(editNote.title)
        setContent(editNote.content)
        setTargetFolderId(editNote.folderId)
      } else {
        setTitle('')
        setContent('')
        setTargetFolderId(selectedFolderId || allFolders[0]?.id || '')
      }
    }
  }, [isOpen, editNote, selectedFolderId, allFolders])

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !targetFolderId) return
    
    onSave(title.trim(), content.trim(), targetFolderId)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave()
    }
  }

  // Auto-detect variant based on screen size if not explicitly set
  const shouldUseDrawer = variant === 'drawer' || (!device.isMobile && !device.isTablet && typeof window !== 'undefined' && window.innerWidth >= 1280)
  const isDrawerMode = shouldUseDrawer && variant !== 'modal'

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal/Drawer Container */}
          <motion.div
            className={
              isDrawerMode
                ? "fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
                : "fixed inset-0 flex items-center justify-center z-50 p-4"
            }
            initial={
              isDrawerMode
                ? { x: '100%' }
                : { opacity: 0, scale: 0.95 }
            }
            animate={
              isDrawerMode
                ? { x: 0 }
                : { opacity: 1, scale: 1 }
            }
            exit={
              isDrawerMode
                ? { x: '100%' }
                : { opacity: 0, scale: 0.95 }
            }
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={
              isDrawerMode
                ? "w-full h-full flex flex-col"
                : "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            }>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  {isDrawerMode && <Edit3 size={18} className="text-gray-600" />}
                  <h2 className={isDrawerMode ? "text-sm font-medium text-gray-900" : "text-lg font-semibold text-gray-900"}>
                    {editNote ? 'Edit Memo' : (isDrawerMode ? 'Quick Notes' : 'Create New Memo')}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Title Input - Hidden in drawer mode for quick notes */}
                {!isDrawerMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter memo title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                )}

                {/* Folder Selection - Compact in drawer mode */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isDrawerMode ? 'text-xs' : ''}`}>
                    Save to Folder
                  </label>
                  <select
                    value={targetFolderId}
                    onChange={(e) => setTargetFolderId(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDrawerMode ? 'text-sm' : ''}`}
                  >
                    {allFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Textarea */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isDrawerMode ? 'text-xs' : ''}`}>
                    {isDrawerMode ? 'Quick Notes' : 'Content'}
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      isDrawerMode 
                        ? "Start writing your thoughts...\n\n• Quick notes\n• Meeting notes\n• Ideas & brainstorms\n• Todo lists\n\nAuto-saves as you type!"
                        : "Write your memo content here..."
                    }
                    rows={isDrawerMode ? 16 : 12}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${isDrawerMode ? 'text-sm border-none' : ''}`}
                    onKeyDown={handleKeyDown}
                    style={isDrawerMode ? { border: 'none', outline: 'none', boxShadow: 'none' } : {}}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={`flex items-center gap-3 p-4 border-t border-gray-200 ${isDrawerMode ? 'justify-between bg-gray-50' : 'justify-end'}`}>
                {isDrawerMode && (
                  <div className="text-xs text-gray-500">
                    {content.length} characters
                    {!targetFolderId && ' • Select a folder to save'}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className={`px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${isDrawerMode ? 'text-xs px-3 py-1.5' : ''}`}
                  >
                    {isDrawerMode ? 'Close' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={(!content.trim() || !targetFolderId) || (!isDrawerMode && !title.trim())}
                    className={`flex items-center gap-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${isDrawerMode ? 'text-xs px-3 py-1.5' : 'px-4 py-2'}`}
                  >
                    <Save className={isDrawerMode ? "w-3 h-3" : "w-4 h-4"} />
                    {editNote ? 'Update' : (isDrawerMode ? 'Save & Close' : 'Save')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}