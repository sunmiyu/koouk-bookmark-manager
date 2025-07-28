'use client'

import { useState } from 'react'
import { MiniFunctionData } from '@/types/miniFunctions'

interface MiniFunctionCardProps {
  functionData: MiniFunctionData
  children: React.ReactNode
  secondLine?: React.ReactNode
  expandedContent?: React.ReactNode
  isPreviewOnly?: boolean
}

export default function MiniFunctionCard({ 
  functionData, 
  children, 
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

  const shouldShowExpanded = (isExpanded || isHovered) && !isPreviewOnly && expandedContent

  return (
    <div className="min-w-[300px] lg:min-w-[400px] flex-shrink-0">
      <div 
        className={`bg-gray-900 border border-gray-700 rounded-lg relative transition-all duration-200 ${
          !isPreviewOnly && expandedContent ? 'cursor-pointer hover:bg-gray-800' : ''
        } ${isPreviewOnly ? 'opacity-70' : ''} ${
          shouldShowExpanded ? 'h-auto' : 'h-[50px] overflow-hidden'
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
        <div className="p-3">
          {/* 기본 2줄 컨텐츠 */}
          <div className="space-y-1">
            {/* 첫 번째 줄: 아이콘 + 첫 번째 내용 줄 + 확장버튼 */}
            <div className="flex items-center h-5 leading-5">
              <span className="text-sm mr-2 flex-shrink-0">{functionData.icon}</span>
              <div className="text-sm text-white whitespace-nowrap text-ellipsis overflow-hidden flex-1">
                {secondLine}
              </div>
              {!isPreviewOnly && expandedContent && (
                <button className="ml-auto text-gray-400 hover:text-white flex-shrink-0 text-sm opacity-50 hover:opacity-100 transition-opacity">
                  {isExpanded ? '⌃' : '⌄'}
                </button>
              )}
            </div>

            {/* 두 번째 줄: 동적 컨텐츠 또는 실제 함수 내용 미리보기 */}
            <div className="h-5 leading-5">
              <div className="text-sm text-gray-400 whitespace-nowrap text-ellipsis overflow-hidden">
                {children}
              </div>
            </div>
          </div>

          {/* 확장된 컨텐츠 */}
          {shouldShowExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              {expandedContent}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}