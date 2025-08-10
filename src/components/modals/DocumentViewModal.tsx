'use client'

import { useState } from 'react'
import { StorageItem } from '@/types/folder'
import { X, Edit3, Copy, Trash2, Clock, FileText, StickyNote } from 'lucide-react'

interface DocumentViewModalProps {
  isOpen: boolean
  onClose: () => void
  item: StorageItem | null
  onEdit?: (item: StorageItem) => void
  onDelete?: (itemId: string) => void
}

export default function DocumentViewModal({ 
  isOpen, 
  onClose, 
  item,
  onEdit,
  onDelete 
}: DocumentViewModalProps) {
  const [isCopied, setIsCopied] = useState(false)

  if (!isOpen || !item) return null

  const isMemo = item.type === 'memo'
  const isDocument = item.type === 'document'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(item)
      onClose()
    }
  }

  const handleDelete = () => {
    if (onDelete && confirm(`"${item.name}"을(를) 삭제하시겠습니까?`)) {
      onDelete(item.id)
      onClose()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getWordCount = () => {
    if (item.metadata?.wordCount) return item.metadata.wordCount
    return item.content.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getCharacterCount = () => {
    return item.content.trim().length
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      {/* 메모용 스타일 */}
      {isMemo && (
        <div 
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl relative"
          style={{
            backgroundColor: '#FEF3C7',
            border: '3px solid #F59E0B',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* 포스트잇 상단 구멍 효과 */}
          <div className="absolute top-2 left-4 w-3 h-3 bg-black bg-opacity-10 rounded-full"></div>
          <div className="absolute top-2 right-4 w-3 h-3 bg-black bg-opacity-10 rounded-full"></div>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-2">
              <StickyNote className="w-6 h-6 text-amber-700" />
              <h2 className="text-xl font-bold text-amber-800">
                {item.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-amber-200 rounded-full transition-colors text-amber-700"
                title="Copy content"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-amber-200 rounded-full transition-colors text-amber-700"
                title="Edit memo"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-200 rounded-full transition-colors text-red-600"
                title="Delete memo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-amber-200 rounded-full transition-colors text-amber-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <p className="text-amber-800 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            </div>

            {/* Meta info */}
            <div className="flex items-center justify-between text-sm text-amber-700">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(item.updatedAt)}
                </span>
                <span>{getCharacterCount()} 글자</span>
              </div>
              {isCopied && (
                <span className="text-green-600 font-medium">복사됨!</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 문서용 스타일 */}
      {isDocument && (
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
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white border-2 border-gray-300 rounded-full"
              style={{
                left: '24px',
                top: `${60 + i * 40}px`,
                transform: 'translateX(-50%)'
              }}
            />
          ))}
          
          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-slate-700" />
              <h2 className="text-2xl font-bold text-slate-800">
                {item.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                title="Copy content"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                title="Edit document"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-200 rounded-full transition-colors text-red-600"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="pl-20 pr-8 pb-8 overflow-y-auto max-h-[calc(90vh-200px)] relative">
            {/* 줄 효과 - 노트북 스타일 */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-full border-b border-blue-200"
                  style={{ top: `${i * 28}px` }}
                />
              ))}
            </div>
            
            <div className="bg-white rounded-lg p-6 relative z-10 shadow-sm">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                {item.content}
              </p>
            </div>

            {/* Meta info */}
            <div className="flex items-center justify-between text-sm text-slate-600 mt-4 relative z-10">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(item.updatedAt)}
                </span>
                <span>📊 {getWordCount()} 단어 • {getCharacterCount()} 글자</span>
              </div>
              {isCopied && (
                <span className="text-green-600 font-medium">복사됨!</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}