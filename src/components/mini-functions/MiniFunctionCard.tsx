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
        className={`bg-gray-900 border border-gray-700 rounded-lg relative transition-all duration-200 ${
          !isPreviewOnly && expandedContent ? 'cursor-pointer hover:bg-gray-800' : ''
        } ${isPreviewOnly ? 'opacity-70' : ''} ${
          shouldShowExpanded ? 'h-auto' : 'h-[58px] overflow-hidden'
        }`}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Preview Only Badge */}
        {isPreviewOnly && (
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-yellow-600 text-yellow-100 text-sm rounded text-[10px] z-10">
            Preview
          </div>
        )}

        {/* Content Container */}
        <div className="p-4 flex items-center justify-center">
          {/* 기본 2줄 컨텐츠 */}
          <div className="space-y-1 w-full">
            {/* 첫 번째 줄 */}
            <div className="flex items-center h-5 leading-5">
              <span className="text-sm mr-2 flex-shrink-0">{functionData.icon}</span>
              <div className="text-sm text-white flex-1 flex justify-between items-center">
                {firstLine}
              </div>
            </div>

            {/* 두 번째 줄 */}
            <div className="h-5 leading-5">
              <div className="text-sm text-white flex justify-between items-center ml-6">
                {secondLine}
              </div>
            </div>
          </div>

        </div>

        {/* 확장된 컨텐츠 */}
        {shouldShowExpanded && (
          <div className="px-4 pb-4 pt-3 border-t border-gray-700">
            {expandedContent}
          </div>
        )}
      </div>
    </div>
  )
}