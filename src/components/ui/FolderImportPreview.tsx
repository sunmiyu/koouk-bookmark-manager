'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SharedFolder } from '@/types/share'
import { Heart, Download, Users, Calendar } from 'lucide-react'

interface FolderImportPreviewProps {
  folder: SharedFolder
  onImport: () => void
  onCancel: () => void
}

export default function FolderImportPreview({
  folder,
  onImport,
  onCancel
}: FolderImportPreviewProps) {
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = async () => {
    setIsImporting(true)
    
    // 📱 MOBILE: Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // Light haptic feedback
    }
    
    // Add small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300))
    onImport()
    setIsImporting(false)
  }

  // Mock folder content preview
  const previewItems = [
    { name: 'Getting Started Guide', type: 'document', icon: '📄' },
    { name: 'Video Tutorial', type: 'video', icon: '🎥' },
    { name: 'Resource Links', type: 'url', icon: '🔗' },
    { name: 'Quick Tips', type: 'memo', icon: '📝' },
    { name: 'Screenshots', type: 'image', icon: '🖼️' },
  ]

  return (
    <div className="p-6">
      {/* Folder Header */}
      <div className="mb-6">
        {/* Cover Image */}
        <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden">
          {folder.coverImage ? (
            <img 
              src={folder.coverImage} 
              alt={folder.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl">📁</span>
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
              {folder.category}
            </span>
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {folder.title}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {folder.description}
        </p>

        {/* Author */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900">
              {folder.author.name}
            </span>
            {folder.author.verified && (
              <span className="ml-1 text-blue-500">✓</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <Heart size={16} className="text-red-500" />
            <span>{folder.stats.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={16} className="text-green-500" />
            <span>{folder.stats.downloads}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} className="text-blue-500" />
            <span>{folder.stats.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} className="text-purple-500" />
            <span>{new Date(folder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          What's Inside ({previewItems.length} items)
        </h3>
        <div className="space-y-2">
          {previewItems.slice(0, 5).map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  {item.name}
                </span>
                <span className="ml-2 text-xs text-gray-500 capitalize">
                  {item.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons - 📱 MOBILE-OPTIMIZED: Larger touch targets */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="flex-1 py-4 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all font-medium min-h-[48px] flex items-center justify-center"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          Cancel
        </button>
        <motion.button
          onClick={handleImport}
          disabled={isImporting}
          className="flex-1 py-4 px-4 bg-black text-white rounded-xl hover:bg-gray-800 active:bg-gray-900 transition-all font-medium relative overflow-hidden min-h-[48px] disabled:opacity-70"
          whileTap={{ scale: 0.98 }}
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          {isImporting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Adding...</span>
            </div>
          ) : (
            <span>Add to My Folder</span>
          )}
        </motion.button>
      </div>
    </div>
  )
}