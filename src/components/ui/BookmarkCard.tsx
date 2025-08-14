'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { LinkIcon, Star, Trash2, ExternalLink } from 'lucide-react'

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  favicon?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  category?: string
  isFavorite?: boolean
  usageCount?: number
  lastUsedAt?: string
}

interface BookmarkCardProps {
  bookmark: Bookmark
  onOpenBookmark: (bookmark: Bookmark) => void
  onToggleFavorite: (id: string) => void
  onDeleteBookmark: (id: string) => void
}

export default function BookmarkCard({
  bookmark,
  onOpenBookmark,
  onToggleFavorite,
  onDeleteBookmark
}: BookmarkCardProps) {
  return (
    <motion.button
      onClick={() => onOpenBookmark(bookmark)}
      className="w-full px-3 py-1.5 hover:bg-gray-50 transition-all duration-150 text-left border-b border-gray-100 last:border-b-0 group select-none"
      whileTap={{ scale: 0.98 }}
      style={{ 
        minHeight: '36px',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 통합된 컴팩트 레이아웃 - 모바일과 PC 동일 */}
      <div className="flex items-center gap-2.5">
        {/* 파비콘 */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-100">
          {bookmark.favicon ? (
            <Image 
              src={bookmark.favicon} 
              alt={bookmark.title}
              width={16}
              height={16}
              className="w-4 h-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=16`
              }}
            />
          ) : (
            <LinkIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
        
        {/* 제목 */}
        <div className="flex-1 min-w-0">
          <span className="font-medium text-gray-900 text-xs sm:text-sm truncate block">{bookmark.title}</span>
        </div>
        
        {/* URL 도메인 - PC에서 더 넓게 */}
        <div className="hidden sm:block text-xs text-gray-500 w-24 truncate flex-shrink-0">
          {new URL(bookmark.url).hostname.replace('www.', '')}
        </div>
        
        {/* 태그들 - PC에서만 표시 */}
        <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
          {bookmark.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
              #{tag}
            </span>
          ))}
        </div>
        
        {/* 메타정보 */}
        <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
          {bookmark.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
          <span className="hidden sm:inline">
            {new Date(bookmark.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        {/* Actions - 모바일/PC 모두 표시 */}
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(bookmark.id)
            }}
            className={`p-1 rounded hover:bg-gray-100 transition-all duration-150 active:scale-95 select-none ${
              bookmark.isFavorite ? 'text-yellow-500' : 'text-gray-400'
            }`}
            title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <Star className={`w-3 h-3 ${bookmark.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteBookmark(bookmark.id)
            }}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all duration-150 active:scale-95 select-none"
            title="Delete bookmark"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        
        <ExternalLink size={14} color="#9CA3AF" className="flex-shrink-0" />
      </div>
    </motion.button>
  )
}

export type { Bookmark }