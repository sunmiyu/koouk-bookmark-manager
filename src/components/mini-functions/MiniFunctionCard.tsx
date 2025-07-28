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

  const handleToggle = () => {
    if (!isPreviewOnly && expandedContent) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div className="min-w-[300px] lg:min-w-[400px] flex-shrink-0">
      {/* Main Card */}
      <div 
        className={`card h-[40px] relative ${
          !isPreviewOnly && expandedContent ? 'cursor-pointer hover:bg-gray-700' : ''
        } ${isPreviewOnly ? 'opacity-70' : ''}`}
        onClick={handleToggle}
      >
        {/* Preview Only Badge */}
        {isPreviewOnly && (
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-yellow-600 text-yellow-100 text-xs rounded text-[10px]">
            Preview
          </div>
        )}

        {/* Content Container - 40px compact layout */}
        <div className="absolute inset-0 px-3 py-1.5 flex flex-col">
          {/* 첫 번째 줄: 아이콘 + 컨텐츠 내용 첫째줄 + 확장버튼 */}
          <div className="flex items-center h-3 mb-1 leading-none">
            <span className="text-xs mr-2 flex-shrink-0">{functionData.icon}</span>
            <div className="text-xs text-white whitespace-nowrap text-ellipsis overflow-hidden flex-1 leading-none">
              {children}
            </div>
            {!isPreviewOnly && expandedContent && (
              <button className="ml-auto text-gray-400 hover:text-white flex-shrink-0 text-xs leading-none">
                {isExpanded ? '⌃' : '⌄'}
              </button>
            )}
          </div>

          {/* 두 번째 줄: 컨텐츠 내용 둘째줄 */}
          <div className="h-3 leading-none">
            <div className="text-xs text-gray-400 whitespace-nowrap text-ellipsis overflow-hidden leading-none">
              {secondLine}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && expandedContent && !isPreviewOnly && (
        <div className="mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4">
          {expandedContent}
        </div>
      )}
    </div>
  )
}