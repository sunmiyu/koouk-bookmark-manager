'use client'

import { useSectionVisibility } from '@/contexts/SectionVisibilityContext'

export default function SectionControls() {
  const { expandAll, collapseAll, visibilityState } = useSectionVisibility()
  
  const visibleCount = Object.values(visibilityState).filter(Boolean).length
  const totalCount = Object.keys(visibilityState).length
  const allExpanded = visibleCount === totalCount
  const allCollapsed = visibleCount === 0

  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm text-gray-400">
        Sections ({visibleCount}/{totalCount})
      </span>
      
      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={expandAll}
          disabled={allExpanded}
          className="px-3 py-1.5 text-xs bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white rounded-lg transition-colors"
          title="Expand all sections"
        >
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>Expand All</span>
          </div>
        </button>
        
        <button
          onClick={collapseAll}
          disabled={allCollapsed}
          className="px-3 py-1.5 text-xs bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white rounded-lg transition-colors"
          title="Collapse all sections"
        >
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4v16m6-16v16M5 8h14M5 16h14" />
            </svg>
            <span>Collapse All</span>
          </div>
        </button>
      </div>
    </div>
  )
}