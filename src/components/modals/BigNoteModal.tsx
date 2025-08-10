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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl relative"
        style={{
          backgroundColor: '#F8FAFC',
          border: '3px solid #1E293B',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* 노트북 스파이럴 바인딩 효과 */}
        <div className="absolute top-0 left-8 w-1 h-full bg-red-600 opacity-80"></div>
        <div className="absolute top-0 left-12 w-px h-full bg-red-400"></div>
        
        {/* 구멍 효과들 */}
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-white border-2 border-gray-300 rounded-full"
            style={{
              left: '24px',
              top: `${60 + i * 30}px`,
              transform: 'translateX(-50%)'
            }}
          />
        ))}
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📔</span>
            <h2 className="text-2xl font-bold text-slate-800">
              {editNote ? '노트 수정' : '새 노트 작성'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="pl-20 pr-8 pb-8 overflow-y-auto max-h-[70vh] relative">
          {/* 줄 효과 - 노트북 스타일 */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 25 }, (_, i) => (
              <div
                key={i}
                className="absolute w-full border-b border-blue-200"
                style={{ top: `${80 + i * 28}px` }}
              />
            ))}
          </div>
          
          {/* Title */}
          <input
            type="text"
            placeholder="제목을 입력하세요..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full mb-6 text-2xl font-bold border-none outline-none bg-transparent text-slate-800 placeholder-slate-400 relative z-10"
            autoFocus
          />

          {/* Content - 줄에 맞춘 텍스트 */}
          <textarea
            placeholder="여기에 노트를 작성하세요... ✏️"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-80 mb-6 resize-none border-none outline-none bg-transparent text-slate-700 placeholder-slate-400 relative z-10"
            style={{
              lineHeight: '28px',
              fontSize: '16px'
            }}
          />

          {/* Folder Selection */}
          <div className="mb-6 relative z-10">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              저장할 폴더:
            </label>
            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-500 shadow-sm"
            >
              <option value="">폴더를 선택하세요</option>
              {allFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.depth > 0 && '└ '.repeat(folder.depth)}
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 pb-8">
          <div className="text-sm text-slate-600">
            📊 {content.trim().split(/\s+/).filter(word => word.length > 0).length} 단어 • {content.trim().length} 글자
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || !content.trim() || !targetFolderId}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {editNote ? '수정하기' : '📝 저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}