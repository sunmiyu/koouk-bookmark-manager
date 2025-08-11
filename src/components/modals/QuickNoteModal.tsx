'use client'

import { useState, useEffect } from 'react'
import { StorageItem, FolderItem } from '@/types/folder'

interface QuickNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>, folderId: string) => void
  editNote?: StorageItem | null
  folders: FolderItem[]
  selectedFolderId?: string
}

export default function QuickNoteModal({ isOpen, onClose, onSave, editNote, folders, selectedFolderId }: QuickNoteModalProps) {
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
    if (!content.trim() || !targetFolderId) return

    onSave({
      type: 'memo',
      name: title.trim() || 'Quick Memo',
      content: content.trim(),
      folderId: targetFolderId,
      tags
    }, targetFolderId)

    // Reset form
    setTitle('')
    setContent('')
    setTags([])
    setTargetFolderId(selectedFolderId || '')
    onClose()
  }

  // Removed unused functions addTag and removeTag

  // 모든 폴더를 재귀적으로 수집 (하위 폴더 포함)
  const getAllFolders = (folders: FolderItem[], depth: number = 0): Array<FolderItem & { depth: number }> => {
    const result: Array<FolderItem & { depth: number }> = []
    
    for (const folder of folders) {
      result.push({ ...folder, depth })
      
      // 하위 폴더들 수집
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

  // Removed unused color variables

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className="w-full max-w-md rounded-xl shadow-lg relative bg-white"
        style={{
          border: '1px solid #E5E7EB',
          minHeight: '400px',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)'
        }}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗒️</span>
            <h2 className="text-lg font-semibold text-gray-800">
              {editNote ? '메모 수정' : '빠른 메모'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pb-2 flex-1">
          {/* Title */}
          <input
            type="text"
            placeholder="제목 (선택사항)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full mb-4 text-base font-medium border-none outline-none bg-transparent text-gray-800 placeholder-gray-400"
          />

          {/* Content */}
          <textarea
            placeholder="빠르게 메모하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-48 resize-none border-none outline-none bg-transparent text-gray-700 placeholder-gray-400"
            style={{ 
              fontSize: '14px',
              lineHeight: '1.6'
            }}
            autoFocus
          />
        </div>

        {/* Footer - 제일 하단으로 이동 */}
        <div className="border-t border-gray-100 px-6 py-4 mt-auto">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {content.trim().length} 글자
            </div>
            <div className="flex items-center gap-3">
              {/* Folder Selection */}
              <select
                value={targetFolderId}
                onChange={(e) => setTargetFolderId(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-500 text-sm"
              >
                <option value="">폴더 선택</option>
                {allFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.depth > 0 && '└ '.repeat(folder.depth)}
                    {folder.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!content.trim() || !targetFolderId}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editNote ? '수정' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}