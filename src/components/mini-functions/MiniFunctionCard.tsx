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
    <div className="min-w-[300px] flex-shrink-0">
      {/* Main Card */}
      <div 
        className={`card h-[100px] relative ${
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
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">{functionData.icon}</span>
          <h3 className="font-medium text-sm text-white">{functionData.title}</h3>
          {!isPreviewOnly && expandedContent && (
            <button className="ml-auto text-gray-400 hover:text-white">
              {isExpanded ? '⌃' : '⌄'}
            </button>
          )}
        </div>

        {/* Main content */}
        <div className="text-xs space-y-1">
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