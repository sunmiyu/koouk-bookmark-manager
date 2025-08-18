'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface ContentCardProps {
  type: 'url' | 'image' | 'video' | 'document' | 'memo' | 'folder'
  title: string
  description?: string
  thumbnail?: string
  metadata?: {
    domain?: string
    fileSize?: string
    duration?: string
    tags?: string[]
  }
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
  layout?: 'grid' | 'list'
}

// 🎨 PERFECTION: Perfect card design for "plenty & full but easy" feeling
export default function ContentCard({
  type,
  title,
  description,
  thumbnail,
  metadata,
  onClick,
  size = 'medium',
  layout = 'grid'
}: ContentCardProps) {
  const [imageError, setImageError] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return '🔗'
      case 'image': return '🖼️'
      case 'video': return '📺'
      case 'document': return '📄'
      case 'memo': return '📝'
      case 'folder': return '📁'
      default: return '📄'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'url': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'image': return 'bg-green-100 text-green-700 border-green-200'
      case 'video': return 'bg-red-100 text-red-700 border-red-200'
      case 'document': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'memo': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'folder': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // 🎯 PERFECTION: Responsive card sizes for different screens
  const cardSizeClasses = {
    small: layout === 'grid' ? 'h-32' : 'h-16',
    medium: layout === 'grid' ? 'h-48' : 'h-20', 
    large: layout === 'grid' ? 'h-64' : 'h-24'
  }

  const cardWidthClasses = layout === 'grid' 
    ? 'w-full' // Grid: full width of container
    : 'w-full'  // List: full width

  if (layout === 'list') {
    // 📱 List Layout - Perfect for mobile and detailed view
    return (
      <motion.div
        onClick={onClick}
        className={`${cardWidthClasses} ${cardSizeClasses[size]} bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden`}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center h-full p-4 gap-4">
          {/* Thumbnail or Icon */}
          <div className="flex-shrink-0">
            {thumbnail && !imageError ? (
              <img 
                src={thumbnail} 
                alt={title}
                className="w-12 h-12 rounded-lg object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${getTypeColor(type)}`}>
                {getTypeIcon(type)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 truncate mt-1">
                {description}
              </p>
            )}
            {metadata?.domain && (
              <p className="text-xs text-gray-500 mt-1">
                {metadata.domain}
              </p>
            )}
          </div>

          {/* Action indicator */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
            →
          </div>
        </div>
      </motion.div>
    )
  }

  // 🎨 Grid Layout - Perfect for browse and discovery
  return (
    <motion.div
      onClick={onClick}
      className={`${cardWidthClasses} ${cardSizeClasses[size]} bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden`}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Header with type indicator */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(type)}`}>
            <span>{getTypeIcon(type)}</span>
            <span className="capitalize">{type}</span>
          </span>
          {metadata?.tags && metadata.tags.length > 0 && (
            <span className="text-xs text-gray-500">
              +{metadata.tags.length}
            </span>
          )}
        </div>

        {/* Thumbnail */}
        {size !== 'small' && (
          <div className="relative mb-3">
            {thumbnail && !imageError ? (
              <img 
                src={thumbnail} 
                alt={title}
                className="w-full h-24 object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-full h-24 rounded-lg flex items-center justify-center text-3xl ${getTypeColor(type)} border-2 border-dashed`}>
                {getTypeIcon(type)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 ${
            size === 'small' ? 'text-sm' : 'text-base'
          }`}>
            {title}
          </h3>
          
          {description && size !== 'small' && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
              {description}
            </p>
          )}
        </div>

        {/* Metadata footer */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {metadata?.domain && (
              <span className="truncate">{metadata.domain}</span>
            )}
            {metadata?.fileSize && (
              <span>{metadata.fileSize}</span>
            )}
            {metadata?.duration && (
              <span>{metadata.duration}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 🎯 PERFECTION: Responsive grid container component
export function ContentGrid({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`
      grid gap-6 w-full
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-4 
      2xl:grid-cols-5
      auto-rows-max
      ${className}
    `}>
      {children}
    </div>
  )
}