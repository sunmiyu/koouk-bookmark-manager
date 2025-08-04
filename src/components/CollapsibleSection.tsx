'use client'

import { ReactNode } from 'react'
import { useSectionVisibility } from '@/contexts/SectionVisibilityContext'

type SectionKey = 'weather' | 'dailyCards' | 'news' | 'music' | 'market'

interface CollapsibleSectionProps {
  sectionKey: SectionKey
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
}

export default function CollapsibleSection({ 
  sectionKey, 
  title, 
  icon, 
  children, 
  className = '',
  headerClassName = ''
}: CollapsibleSectionProps) {
  const { isSectionVisible, toggleSection } = useSectionVisibility()
  
  const isVisible = isSectionVisible(sectionKey)

  return (
    <div className={`transition-all duration-300 ${className}`}>
      {/* Section Header */}
      <div className={`flex items-center justify-between mb-4 ${headerClassName}`}>
        <div className="flex items-center gap-3">
          {icon && <div className="text-blue-500">{icon}</div>}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        
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