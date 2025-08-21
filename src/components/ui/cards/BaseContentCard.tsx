'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { ContentType } from '@/types/content'
import { getTypeIcon } from '@/utils/platformUtils'

interface BaseContentCardProps {
  type: ContentType
  title: string
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  size?: 'small' | 'medium' | 'large'
  layout?: 'grid' | 'list'
  showActions?: boolean
  isShared?: boolean
  children: ReactNode // Preview area content
  rightContent?: ReactNode // Right side content for list layout
}

/**
 * 모든 콘텐츠 카드의 기본 틀을 제공하는 컴포넌트
 * 레이아웃, 애니메이션, 액션 버튼을 통합 관리
 */
export function BaseContentCard({
  type,
  title,
  onClick,
  onEdit,
  onDelete,
  size = 'medium',
  layout = 'grid',
  showActions = true,
  isShared = false,
  children,
  rightContent
}: BaseContentCardProps) {
  // Card size configuration
  const cardSizeClasses = {
    small: "",
    medium: "", 
    large: ""
  }

  const cardWidthClasses = layout === 'list' ? "w-full" : "w-full"

  // 🎨 MOBILE-OPTIMIZED LIST LAYOUT
  if (layout === 'list') {
    return (
      <motion.div
        className={`${cardWidthClasses} bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer group`}
        onClick={onClick}
        whileHover={{ y: 0 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Preview content (48x48 thumbnail area) */}
          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {children}
          </div>
          
          {/* Center: Title and metadata */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-0.5">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="capitalize">{type}</span>
              {isShared && (
                <>
                  <span>•</span>
                  <span className="text-green-600">Shared</span>
                </>
              )}
            </div>
          </div>
          
          {/* Right: Actions or stats */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Action buttons */}
            {showActions && (onEdit || onDelete) && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                    className="p-1 hover:bg-blue-100 rounded text-blue-500 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                    className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            
            {/* Custom right content or default chevron */}
            {rightContent || (
              !showActions && (
                <div className="text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Grid layout
  return (
    <motion.div
      className={`${cardWidthClasses} ${cardSizeClasses[size]} ${
        isShared 
          ? 'bg-green-50 border-green-200 hover:border-green-300' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      } rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Preview area */}
      {children}
      
      {/* Content area */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">{getTypeIcon(type)}</span>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 flex-1">
            {title}
          </h3>
          {isShared && (
            <span className="text-xs text-green-600" title="This item is shared">
              🌐
            </span>
          )}
          {showActions && (onEdit || onDelete) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="p-1 hover:bg-blue-100 rounded text-blue-500 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-3 h-3" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}