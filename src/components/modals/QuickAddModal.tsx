'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Link, FileText, Image, Video } from 'lucide-react'
import { StorageItem } from '@/types/folder'
import { createStorageItem } from '@/types/folder'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: StorageItem) => void
  folderId: string
}

export default function QuickAddModal({ isOpen, onClose, onSave, folderId }: QuickAddModalProps) {
  const [selectedType, setSelectedType] = useState<'url' | 'memo' | 'document' | 'image' | 'video' | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleReset = () => {
    setSelectedType(null)
    setTitle('')
    setContent('')
    setIsLoading(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleSave = async () => {
    if (!selectedType || !content.trim()) return

    setIsLoading(true)

    try {
      let finalTitle = title.trim()
      const finalContent = content.trim()

      // URL 타입일 때 자동 메타데이터 추출 시도
      if (selectedType === 'url' && !finalTitle) {
        try {
          // 간단한 도메인 추출로 제목 생성
          const url = new URL(finalContent)
          finalTitle = url.hostname.replace('www.', '')
        } catch {
          finalTitle = 'Website'
        }
      }

      const newItem = createStorageItem(
        finalTitle || `New ${selectedType}`,
        selectedType,
        finalContent,
        folderId
      )

      onSave(newItem)
      handleClose()
    } catch (error) {
      console.error('Failed to save item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      
      // URL 감지
      if (text.startsWith('http://') || text.startsWith('https://')) {
        setSelectedType('url')
        setContent(text)
        
        // 도메인에서 제목 추출
        try {
          const url = new URL(text)
          setTitle(url.hostname.replace('www.', ''))
        } catch {
          setTitle('Website')
        }
      } else {
        // 일반 텍스트는 메모로
        setSelectedType('memo')
        setContent(text)
        setTitle('Pasted Note')
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
  }

  const addTypes = [
    {
      type: 'url' as const,
      icon: Link,
      title: 'Website Link',
      description: 'Save a website or article',
      color: 'bg-blue-100 text-blue-600',
      placeholder: 'https://example.com'
    },
    {
      type: 'memo' as const,
      icon: FileText,
      title: 'Quick Memo',
      description: 'Write a quick note or idea',
      color: 'bg-green-100 text-green-600',
      placeholder: 'Write your memo here...'
    },
    {
      type: 'document' as const,
      icon: FileText,
      title: 'Long Document',
      description: 'Create a detailed document',
      color: 'bg-purple-100 text-purple-600',
      placeholder: 'Start writing your document...'
    },
    {
      type: 'image' as const,
      icon: Image,
      title: 'Image',
      description: 'Add an image or photo',
      color: 'bg-orange-100 text-orange-600',
      placeholder: 'Image URL or description'
    },
    {
      type: 'video' as const,
      icon: Video,
      title: 'Video',
      description: 'Save a video link',
      color: 'bg-red-100 text-red-600',
      placeholder: 'Video URL'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
      >
        {!selectedType ? (
          // 타입 선택 화면
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Item</h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 클립보드에서 붙여넣기 */}
            <button
              onClick={handlePasteFromClipboard}
              className="w-full mb-6 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">📋</span>
                </div>
                <div className="text-sm font-medium text-gray-700">Paste from Clipboard</div>
                <div className="text-xs text-gray-500 mt-1">Auto-detect URLs and text</div>
              </div>
            </button>

            {/* 타입 선택 그리드 */}
            <div className="space-y-3">
              {addTypes.map((addType) => (
                <button
                  key={addType.type}
                  onClick={() => setSelectedType(addType.type)}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${addType.color}`}>
                    <addType.icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{addType.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{addType.description}</div>
                  </div>
                  
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // 콘텐츠 입력 화면
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedType(null)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h2 className="text-lg font-semibold text-gray-900">
                  {addTypes.find(t => t.type === selectedType)?.title}
                </h2>
              </div>
              
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 제목 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${addTypes.find(t => t.type === selectedType)?.title} title`}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 콘텐츠 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedType === 'url' ? 'URL' : 'Content'}
                </label>
                
                {selectedType === 'document' ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={addTypes.find(t => t.type === selectedType)?.placeholder}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : selectedType === 'memo' ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={addTypes.find(t => t.type === selectedType)?.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <input
                    type={selectedType === 'url' ? 'url' : 'text'}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={addTypes.find(t => t.type === selectedType)?.placeholder}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* URL 미리보기 */}
              {selectedType === 'url' && content.trim() && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Preview</div>
                  <div className="text-sm text-gray-700 truncate">{content}</div>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!content.trim() || isLoading}
                className="flex-1 py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}