'use client'

import { DailyCardState } from '@/components/DailyCardContent'

type DailyCardChipsProps = {
  dailyCardState: DailyCardState
  onDailyCardStateChange: (state: DailyCardState) => void
}

export default function DailyCardChips({ dailyCardState, onDailyCardStateChange }: DailyCardChipsProps) {
  const chips = [
    {
      key: 'todo' as keyof DailyCardState,
      label: 'Todo',
      icon: '✅',
      alwaysActive: true // Todo는 항상 활성화
    },
    {
      key: 'diary' as keyof DailyCardState,
      label: 'Diary',
      icon: '📔',
      alwaysActive: false
    },
    {
      key: 'budget' as keyof DailyCardState,
      label: 'Budget',
      icon: '💰',
      alwaysActive: false
    },
    {
      key: 'goalTracker' as keyof DailyCardState,
      label: 'Goal',
      icon: '🎯',
      alwaysActive: false
    }
  ]

  const handleChipToggle = (key: keyof DailyCardState) => {
    if (key === 'todo') return // Todo는 토글 불가
    
    const newState = {
      ...dailyCardState,
      [key]: !dailyCardState[key]
    }
    onDailyCardStateChange(newState)
  }

  return (
    <div 
      className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide"
      style={{ 
        padding: 'var(--space-4) var(--space-4) var(--space-2) var(--space-4)',
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
      
      {chips.map((chip) => {
        const isActive = dailyCardState[chip.key]
        const isDisabled = chip.alwaysActive
        
        return (
          <button
            key={chip.key}
            onClick={() => handleChipToggle(chip.key)}
            disabled={isDisabled}
            className="flex-shrink-0 flex items-center gap-2 transition-all duration-200 ease-out"
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              backgroundColor: isActive ? 'var(--text-primary)' : 'var(--bg-card)',
              color: isActive ? 'var(--bg-card)' : 'var(--text-secondary)',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? '500' : '400',
              opacity: isDisabled ? 0.8 : 1,
              cursor: isDisabled ? 'default' : 'pointer',
              minWidth: 'max-content'
            }}
            onTouchStart={(e) => {
              if (!isDisabled && !isActive) {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                e.currentTarget.style.transform = 'scale(0.98)'
              }
            }}
            onTouchEnd={(e) => {
              if (!isDisabled && !isActive) {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)'
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            {/* Icon */}
            <span style={{ fontSize: '0.875rem' }}>
              {chip.icon}
            </span>
            
            {/* Label */}
            <span style={{ letterSpacing: '0.01em' }}>
              {chip.label}
            </span>
            
            {/* Always active indicator */}
            {isDisabled && (
              <span style={{ 
                fontSize: '0.75rem',
                opacity: 0.7,
                marginLeft: '0.125rem'
              }}>
                •
              </span>
            )}
          </button>
        )
      })}
      
      {/* Gradient fade at the end */}
      <div 
        className="flex-shrink-0" 
        style={{ 
          width: '1rem',
          background: 'linear-gradient(to right, transparent, var(--bg-primary))',
          pointerEvents: 'none'
        }} 
      />
    </div>
  )
}