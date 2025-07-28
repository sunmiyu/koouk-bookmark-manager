'use client'

import { useState } from 'react'
import { MiniFunctionData } from '@/types/miniFunctions'

interface MiniFunctionCardProps {
  functionData: MiniFunctionData
  children: React.ReactNode
  expandedContent?: React.ReactNode
  isPreviewOnly?: boolean
}

export default function MiniFunctionCard({ 
  functionData, 
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

  return (
    <div className="min-w-[300px] lg:min-w-[400px] flex-shrink-0">
      {/* Main Card */}
      <div 
        className={`card h-[80px] relative py-2 px-3 ${
          !isPreviewOnly && expandedContent ? 'cursor-pointer hover:bg-gray-700' : ''
        } ${isPreviewOnly ? 'opacity-70' : ''}`}
        onClick={handleToggle}
      >
        {/* Preview Only Badge */}
        {isPreviewOnly && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">
            Preview
          </div>
        )}

        {/* Content */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{functionData.icon}</span>
          <h3 className="font-medium text-xs text-white">{functionData.title}</h3>
          {!isPreviewOnly && expandedContent && (
            <button className="ml-auto text-gray-400 hover:text-white">
              {isExpanded ? '⌃' : '⌄'}
            </button>
          )}
        </div>

        {/* Main content */}
        <div className="text-xs space-y-1 overflow-hidden h-[35px]">
          {children}
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