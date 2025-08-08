'use client'

import { useState, useEffect } from 'react'
import { StorageItem } from '@/app/page'

interface BigNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  editNote?: StorageItem | null
}

export default function BigNoteModal({ isOpen, onClose, onSave, editNote }: BigNoteModalProps) {
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
    if (!title.trim() || !content.trim()) return

    const wordCount = content.trim().split(/\s+/).length

    onSave({
      type: 'big_note',
      title: title.trim(),
      content: content.trim(),
      tags,
      wordCount
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {editNote ? 'Edit Document' : 'New Document'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Title */}
          <input
            type="text"
            placeholder="Document title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full mb-4 text-2xl font-bold border-none outline-none"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)'
            }}
            autoFocus
          />

          {/* Content */}
          <textarea
            placeholder="Start writing your document..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-64 mb-4 resize-none border rounded-xl p-4 outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
          />

          {/* Tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
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
                className="flex-1 px-3 py-2 rounded-lg border outline-none"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                onClick={addTag}
                className="px-4 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)'
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {content.trim() ? `${content.trim().split(/\s+/).length} words` : '0 words'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || !content.trim()}
              className="px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-card)'
              }}
            >
              {editNote ? 'Update' : 'Save'} Document
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}