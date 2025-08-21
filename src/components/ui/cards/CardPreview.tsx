'use client'

import { useState } from 'react'
import { ExternalLink, FileText, Edit, Link } from 'lucide-react'
import { ContentType, ContentMetadata } from '@/types/content'
import { getEffectiveThumbnail, getDomainInfo } from '@/utils/thumbnailUtils'
import { getPlatformInfo, getTypeIcon } from '@/utils/platformUtils'

interface CardPreviewProps {
  type: ContentType
  title: string
  thumbnail?: string
  url?: string
  metadata?: ContentMetadata
  description?: string
  size?: 'small' | 'medium' | 'large'
  layout?: 'grid' | 'list'
}

/**
 * 카드의 미리보기 영역을 담당하는 컴포넌트
 * 썸네일, 플랫폼 정보, 폴백 UI 등을 처리
 */
export function CardPreview({
  type,
  title,
  thumbnail,
  url,
  metadata,
  description,
  size = 'medium',
  layout = 'grid'
}: CardPreviewProps) {
  const [imageError, setImageError] = useState(false)

  const domainInfo = getDomainInfo(url || metadata?.domain)
  const platformInfo = getPlatformInfo(url, metadata)
  const effectiveThumbnail = getEffectiveThumbnail(thumbnail, metadata)

  // Height classes for different sizes
  const heightClasses = {
    small: layout === 'list' ? "h-12 w-12" : "h-24",
    medium: layout === 'list' ? "h-12 w-12" : "h-32", 
    large: layout === 'list' ? "h-12 w-12" : "h-40"
  }

  const baseClasses = layout === 'list' 
    ? "w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
    : `w-full bg-gray-50 rounded-t-lg flex items-center justify-center overflow-hidden ${heightClasses[size]}`

  // Strategy 1: Show actual thumbnail if available
  if (effectiveThumbnail && !imageError) {
    return (
      <div className={`${baseClasses} relative`}>
        <img 
          src={effectiveThumbnail} 
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        {layout === 'grid' && (
          <div className="absolute top-2 right-2">
            <ExternalLink className="w-4 h-4 text-white bg-gray-900/50 rounded p-0.5" />
          </div>
        )}
      </div>
    )
  }

  // Strategy 2: Platform-specific preview for URLs
  if (type === 'url' && platformInfo) {
    return (
      <div className={`${baseClasses} ${platformInfo.color} text-white relative`}>
        <div className="text-center">
          <div className={`${layout === 'list' ? 'text-base' : 'text-xl md:text-2xl'} font-bold mb-${layout === 'list' ? '0' : '2'}`}>
            {platformInfo.icon}
          </div>
          {layout === 'grid' && (
            <>
              <div className="text-sm font-semibold">{platformInfo.name}</div>
              <div className="text-xs opacity-75 mt-1">{domainInfo?.domain || 'Web Link'}</div>
            </>
          )}
        </div>
        {layout === 'grid' && (
          <div className="absolute top-2 right-2">
            <Link className="w-4 h-4 opacity-70" />
          </div>
        )}
      </div>
    )
  }

  // Strategy 3: Domain-based fallback for URLs
  if (type === 'url' && domainInfo) {
    return (
      <div className={`${baseClasses} ${domainInfo.domainColor} text-white relative`}>
        <div className="text-center">
          <div className={`${layout === 'list' ? 'text-sm' : 'text-lg md:text-xl'} font-bold mb-${layout === 'list' ? '0' : '1'}`}>
            {domainInfo.domainInitial}
          </div>
          {layout === 'grid' && (
            <div className="text-xs font-medium opacity-90">{domainInfo.domain}</div>
          )}
        </div>
        {layout === 'grid' && (
          <div className="absolute top-2 right-2">
            <Link className="w-4 h-4 opacity-70" />
          </div>
        )}
      </div>
    )
  }

  // Strategy 4: Document preview
  if (type === 'document') {
    return (
      <div className={`${baseClasses} bg-white border border-gray-200 ${layout === 'grid' ? 'p-3' : ''}`}>
        <div className={`${layout === 'list' ? 'w-full h-full flex items-center justify-center' : 'text-left h-full flex flex-col'}`}>
          <div className={`flex items-center ${layout === 'list' ? '' : 'gap-2 mb-2'}`}>
            <FileText className={`${layout === 'list' ? 'w-4 h-4' : 'w-4 h-4'} text-blue-600 flex-shrink-0`} />
            {layout === 'grid' && (
              <div className="text-xs text-gray-500 truncate">Document</div>
            )}
          </div>
          {layout === 'grid' && (
            <div className="text-xs text-gray-700 line-clamp-6 flex-1 leading-relaxed">
              {description || title || 'No content preview available'}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Strategy 5: Memo preview
  if (type === 'memo') {
    return (
      <div className={`${baseClasses} bg-yellow-50 border border-yellow-200 ${layout === 'grid' ? 'p-3' : ''}`}>
        <div className={`${layout === 'list' ? 'w-full h-full flex items-center justify-center' : 'text-center'}`}>
          <Edit className={`${layout === 'list' ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-600 ${layout === 'grid' ? 'mb-2' : ''}`} />
          {layout === 'grid' && (
            <div className="text-xs text-yellow-700 line-clamp-3">
              {description || 'Personal note...'}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Strategy 6: Folder preview
  if (type === 'folder') {
    return (
      <div className={`${baseClasses} bg-blue-50 border border-blue-200 text-blue-600`}>
        <div className="text-center">
          <div className={`${layout === 'list' ? 'text-base' : 'text-xl md:text-2xl'} mb-${layout === 'list' ? '0' : '2'}`}>
            📁
          </div>
          {layout === 'grid' && (
            <div className="text-xs font-medium">
              {metadata?.children?.length || 0} items
            </div>
          )}
        </div>
      </div>
    )
  }

  // Strategy 7: Default fallback
  return (
    <div className={`${baseClasses} border-2 border-dashed border-gray-300`}>
      <div className="text-center">
        <div className={`${layout === 'list' ? 'text-base' : 'text-lg md:text-xl'} mb-${layout === 'list' ? '0' : '1'}`}>
          {getTypeIcon(type)}
        </div>
        {layout === 'grid' && (
          <div className="text-xs text-gray-500 capitalize">{type}</div>
        )}
      </div>
    </div>
  )
}