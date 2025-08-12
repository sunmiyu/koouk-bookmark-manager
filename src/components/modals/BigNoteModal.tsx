'use client'

import { useState, useEffect } from 'react'
import { StorageItem, FolderItem } from '@/types/folder'

interface BigNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>, folderId: string) => void
  editNote?: StorageItem | null
  folders: FolderItem[]
  selectedFolderId?: string
}

export default function BigNoteModal({ isOpen, onClose, onSave, editNote, folders, selectedFolderId }: BigNoteModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [targetFolderId, setTargetFolderId] = useState(selectedFolderId || '')

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.name)
      setContent(editNote.content)
      setTags(editNote.tags)
    } else {
      setTitle('')
      setContent('')
      setTags([])
    }
  }, [editNote])

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !targetFolderId) return

    const wordCount = content.trim().split(/\s+/).length

    onSave({
      type: 'document',
      name: title.trim(),
      content: content.trim(),
      folderId: targetFolderId,
      tags,
      metadata: { wordCount }
    }, targetFolderId)

    // Reset form
    setTitle('')
    setContent('')
    setTags([])
    setTargetFolderId(selectedFolderId || '')
    onClose()
  }

  // Removed unused functions addTag and removeTag

  // Recursively collect all folders (including subfolders)
  const getAllFolders = (folders: FolderItem[], depth: number = 0): Array<FolderItem & { depth: number }> => {
    const result: Array<FolderItem & { depth: number }> = []
    
    for (const folder of folders) {
      result.push({ ...folder, depth })
      
      // Collect subfolders
      const subfolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
      if (subfolders.length > 0) {
        result.push(...getAllFolders(subfolders, depth + 1))
      }
    }
    
    return result
  }

  const allFolders = getAllFolders(folders)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl relative bg-white"
        style={{
          border: '1px solid #E5E7EB',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <h2 className="text-xl font-semibold text-gray-800">
              {editNote ? 'Edit Note' : 'Create New Note'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pb-0 overflow-y-auto max-h-[70vh] relative">
          {/* Notebook lines effect */}
          <div className="absolute inset-0 pointer-events-none pl-8 pr-8">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="absolute w-full border-b border-blue-100 opacity-50"
                style={{ top: `${120 + i * 24}px`, left: '32px', right: '32px' }}
              />
            ))}
          </div>
          
          {/* Title */}
          <input
            type="text"
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full mb-6 text-xl font-semibold border-none outline-none bg-transparent text-gray-800 placeholder-gray-400 relative z-10"
            autoFocus
          />

          {/* Content - Text aligned to lines */}
          <textarea
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-80 mb-6 resize-none border-none outline-none bg-transparent text-gray-700 placeholder-gray-400 relative z-10"
            style={{
              lineHeight: '24px',
              fontSize: '14px'
            }}
          />

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {content.trim().split(/\s+/).filter(word => word.length > 0).length} words • {content.trim().length} characters
            </div>
            <div className="flex items-center gap-3">
              {/* Folder Selection */}
              <select
                value={targetFolderId}
                onChange={(e) => setTargetFolderId(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-500 text-sm"
              >
                <option value="">Select Folder</option>
                {allFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.depth > 0 && '└ '.repeat(folder.depth)}
                    {folder.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim() || !targetFolderId}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {editNote ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}