'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Type, Bold, Italic, List, ListOrdered } from 'lucide-react'

interface BigNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, content: string) => void
  folderId?: string
  folderName?: string
}

export default function BigNoteModal({
  isOpen,
  onClose,
  onSave,
  // folderId,
  folderName
}: BigNoteModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      alert('Please enter a title or content')
      return
    }

    const finalTitle = title.trim() || 'Big Note'
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
        className="bg-pink-50 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-pink-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h2 className="text-lg font-semibold text-gray-900">Long Form Note</h2>
            {folderName && (
              <span className="text-sm text-gray-500">→ {folderName}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(90vh-140px)]">
          {/* Title */}
          <div className="p-4 border-b border-pink-200">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Note title..."
              className="w-full px-0 py-2 text-xl font-semibold border-none focus:outline-none bg-transparent placeholder-gray-400"
              autoFocus
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 p-3 border-b border-pink-200 bg-pink-25">
            <button className="p-2 hover:bg-pink-100 rounded transition-colors" title="Bold">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-pink-100 rounded transition-colors" title="Italic">
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-pink-300 mx-1" />
            <button className="p-2 hover:bg-pink-100 rounded transition-colors" title="Bullet List">
              <List className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-pink-100 rounded transition-colors" title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-pink-300 mx-1" />
            <button className="p-2 hover:bg-pink-100 rounded transition-colors" title="Heading">
              <Type className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start writing your detailed note here...

You can write multiple paragraphs, create lists, and organize your thoughts in a structured way."
              className="w-full h-full border-none focus:outline-none resize-none bg-transparent placeholder-gray-400 leading-relaxed"
            />
          </div>

          {/* Word Count */}
          <div className="px-4 pb-2">
            <div className="text-xs text-gray-500 text-right">
              {content.split(/\s+/).filter(word => word.length > 0).length} words • {content.length} characters
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-pink-200">
          <div className="text-xs text-gray-500">
            💡 Tip: Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to save quickly
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-pink-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              Save Note
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}