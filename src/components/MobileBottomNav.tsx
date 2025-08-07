'use client'

import { SectionType } from '@/app/page'

type MobileBottomNavProps = {
  activeSection: SectionType
  onSectionChange: (section: SectionType) => void
}

export default function MobileBottomNav({ activeSection, onSectionChange }: MobileBottomNavProps) {
  const navItems = [
    {
      id: 'dailyCard' as SectionType,
      label: 'Daily Card',
      icon: '📝',
      defaultSection: 'dailyCard'
    },
    {
      id: 'bigNote' as SectionType,
      label: 'Big Note', 
      icon: '📔',
      defaultSection: 'bigNote'
    },
    {
      id: 'storage' as SectionType,
      label: 'Storage',
      icon: '💾',
      defaultSection: 'storage-url'
    },
    {
      id: 'info' as SectionType,
      label: 'Info',
      icon: '📰',
      defaultSection: 'info-stocks'
    },
    {
      id: 'talkTalk' as SectionType,
      label: 'TalkTalk',
      icon: '💬',
      defaultSection: 'talkTalk'
    }
  ]

  const getMainSection = (section: SectionType): string => {
    if (section === 'dailyCard') return 'dailyCard'
    if (section === 'bigNote') return 'bigNote'
    if (section.startsWith('storage')) return 'storage'
    if (section.startsWith('info')) return 'info'
    if (section === 'talkTalk') return 'talkTalk'
    return 'dailyCard'
  }

  const handleNavClick = (navItem: typeof navItems[0]) => {
    const targetSection = navItem.defaultSection as SectionType
    onSectionChange(targetSection)
  }

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-light)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around" style={{ padding: 'var(--space-2) var(--space-1)' }}>
        {navItems.map((item) => {
          const isActive = getMainSection(activeSection) === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="flex flex-col items-center justify-center transition-all duration-200 ease-out"
              style={{
                padding: 'var(--space-2) var(--space-1)',
                minWidth: '60px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent'
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
                  fontSize: isActive ? '1.25rem' : '1.125rem',
                  marginBottom: 'var(--space-1)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {item.icon}
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
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}