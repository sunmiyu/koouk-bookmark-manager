'use client'

import { useState } from 'react'
import { MiniFunctionData } from '@/types/miniFunctions'

interface MiniFunctionCardProps {
  functionData: MiniFunctionData
  firstLine: React.ReactNode
  secondLine: React.ReactNode
  expandedContent?: React.ReactNode
  isPreviewOnly?: boolean
}

export default function MiniFunctionCard({ 
  functionData, 
  firstLine,
  secondLine,
  expandedContent,
  isPreviewOnly = false
}: MiniFunctionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleToggle = () => {
    if (!isPreviewOnly && expandedContent) {
      setIsExpanded(!isExpanded)
    }
  }

  const shouldShowExpanded = (isExpanded || (!isExpanded && isHovered)) && !isPreviewOnly && expandedContent

  return (
    <div className="w-full">
      <div 
        className={`bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg responsive-p-sm border border-gray-700 group relative ${
          !isPreviewOnly && expandedContent ? 'cursor-pointer' : ''
        } ${isPreviewOnly ? 'opacity-70' : ''} ${
          shouldShowExpanded ? 'h-auto' : 'overflow-hidden'
        }`}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
          <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center">
            <span className="text-sm">{functionData.icon}</span>
          </div>
          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white responsive-text-sm line-clamp-2">{firstLine}</h4>
            <p className="text-xs text-gray-400 mt-1">{secondLine}</p>
          </div>
        </div>

        {/* 확장된 컨텐츠 */}
        {shouldShowExpanded && (
          <div className="pt-3 border-t border-gray-700 mt-3">
            {expandedContent}
          </div>
        )}
      </div>
    </div>
  )
}