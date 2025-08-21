'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ExternalLink, FileText, Image as ImageIcon, Video, Edit, Link, Trash2 } from 'lucide-react'

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
    isShared?: boolean // 공유 상태
  }
  onClick?: () => void
  onDelete?: () => void // Add delete functionality
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
  onDelete,
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
    if (effectiveThumbnail && !imageError && (type === 'image' || type === 'video' || type === 'url' || type === 'folder')) {
      return (
        <div className={`${baseClasses} ${heightClasses[size]} relative`}>
          <img 
            src={effectiveThumbnail} 
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-2 right-2">
            {type === 'folder' ? (
              <div className="w-4 h-4 text-white bg-gray-900/50 rounded p-0.5 flex items-center justify-center">
                📁
              </div>
            ) : (
              <ExternalLink className="w-4 h-4 text-white bg-gray-900/50 rounded p-0.5" />
            )}
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
              <div className="text-xl md:text-2xl font-bold mb-2">{platformInfo.icon}</div>
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
              <div className="text-lg md:text-xl font-bold mb-1">{domainInfo.domainInitial}</div>
              <div className="text-xs font-medium opacity-90">{domainInfo.domain}</div>
            </div>
            <div className="absolute top-2 right-2">
              <Link className="w-4 h-4 opacity-70" />
            </div>
          </div>
        )
      }
    }

    // Strategy 4: Document preview with content preview
    if (type === 'document') {
      return (
        <div className={`${baseClasses} ${heightClasses[size]} bg-white border border-gray-200 p-3`}>
          <div className="text-left h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="text-xs text-gray-500 truncate">Document</div>
            </div>
            <div className="text-xs text-gray-700 line-clamp-6 flex-1 leading-relaxed">
              {description || title || 'No content preview available'}
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
          <div className="text-lg md:text-xl mb-1">{getTypeIcon(type)}</div>
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

  // 표시할 제목 정리 함수
  const getDisplayTitle = () => {
    // YouTube 영상의 경우 실제 제목 우선
    if (type === 'video' && metadata?.title) {
      return metadata.title
    }
    
    // 제목이 암호화된 ID 같은 경우 (YouTube ID 패턴)
    if (title && /^[A-Za-z0-9_-]{8,15}$/.test(title)) {
      if (metadata?.title) {
        return metadata.title
      }
      return 'Untitled'
    }
    
    // 제목이 없거나 의미없는 경우
    if (!title || title.trim() === '' || title === 'undefined' || title === 'null') {
      return 'Untitled'
    }
    
    // Document에서 제목이 애매한 경우
    if (type === 'document' && (title.length < 3 || /^[0-9-]+$/.test(title))) {
      return 'Untitled'
    }
    
    // Image에서 제목이 없는 경우
    if (type === 'image' && (title.includes('blob:') || title.includes('data:') || title.startsWith('Pasted Image'))) {
      return 'Untitled'
    }
    
    return title
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

  // 🎨 MOBILE-OPTIMIZED LIST LAYOUT (like music streaming apps)
  if (layout === 'list') {
    return (
      <motion.div
        className={`${cardWidthClasses} bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer group`}
        onClick={onClick}
        whileHover={{ y: 0 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3 p-3">
          {/* 🖼️ LEFT: Thumbnail (48x48 - perfect touch target) */}
          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {effectiveThumbnail && !imageError ? (
              <img 
                src={effectiveThumbnail} 
                alt={title} 
                className="w-full h-full object-cover" 
                onError={() => setImageError(true)} 
              />
            ) : folderRepImage && !imageError ? (
              <img 
                src={folderRepImage} 
                alt={title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : platformInfo ? (
              <div className={`w-full h-full ${platformInfo.color} text-white flex items-center justify-center`}>
                <span className="text-base md:text-lg font-bold">{platformInfo.icon}</span>
              </div>
            ) : domainInfo ? (
              <div className={`w-full h-full ${domainInfo.domainColor} text-white flex items-center justify-center`}>
                <span className="text-sm font-bold">{domainInfo.domainInitial}</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-base md:text-lg">{getTypeIcon(type)}</span>
              </div>
            )}
          </div>
          
          {/* 📝 CENTER: Content Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-0.5">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {/* Platform/Domain info */}
              {metadata?.domain && (
                <span className="truncate">{metadata.domain}</span>
              )}
              {type !== 'folder' && metadata?.domain && (
                <span>•</span>
              )}
              {type === 'folder' && (
                <span>{metadata?.fileSize || 'Folder'}</span>
              )}
              {(type === 'url' || type === 'video') && metadata?.platform && (
                <span className="truncate">{metadata.platform}</span>
              )}
            </div>
          </div>
          
          {/* 📊 RIGHT: Stats/Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Show engagement stats for marketplace */}
            {metadata?.fileSize && typeof metadata.fileSize === 'string' && metadata.fileSize.includes('♥') ? (
              <div className="text-xs text-gray-600 text-right">
                <div className="flex items-center gap-1">
                  {metadata.fileSize.split(' ').map((stat, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      {stat}
                    </span>
                  ))}
                </div>
              </div>
            ) : metadata?.fileSize && metadata.fileSize.includes('⭐') ? (
              // Bookmark favorite indicator
              <div className="text-sm">
                ⭐
              </div>
            ) : type === 'folder' ? (
              // Folder item count
              <div className="text-xs text-gray-500 text-right">
                <div>{(metadata?.children?.length || 0)}</div>
                <div>items</div>
              </div>
            ) : (
              // Default chevron for navigation
              <div className="text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Grid layout
  const isSharedFolder = type === 'folder' && metadata?.isShared
  
  return (
    <motion.div
      className={`${cardWidthClasses} ${cardSizeClasses[size]} ${
        isSharedFolder 
          ? 'bg-green-50 border-green-200 hover:border-green-300' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      } rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 🎯 UNIFIED PREVIEW AREA */}
      {renderPreviewArea()}
      
      {/* 📝 CONTENT AREA - 단순화 */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">{getTypeIcon(type)}</span>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 flex-1">
            {getDisplayTitle()}
          </h3>
          {isSharedFolder && (
            <span className="text-xs text-green-600" title="This folder is shared">
              🌐
            </span>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
              title="Delete bookmark"
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Content Grid component for consistent spacing - responsive to layout mode
export function ContentGrid({ children, layout = 'grid' }: { children: React.ReactNode; layout?: 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <div className="divide-y divide-gray-100">
        {children}
      </div>
    )
  }
  
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