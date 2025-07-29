'use client'

import { useState } from 'react'
import { MiniFunctionData } from '@/types/miniFunctions'

interface MiniFunctionCardProps {
  functionData: MiniFunctionData
  title: React.ReactNode
  children: React.ReactNode // 기본 콘텐츠 (접힘/펼침 상태 모두 사용)
  expandedContent?: React.ReactNode // 추가 확장 콘텐츠
  isPreviewOnly?: boolean
}

export default function MiniFunctionCard({ 
  functionData, 
  title,
  children,
  expandedContent,
  isPreviewOnly = false
}: MiniFunctionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    if (!isPreviewOnly && expandedContent) {
      setIsExpanded(!isExpanded)
    }
  }

  const shouldShowExpanded = isExpanded && !isPreviewOnly && expandedContent

  return (
    <div className="w-full">
      <div 
        className={`bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg responsive-p-sm border border-gray-700 group relative ${
          !isPreviewOnly && expandedContent ? 'cursor-pointer' : ''
        } ${isPreviewOnly ? 'opacity-70' : ''} ${
          shouldShowExpanded ? 'h-auto' : 'overflow-hidden'
        }`}
        onClick={handleToggle}
      >
        {/* Preview Only Badge */}
        {isPreviewOnly && (
          <div className="absolute top-2 right-2 px-1 py-0.5 bg-yellow-600 text-yellow-100 text-sm rounded text-[10px] z-10">
            Preview
          </div>
        )}

        {/* Content Container */}
        <div className="flex items-start responsive-gap-sm">
          {/* Icon */}
          <div className="w-6 h-6 bg-gray-700 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-sm">{functionData.icon}</span>
          </div>
          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white responsive-text-sm truncate mb-2">{title}</h4>
            <div className="text-sm">
              {children}
            </div>
          </div>
        </div>

        {/* 확장된 컨텐츠 - 자연스러운 연속성을 위해 경계선 제거 */}
        {shouldShowExpanded && (
          <div className="mt-4">
            {expandedContent}
          </div>
        )}
      </div>
    </div>
  )
}