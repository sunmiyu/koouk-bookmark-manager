'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Download, Copy, FileText } from 'lucide-react'
import { StorageItem } from '@/types/folder'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  item: StorageItem | null
}

export default function DocumentModal({ isOpen, onClose, item }: DocumentModalProps) {
  const [isCopied, setIsCopied] = useState(false)

  // 모달이 열릴 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !item) return null

  const handleCopyContent = async () => {
    if ('content' in item && item.content) {
      try {
        await navigator.clipboard.writeText(item.content)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy content:', error)
      }
    }
  }

  const handleDownload = () => {
    if ('content' in item && item.content) {
      const blob = new Blob([item.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${item.name.replace(/\s+/g, '_')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
              <p className="text-sm text-gray-500">
                Document • {new Date(item.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 액션 버튼들 */}
            <button
              onClick={handleCopyContent}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Copy content"
            >
              <Copy size={18} className={isCopied ? 'text-green-600' : 'text-gray-600'} />
            </button>

            <button
              onClick={handleDownload}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Download as text file"
            >
              <Download size={18} className="text-gray-600" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {'content' in item && item.content ? (
            <div className="prose prose-gray max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-lg border">
                {item.content}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
              <p className="text-gray-500">This document appears to be empty or the content could not be loaded.</p>
            </div>
          )}
        </div>

        {/* 복사 성공 알림 */}
        {isCopied && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg text-sm">
            ✓ Copied to clipboard
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}