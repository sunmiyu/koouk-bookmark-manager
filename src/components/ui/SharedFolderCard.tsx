'use client'

import Image from 'next/image'
import { Heart, Edit3 } from 'lucide-react'
import { SharedFolder } from '@/types/share'

interface SharedFolderCardProps {
  sharedFolder: SharedFolder
  onImportFolder?: (sharedFolder: SharedFolder) => void
  onEditFolder?: (sharedFolder: SharedFolder) => void
  categories: Array<{ value: string; label: string; emoji?: string }>
  isOwnFolder?: boolean
}

export default function SharedFolderCard({
  sharedFolder,
  onImportFolder,
  onEditFolder,
  categories,
  isOwnFolder = false
}: SharedFolderCardProps) {
  const currentCategory = categories.find(cat => cat.value === sharedFolder.category)

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group flex flex-col h-full">
      {/* 커버 이미지 - 모바일에서 더 작게 */}
      <div className="relative aspect-[4/3] sm:aspect-[5/4] overflow-hidden rounded-t-xl bg-gradient-to-br from-gray-50 to-gray-100">
        {sharedFolder.coverImage ? (
          <Image
            src={sharedFolder.coverImage}
            alt={sharedFolder.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">{currentCategory?.emoji || '📁'}</span>
          </div>
        )}
        
        {/* 좋아요 버튼 */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors">
          <Heart className="w-4 h-4 text-gray-600 fill-current" />
        </button>

        {/* 카테고리 태그 */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-black/80 text-white text-xs rounded-full">
            {currentCategory?.label}
          </span>
        </div>
      </div>

      {/* 컨텐츠 - 고정 높이로 일관된 레이아웃 */}
      <div className="p-1.5 sm:p-2 flex flex-col h-full">
        {/* 제작자 정보 - 모바일에서 숨김 */}
        <div className="hidden sm:flex items-center gap-2 mb-2">
          <span className="text-sm">{sharedFolder.author.avatar}</span>
          <span className="text-xs font-medium text-gray-700">{sharedFolder.author.name}</span>
          {sharedFolder.author.verified && (
            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[8px]">✓</span>
            </div>
          )}
        </div>

        {/* 제목 - 통일된 텍스트 크기 */}
        <h3 className="font-semibold text-gray-900 text-xs mb-0.5 line-clamp-2 leading-tight">
          {sharedFolder.title}
        </h3>

        {/* 설명 - 통일된 텍스트 크기 */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-1 leading-relaxed">
          {sharedFolder.description}
        </p>

        {/* Spacer to push button to bottom */}
        <div className="flex-1"></div>

        {/* 통계 - 통일된 텍스트 크기 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" />
              {sharedFolder.stats.likes}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              📥 {sharedFolder.stats.downloads}
            </span>
          </div>
          <span className="hidden sm:inline">
            {new Date(sharedFolder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* 액션 버튼 - 통일된 크기 */}
        {isOwnFolder ? (
          <div className="flex gap-2">
            <button
              onClick={() => onEditFolder?.(sharedFolder)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>
        ) : (
          <button
            onClick={() => onImportFolder?.(sharedFolder)}
            className="w-full bg-black text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </div>
  )
}