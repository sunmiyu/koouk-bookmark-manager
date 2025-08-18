'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { FolderItem } from '@/types/folder'

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
}

export default function BigNoteModal({
  isOpen,
  onClose,
  onSave,
  allFolders,
  selectedFolderId,
  editNote
}: BigNoteModalProps) {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {editNote ? 'Edit Memo' : 'Create New Memo'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Title Input */}
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

          {/* Folder Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Save to Folder
            </label>
            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your memo content here..."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || !targetFolderId}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {editNote ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}