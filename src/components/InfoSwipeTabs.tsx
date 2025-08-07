'use client'

import { SectionType } from '@/app/page'

type InfoSwipeTabsProps = {
  activeSection: SectionType
  onSectionChange: (section: SectionType) => void
}

export default function InfoSwipeTabs({ activeSection, onSectionChange }: InfoSwipeTabsProps) {
  const infoTabs = [
    {
      id: 'info-stocks' as SectionType,
      label: '주식',
      icon: '📈'
    },
    {
      id: 'info-news' as SectionType,
      label: '뉴스',
      icon: '📰'
    }
  ]

  return (
    <div 
      className="md:hidden flex"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)'
      }}
    >
      {infoTabs.map((tab) => {
        const isActive = activeSection === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => onSectionChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center transition-all duration-200 ease-out"
            style={{
              padding: 'var(--space-3) var(--space-4)',
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
                fontSize: 'var(--text-sm)',
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
    </div>
  )
}