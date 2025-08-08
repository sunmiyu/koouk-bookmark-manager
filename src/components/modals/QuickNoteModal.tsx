'use client'

import { useState, useEffect } from 'react'
import { StorageItem } from '@/types/folder'

interface QuickNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  editNote?: StorageItem | null
}

export default function QuickNoteModal({ isOpen, onClose, onSave, editNote }: QuickNoteModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title)
      setContent(editNote.content)
      setTags(editNote.tags)
    } else {
      setTitle('')
      setContent('')
      setTags([])
    }
  }, [editNote])

  const handleSave = () => {
    if (!content.trim()) return

    onSave({
      type: 'quick_note',
      title: title.trim() || 'Quick Memo',
      content: content.trim(),
      tags
    })

    // Reset form
    setTitle('')
    setContent('')
    setTags([])
    setTagInput('')
    onClose()
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave()
    }
  }

  if (!isOpen) return null

  // 포스트잇 컬러 (BigNoteCard에서 사용하는 것과 동일)
  const colors = [
    { bg: '#FFF9C4', border: '#F9A825' }, // 노란색
    { bg: '#E8F5E8', border: '#66BB6A' }, // 연한 초록
    { bg: '#E3F2FD', border: '#42A5F5' }, // 연한 파란
    { bg: '#FCE4EC', border: '#EC407A' }, // 연한 분홍
    { bg: '#F3E5F5', border: '#AB47BC' }, // 연한 보라
    { bg: '#FFF3E0', border: '#FFA726' }, // 연한 주황
  ]
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl transform rotate-1"
        style={{
          backgroundColor: randomColor.bg,
          border: `3px solid ${randomColor.border}`,
          minHeight: '400px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: randomColor.border }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <h2 className="text-lg font-semibold" style={{ color: '#2D3748' }}>
              {editNote ? 'Edit Memo' : 'Quick Memo'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Optional Title */}
          <input
            type="text"
            placeholder="Title (optional)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full mb-3 text-base font-medium border-none outline-none bg-transparent"
            style={{ color: '#2D3748' }}
          />

          {/* Content */}
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-32 resize-none border-none outline-none bg-transparent text-sm leading-relaxed"
            style={{ color: '#4A5568' }}
            autoFocus
          />

          {/* Tags */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    color: randomColor.border
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                className="flex-1 px-2 py-1 rounded text-xs border-none outline-none"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  color: '#2D3748'
                }}
              />
              <button
                onClick={addTag}
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  color: randomColor.border
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t-2" style={{ borderColor: randomColor.border }}>
          <div className="text-xs" style={{ color: '#718096' }}>
            {content.trim().length}/200 chars
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded text-sm font-medium"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: '#718096'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="px-3 py-1 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: randomColor.border,
                color: 'white'
              }}
            >
              {editNote ? 'Update' : 'Save'}
            </button>
          </div>
        </div>

        {/* 포스트잇 상단 구멍 효과 */}
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '50%'
          }}
        />
      </div>
    </div>
  )
}