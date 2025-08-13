'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Share2 } from 'lucide-react'
import { FolderItem } from '@/types/folder'

interface ShareFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onShare: (shareData: {
    title: string
    description: string
    category: string
  }) => void
  folder: FolderItem | null
}

const categories = [
  { value: 'lifestyle', label: 'Lifestyle', emoji: '✨' },
  { value: 'food', label: 'Food & Recipe', emoji: '🍳' },
  { value: 'travel', label: 'Travel', emoji: '🌍' },
  { value: 'study', label: 'Study & Learning', emoji: '📚' },
  { value: 'work', label: 'Work & Business', emoji: '💼' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'health', label: 'Health & Fitness', emoji: '💪' },
  { value: 'tech', label: 'Technology', emoji: '💻' },
  { value: 'investment', label: 'Investment', emoji: '📈' },
  { value: 'parenting', label: 'Parenting', emoji: '👶' }
]

export default function ShareFolderModal({ isOpen, onClose, onShare, folder }: ShareFolderModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('lifestyle')
  const [isSharing, setIsSharing] = useState(false)

  // Reset form when modal opens
  useState(() => {
    if (isOpen && folder) {
      setTitle(folder.name || 'Untitled Folder')
      setDescription(`Shared folder containing ${folder.children.length} items`)
      setSelectedCategory('lifestyle')
    }
  })

  if (!isOpen || !folder) return null

  const handleShare = async () => {
    if (!title.trim()) return

    setIsSharing(true)

    try {
      await onShare({
        title: title.trim(),
        description: description.trim() || `Shared folder containing ${folder.children.length} items`,
        category: selectedCategory
      })
      
      // Close modal and reset
      onClose()
      setTitle('')
      setDescription('')
      setSelectedCategory('lifestyle')
    } catch (error) {
      console.error('Failed to share folder:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
      >
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Share to Market Place</h2>
                <p className="text-sm text-gray-500">Make your folder public for others</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 폴더 정보 미리보기 */}
          <div className="p-4 bg-gray-50 rounded-xl mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">{folder.icon || '📁'}</span>
              <span className="font-medium text-gray-900">{folder.name || 'Untitled Folder'}</span>
            </div>
            <p className="text-sm text-gray-600">
              {folder.children.length} items • Last updated {new Date(folder.updatedAt || folder.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-5">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your shared folder a title"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what's in this folder and why it's useful"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`flex items-center gap-2 p-3 border rounded-lg text-left text-sm transition-all ${
                      selectedCategory === category.value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={selectedCategory === category.value ? 'opacity-80' : ''}>{category.emoji}</span>
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!title.trim() || isSharing}
              className="flex-1 py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? 'Sharing...' : 'Share to Market Place'}
            </button>
          </div>

          {/* 참고사항 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Once shared, other users will be able to see and import your folder. 
              You can always update or remove it later.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}