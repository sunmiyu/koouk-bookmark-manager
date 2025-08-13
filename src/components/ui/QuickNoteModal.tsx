'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save } from 'lucide-react'

interface QuickNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, content: string) => void
  folderId?: string
  folderName?: string
}

export default function QuickNoteModal({
  isOpen,
  onClose,
  onSave,
  // folderId,
  folderName
}: QuickNoteModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      alert('Please enter a title or content')
      return
    }

    const finalTitle = title.trim() || 'Quick Note'
    onSave(finalTitle, content.trim())
    
    // Reset form
    setTitle('')
    setContent('')
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-yellow-50 rounded-xl shadow-xl w-full max-w-md border-2 border-yellow-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-lg font-semibold text-gray-900">Quick Note</h2>
            {folderName && (
              <span className="text-sm text-gray-500">→ {folderName}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-yellow-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Note title (optional)"
              className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
              autoFocus
            />
          </div>

          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your quick note here..."
              rows={6}
              className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none bg-white"
            />
          </div>

          {/* Tips */}
          <div className="text-xs text-gray-500">
            💡 Tip: Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to save quickly
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-yellow-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Note
          </button>
        </div>
      </motion.div>
    </div>
  )
}