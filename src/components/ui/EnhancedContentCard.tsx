'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ExternalLink, FileText, Image as ImageIcon, Video, Edit, Link } from 'lucide-react'

interface ContentCardProps {
  type: 'url' | 'image' | 'video' | 'document' | 'memo' | 'folder'
  title: string
  description?: string
  thumbnail?: string
  url?: string
  metadata?: {
    domain?: string
    fileSize?: string | number // Combined type to handle both
    duration?: string
    tags?: string[]
    children?: any[] // For folder contents
    items?: any[] // Alternative folder contents structure
    thumbnail?: string // Add thumbnail to metadata
    title?: string
    description?: string
    platform?: string
    channelTitle?: string
    fileName?: string
    fileType?: string
  }
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
  layout?: 'grid' | 'list'
}

// 🎨 ENHANCED: Unified content cards with smart URL fallbacks
export default function EnhancedContentCard({
  type,
  title,
  description,
  thumbnail,
  url,
  metadata,
  onClick,
  size = 'medium',
  layout = 'grid'
}: ContentCardProps) {
  const [imageError, setImageError] = useState(false)

  // Extract domain from URL for fallback strategies
  const getDomainInfo = (url?: string) => {
    if (!url) return null
    
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return {
        domain,
        domainInitial: domain.charAt(0).toUpperCase(),
        domainColor: generateDomainColor(domain)
      }
    } catch {
      return null
    }
  }

  // Generate consistent color based on domain
  const generateDomainColor = (domain: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
      'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-teal-500'
    ]
    const hash = domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // 🎯 KakaoTalk-style platform detection and styling
  const getPlatformInfo = (url?: string, metadata?: any) => {
    if (!url) return null
    
    try {
      const domain = new URL(url).hostname.toLowerCase()
      
      // YouTube - Red background with play icon
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        return {
          type: 'youtube',
          name: 'YouTube',
          color: 'bg-red-500',
          icon: '▶️',
          logo: '🎬'
        }
      }
      
      // Reddit - Orange background with Reddit logo
      if (domain.includes('reddit.com')) {
        return {
          type: 'reddit',
          name: 'Reddit',
          color: 'bg-orange-500',
          icon: '🅡',
          logo: '📱'
        }
      }
      
      // Naver - Green background
      if (domain.includes('naver.com')) {
        return {
          type: 'naver',
          name: 'Naver',
          color: 'bg-green-500',
          icon: 'N',
          logo: '📰'
        }
      }
      
      // News sites - Blue background
      if (domain.includes('news') || domain.includes('뉴스') || 
          ['yna.co.kr', 'chosun.com', 'joins.com', 'hankyung.com'].some(news => domain.includes(news))) {
        return {
          type: 'news',
          name: 'News',
          color: 'bg-blue-600',
          icon: '📰',
          logo: '📺'
        }
      }
      
      // Blog - Purple background
      if (domain.includes('blog') || domain.includes('tistory')) {
        return {
          type: 'blog',
          name: 'Blog',
          color: 'bg-purple-500',
          icon: '✍️',
          logo: '📝'
        }
      }
      
      // Community/Forums - Indigo background
      if (domain.includes('cafe') || domain.includes('forum') || domain.includes('community')) {
        return {
          type: 'community',
          name: 'Community',
          color: 'bg-indigo-500',
          icon: '👥',
          logo: '💬'
        }
      }
      
      return null
    } catch {
      return null
    }
  }

  // 🎯 Generate automatic folder representative image
  const getFolderRepresentativeImage = () => {
    if (type !== 'folder') return null
    
    // For folders, check if we have children data in metadata
    const folderChildren = metadata?.children || metadata?.items || []
    
    // Find the first item with a thumbnail/image
    for (const child of folderChildren) {
      if (child.thumbnail) return child.thumbnail
      if (child.type === 'image' && child.content) return child.content
      if (child.type === 'video' && child.metadata?.thumbnail) return child.metadata.thumbnail
      if (child.type === 'url' && child.metadata?.thumbnail) return child.metadata.thumbnail
    }
    
    return null
  }

  const domainInfo = getDomainInfo(url || metadata?.domain)
  const platformInfo = getPlatformInfo(url, metadata)
  const folderRepImage = getFolderRepresentativeImage()
  
  // 🔍 ENHANCED: Smart thumbnail detection - check multiple sources
  const effectiveThumbnail = thumbnail || metadata?.thumbnail || null

  // 🎯 SMART PREVIEW AREA - The core of unified design
  const renderPreviewArea = () => {
    const baseClasses = "w-full bg-gray-50 rounded-t-lg flex items-center justify-center overflow-hidden"
    const heightClasses = {
      small: "h-24",
      medium: "h-32", 
      large: "h-40"
    }

    // 🔍 COMPREHENSIVE DEBUG - Let's see what's really happening
    console.log('🎯 Card Debug:', {
      type,
      title: title?.substring(0, 30),
      directThumbnail: thumbnail ? 'YES' : 'NO',
      metadataThumbnail: metadata?.thumbnail ? 'YES' : 'NO',
      effectiveThumbnail: effectiveThumbnail ? 'YES' : 'NO',
      strategy: effectiveThumbnail ? 'THUMBNAIL' : 'FALLBACK'
    })

    // Strategy 1: Folder with representative image
    if (type === 'folder' && folderRepImage && !imageError) {
      return (
        <div className={`${baseClasses} ${heightClasses[size]} relative`}>
          <img 
            src={folderRepImage} 
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-2 left-2">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-800">
              📁 {metadata?.fileSize || 'Folder'}
            </div>
          </div>
        </div>
      )
    }

    // Strategy 2: Show actual thumbnail if available
    if (effectiveThumbnail && !imageError && (type === 'image' || type === 'video' || type === 'url')) {
      return (
        <div className={`${baseClasses} ${heightClasses[size]} relative`}>
          <img 
            src={effectiveThumbnail} 
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-2 right-2">
            <ExternalLink className="w-4 h-4 text-white bg-gray-900/50 rounded p-0.5" />
          </div>
        </div>
      )
    }

    // Strategy 3: URL without thumbnail - Platform-specific or domain-based fallback
    if (type === 'url') {
      // KakaoTalk-style platform-specific preview
      if (platformInfo) {
        return (
          <div className={`${baseClasses} ${heightClasses[size]} ${platformInfo.color} text-white relative`}>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{platformInfo.icon}</div>
              <div className="text-sm font-semibold">{platformInfo.name}</div>
              <div className="text-xs opacity-75 mt-1">{domainInfo?.domain || 'Web Link'}</div>
            </div>
            <div className="absolute top-2 right-2">
              <Link className="w-4 h-4 opacity-70" />
            </div>
          </div>
        )
      }
      
      // Default domain-based fallback
      if (domainInfo) {
        return (
          <div className={`${baseClasses} ${heightClasses[size]} ${domainInfo.domainColor} text-white relative`}>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{domainInfo.domainInitial}</div>
              <div className="text-xs font-medium opacity-90">{domainInfo.domain}</div>
            </div>
            <div className="absolute top-2 right-2">
              <Link className="w-4 h-4 opacity-70" />
            </div>
          </div>
        )
      }
    }

    // Strategy 4: Document preview
    if (type === 'document') {
      return (
        <div className={`${baseClasses} ${heightClasses[size]} border-2 border-dashed border-gray-300`}>
          <div className="text-center">
            <FileText className="w-8 h-8 text-gray-400 mb-2" />
            <div className="text-xs text-gray-500">
              {metadata?.fileSize || 'Document'}
            </div>
          </div>
        </div>
      )
    }

    // Strategy 5: Memo with text preview
    if (type === 'memo') {
      return (
        <div className={`${baseClasses} ${heightClasses[size]} bg-yellow-50 border border-yellow-200 p-3`}>
          <div className="text-center">
            <Edit className="w-6 h-6 text-yellow-600 mb-2" />
            <div className="text-xs text-yellow-700 line-clamp-3">
              {description || 'Personal note...'}
            </div>
          </div>
        </div>
      )
    }

    // Strategy 6: Default fallback
    return (
      <div className={`${baseClasses} ${heightClasses[size]} border-2 border-dashed border-gray-300`}>
        <div className="text-center">
          <div className="text-2xl mb-1">{getTypeIcon(type)}</div>
          <div className="text-xs text-gray-500 capitalize">{type}</div>
        </div>
      </div>
    )
  }

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

  // Card size configuration - Remove padding from cards
  const cardSizeClasses = {
    small: "",
    medium: "", 
    large: ""
  }

  const cardWidthClasses = layout === 'list' 
    ? "w-full" 
    : "w-full"

  // 🎨 MAIN CARD COMPONENT
  if (layout === 'list') {
    return (
      <motion.div
        className={`${cardWidthClasses} bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden`}
        onClick={onClick}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex gap-4 p-4">
          {/* Compact preview */}
          <div className="w-16 h-16 flex-shrink-0">
            <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
              {effectiveThumbnail && !imageError ? (
                <img src={effectiveThumbnail} alt={title} className="w-full h-full object-cover" onError={() => setImageError(true)} />
              ) : platformInfo ? (
                <div className={`w-full h-full ${platformInfo.color} text-white flex items-center justify-center`}>
                  <span className="text-lg font-bold">{platformInfo.icon}</span>
                </div>
              ) : domainInfo ? (
                <div className={`w-full h-full ${domainInfo.domainColor} text-white flex items-center justify-center`}>
                  <span className="text-sm font-bold">{domainInfo.domainInitial}</span>
                </div>
              ) : (
                <span className="text-lg">{getTypeIcon(type)}</span>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {description}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {platformInfo ? (
                <span className="flex items-center gap-1">
                  <span>{platformInfo.logo}</span>
                  <span>{platformInfo.name}</span>
                </span>
              ) : metadata?.domain ? (
                <span>{metadata.domain}</span>
              ) : null}
              {metadata?.fileSize && <span>{metadata.fileSize}</span>}
              {metadata?.duration && <span>{metadata.duration}</span>}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Grid layout
  return (
    <motion.div
      className={`${cardWidthClasses} ${cardSizeClasses[size]} bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 🎯 UNIFIED PREVIEW AREA */}
      {renderPreviewArea()}
      
      {/* 📝 CONTENT AREA */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {title}
        </h3>
        
        {description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {description}
          </p>
        )}
        
        {/* 📊 METADATA */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="text-xs">{getTypeIcon(type)}</span>
            {platformInfo ? (
              <span className="flex items-center gap-1">
                <span>{platformInfo.logo}</span>
                <span>{platformInfo.name}</span>
              </span>
            ) : metadata?.domain ? (
              <span>{metadata.domain}</span>
            ) : metadata?.fileSize ? (
              <span>{metadata.fileSize}</span>
            ) : null}
          </div>
          {metadata?.duration && <span>{metadata.duration}</span>}
        </div>
      </div>
    </motion.div>
  )
}

// Content Grid component for consistent spacing
export function ContentGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 p-4">
      {children}
    </div>
  )
}

// List view component 
export function ContentList({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2 p-4">
      {children}
    </div>
  )
}