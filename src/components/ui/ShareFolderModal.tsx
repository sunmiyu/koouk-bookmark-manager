'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, FileText, Video, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import Image from 'next/image'
import { FolderItem } from '@/types/folder'
import { ShareCategory } from '@/types/share'

interface ShareFolderModalProps {
  isOpen: boolean
  onClose: () => void
  folder: FolderItem
  onShareFolder: (folderData: SharedFolderData) => void
}

export interface SharedFolderData {
  title: string
  description: string
  coverImage?: string
  category: ShareCategory
  tags: string[]
  stats: {
    urls: number
    videos: number
    documents: number
    images: number
    total: number
  }
}

export default function ShareFolderModal({
  isOpen,
  onClose,
  folder,
  onShareFolder
}: ShareFolderModalProps) {
  const [title, setTitle] = useState(folder.name)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ShareCategory>('tech')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 폴더 내용 분석
  const analyzeFolder = () => {
    let urls = 0, videos = 0, documents = 0, images = 0

    folder.children.forEach(item => {
      if ('type' in item) {
        switch (item.type) {
          case 'url':
            urls++
            break
          case 'video':
            videos++
            break
          case 'document':
          case 'memo':
            documents++
            break
          case 'image':
            images++
            break
        }
      }
    })

    return { urls, videos, documents, images, total: folder.children.length }
  }

  const stats = analyzeFolder()

  const categories = [
    { value: 'business', label: 'Business', emoji: '💼' },
    { value: 'creative', label: 'Creative', emoji: '🎨' },
    { value: 'tech', label: 'Tech', emoji: '💻' },
    { value: 'education', label: 'Education', emoji: '📚' },
    { value: 'lifestyle', label: 'Lifestyle', emoji: '🏠' },
    { value: 'entertainment', label: 'Entertainment', emoji: '🎵' },
    { value: 'food', label: 'Food & Recipe', emoji: '🍽️' },
    { value: 'travel', label: 'Travel', emoji: '✈️' },
    { value: 'health', label: 'Health & Fitness', emoji: '🏃' },
    { value: 'finance', label: 'Finance', emoji: '💰' },
    { value: 'shopping', label: 'Shopping', emoji: '🛒' },
    { value: 'sports', label: 'Sports', emoji: '⚽' },
    { value: 'gaming', label: 'Gaming', emoji: '🎮' },
    { value: 'news', label: 'News', emoji: '📰' },
    { value: 'science', label: 'Science', emoji: '🔬' }
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true)
      // 실제 구현에서는 이미지를 서버에 업로드하고 URL을 받아옴
      // 여기서는 임시로 파일 객체 URL 사용
      const imageUrl = URL.createObjectURL(file)
      setCoverImage(imageUrl)
      setIsUploading(false)
    }
  }

  const handleShare = () => {
    if (!title.trim()) {
      alert('폴더 이름을 입력해주세요.')
      return
    }

    if (!description.trim()) {
      alert('폴더 설명을 입력해주세요.')
      return
    }

    const sharedFolderData: SharedFolderData = {
      title: title.trim(),
      description: description.trim(),
      coverImage,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      stats
    }

    onShareFolder(sharedFolderData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-lg sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Share Folder to Market Place
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Cover Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image (Optional)
            </label>
            <div className="relative">
              {coverImage ? (
                <div className="relative aspect-[3/1] rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setCoverImage('')}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full aspect-[3/1] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {isUploading ? 'Uploading...' : 'Click to upload cover image'}
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Folder Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Folder Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter folder title..."
            />
          </div>

          {/* Folder Content Analysis */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Folder Contents</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-semibold text-gray-900">{stats.urls}</div>
                <div className="text-xs text-gray-600">URLs</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-semibold text-gray-900">{stats.videos}</div>
                <div className="text-xs text-gray-600">Videos</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-semibold text-gray-900">{stats.documents}</div>
                <div className="text-xs text-gray-600">Documents</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-semibold text-gray-900">{stats.images}</div>
                <div className="text-xs text-gray-600">Images</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-sm text-gray-600">
                Total: <strong>{stats.total}</strong> items
              </span>
            </div>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value as ShareCategory)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-xs font-medium transition-colors ${
                    category === cat.value
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm">{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe what's in this folder and why it's useful..."
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tags separated by commas (e.g., react, javascript, tutorial)"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="px-4 sm:px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm sm:text-base"
          >
            Commit to Market Place
          </button>
        </div>
      </motion.div>
    </div>
  )
}