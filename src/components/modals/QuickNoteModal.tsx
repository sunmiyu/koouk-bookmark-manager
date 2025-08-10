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
        className="w-full max-w-md rounded-2xl shadow-2xl relative"
        style={{
          backgroundColor: '#FEF3C7',
          border: '3px solid #F59E0B',
          minHeight: '500px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* 포스트잇 상단 구멍 효과 */}
        <div className="absolute top-2 left-4 w-3 h-3 bg-black bg-opacity-10 rounded-full"></div>
        <div className="absolute top-2 right-4 w-3 h-3 bg-black bg-opacity-10 rounded-full"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <h2 className="text-lg font-bold text-amber-800">
              {editNote ? '메모 수정' : '메모 작성'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-amber-200 rounded-full transition-colors text-amber-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          {/* Title */}
          <input
            type="text"
            placeholder="제목 (선택사항)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full mb-4 text-lg font-bold border-none outline-none bg-transparent text-amber-900 placeholder-amber-600"
          />

          {/* Content - 포스트잇 스타일 */}
          <textarea
            placeholder="무엇을 메모하고 싶으신가요? ✨"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-40 resize-none border-none outline-none bg-transparent text-amber-800 placeholder-amber-500 leading-relaxed"
            style={{ 
              fontSize: '16px',
              lineHeight: '1.8'
            }}
            autoFocus
          />

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 pb-6">
          <div className="flex items-center gap-3">
            {/* Folder Selection */}
            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="px-3 py-2 bg-amber-50 border-2 border-amber-200 rounded-lg text-amber-800 focus:outline-none focus:border-amber-400 text-sm"
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
              className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-lg font-medium text-sm transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || !targetFolderId}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {editNote ? '수정하기' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}