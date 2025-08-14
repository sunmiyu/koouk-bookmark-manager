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
      className="w-full hover:bg-gray-50 transition-all duration-150 text-left group select-none rounded-lg
                 /* 모바일: 세로 카드 형태 */
                 sm:px-3 sm:py-1.5 sm:border-b sm:border-gray-100 sm:last:border-b-0 sm:rounded-none
                 /* 모바일: 카드 스타일 */
                 p-2 bg-white border border-gray-200"
      whileTap={{ scale: 0.98 }}
      style={{ 
        minHeight: '36px',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 모바일: 세로 카드 레이아웃 */}
      <div className="flex flex-col gap-2 sm:hidden">
        {/* 상단: 파비콘 + 즐겨찾기 */}
        <div className="flex items-center justify-between">
          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-100">
            {bookmark.favicon ? (
              <Image 
                src={bookmark.favicon} 
                alt={bookmark.title}
                width={14}
                height={14}
                className="w-3.5 h-3.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=16`
                }}
              />
            ) : (
              <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
          
          {/* 즐겨찾기 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(bookmark.id)
            }}
            className={`p-1 rounded transition-all duration-150 active:scale-95 select-none ${
              bookmark.isFavorite ? 'text-yellow-500' : 'text-gray-300'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <Star className={`w-3 h-3 ${bookmark.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        {/* 제목 */}
        <div className="min-w-0">
          <span className="font-medium text-gray-900 text-xs leading-tight line-clamp-2 block">{bookmark.title}</span>
        </div>
        
        {/* 하단: 도메인 */}
        <div className="text-xs text-gray-500 truncate">
          {new URL(bookmark.url).hostname.replace('www.', '')}
        </div>
      </div>

      {/* 데스크톱: 가로 리스트 레이아웃 */}
      <div className="hidden sm:flex items-center gap-2.5">
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
          <span className="font-medium text-gray-900 text-sm truncate block">{bookmark.title}</span>
        </div>
        
        {/* URL 도메인 */}
        <div className="text-xs text-gray-500 w-24 truncate flex-shrink-0">
          {new URL(bookmark.url).hostname.replace('www.', '')}
        </div>
        
        {/* 태그들 */}
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
          <span>
            {new Date(bookmark.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(bookmark.id)
            }}
            className={`p-1 rounded hover:bg-gray-100 transition-all duration-150 active:scale-95 select-none ${
              bookmark.isFavorite ? 'text-yellow-500' : 'text-gray-400'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <Star className={`w-3 h-3 ${bookmark.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteBookmark(bookmark.id)
            }}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all duration-150 active:scale-95 select-none"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
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