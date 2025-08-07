'use client'

import { SectionType } from '@/app/page'

type StorageSwipeTabsProps = {
  activeSection: SectionType
  onSectionChange: (section: SectionType) => void
}

export default function StorageSwipeTabs({ activeSection, onSectionChange }: StorageSwipeTabsProps) {
  const storageTabs = [
    {
      id: 'storage-url' as SectionType,
      label: 'URL',
      icon: '🔗'
    },
    {
      id: 'storage-images' as SectionType,
      label: '이미지',
      icon: '🖼️'
    },
    {
      id: 'storage-videos' as SectionType,
      label: '영상',
      icon: '🎥'
    },
    {
      id: 'storage-restaurants' as SectionType,
      label: '맛집',
      icon: '🍽️'
    },
    {
      id: 'storage-travel' as SectionType,
      label: '여행',
      icon: '✈️'
    }
  ]

  return (
    <div 
      className="md:hidden flex overflow-x-auto scrollbar-hide"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div className="flex" style={{ minWidth: 'max-content' }}>
        {storageTabs.map((tab) => {
          const isActive = activeSection === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className="flex-shrink-0 flex flex-col items-center justify-center transition-all duration-200 ease-out"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                minWidth: '80px',
                backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent'
              }}
              onTouchStart={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                  e.currentTarget.style.transform = 'scale(0.98)'
                }
              }}
              onTouchEnd={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              {/* Icon */}
              <div 
                className="transition-all duration-200 ease-out"
                style={{
                  fontSize: isActive ? '1.125rem' : '1rem',
                  marginBottom: 'var(--space-1)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {tab.icon}
              </div>
              
              {/* Label */}
              <span
                className="transition-all duration-200 ease-out"
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  letterSpacing: '0.01em',
                  lineHeight: '1.2'
                }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
        
        {/* Right fade gradient */}
        <div 
          className="flex-shrink-0" 
          style={{ 
            width: '1rem',
            background: 'linear-gradient(to right, transparent, var(--bg-card))',
            pointerEvents: 'none'
          }} 
        />
      </div>
    </div>
  )
}