'use client'

import { ReactNode, useEffect } from 'react'
import { useSectionVisibility } from '@/contexts/SectionVisibilityContext'

type SectionKey = 'dailyCards' | 'news' | 'music' | 'market'

interface CollapsibleSectionProps {
  sectionKey: SectionKey
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
  showGlobalControls?: boolean
}

export default function CollapsibleSection({ 
  sectionKey, 
  title, 
  icon, 
  children, 
  className = '',
  headerClassName = '',
  showGlobalControls = false
}: CollapsibleSectionProps) {
  const { isSectionVisible, toggleSection, expandAll, collapseAll, trackSectionUsage, applySmartCollapse } = useSectionVisibility()
  
  const isVisible = isSectionVisible(sectionKey)
  
  // Smart auto-collapse trigger - runs every 30 seconds for non-core sections
  useEffect(() => {
    const coreFeatures = ['dailyCards', 'news']
    if (!coreFeatures.includes(sectionKey) && showGlobalControls) {
      const interval = setInterval(() => {
        applySmartCollapse()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [sectionKey, showGlobalControls, applySmartCollapse])

  return (
    <div className={`transition-all duration-300 ${className}`}>
      {/* Section Header */}
      <div className={`flex items-center justify-between mb-4 ${headerClassName}`}>
        <div className="flex items-center gap-3">
          {icon && <div className="text-blue-500">{icon}</div>}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Global Controls - only show on first section */}
          {showGlobalControls && (
            <>
              <button
                onClick={expandAll}
                className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                title="Expand all sections"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <button
                onClick={collapseAll}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                title="Collapse all sections"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
              <div className="w-px h-4 bg-gray-600 mx-1"></div>
            </>
          )}
          
          {/* Individual Section Toggle */}
          <button
            onClick={() => toggleSection(sectionKey)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
            title={isVisible ? 'Collapse section' : 'Expand section'}
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${
                isVisible ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Section Content */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isVisible 
            ? 'opacity-100 max-h-none' 
            : 'opacity-0 max-h-0'
        }`}
        style={{
          transitionProperty: 'opacity, max-height, padding, margin',
        }}
        onClick={() => {
          // Track usage when content is clicked
          if (isVisible) {
            trackSectionUsage(sectionKey)
          }
        }}
      >
        {/* Only render children when visible for performance */}
        {isVisible && (
          <div className="animate-fadeIn">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

// Add fadeIn animation to global CSS or as inline styles
export const fadeInAnimation = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`