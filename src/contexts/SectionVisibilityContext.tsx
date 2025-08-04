'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type SectionKey = 'dailyCards' | 'news' | 'music' | 'market'

interface SectionVisibilityState {
  [key: string]: boolean
}

interface SectionUsageStats {
  [key: string]: {
    clicks: number
    timeSpent: number
    lastUsed: number
    score: number
  }
}

interface SectionVisibilityContextType {
  visibilityState: SectionVisibilityState
  toggleSection: (sectionKey: SectionKey) => void
  expandAll: () => void
  collapseAll: () => void
  isSectionVisible: (sectionKey: SectionKey) => boolean
  trackSectionUsage: (sectionKey: SectionKey) => void
  getSectionUsageScore: (sectionKey: SectionKey) => number
  applySmartCollapse: () => void
}

const defaultVisibilityState: SectionVisibilityState = {
  dailyCards: true,
  news: true,
  music: true,
  market: true,
}

const SectionVisibilityContext = createContext<SectionVisibilityContextType | undefined>(undefined)

export function SectionVisibilityProvider({ children }: { children: ReactNode }) {
  const [visibilityState, setVisibilityState] = useState<SectionVisibilityState>(defaultVisibilityState)
  const [usageStats, setUsageStats] = useState<SectionUsageStats>({})

  // Load saved state and usage stats from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sectionVisibility')
    const savedUsage = localStorage.getItem('sectionUsageStats')
    
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setVisibilityState({ ...defaultVisibilityState, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved section visibility:', error)
      }
    }
    
    if (savedUsage) {
      try {
        const parsedUsage = JSON.parse(savedUsage)
        setUsageStats(parsedUsage)
      } catch (error) {
        console.error('Failed to parse saved usage stats:', error)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sectionVisibility', JSON.stringify(visibilityState))
  }, [visibilityState])
  
  // Save usage stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sectionUsageStats', JSON.stringify(usageStats))
  }, [usageStats])

  const toggleSection = (sectionKey: SectionKey) => {
    // Track usage when toggling
    trackSectionUsage(sectionKey)
    
    setVisibilityState(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const expandAll = () => {
    setVisibilityState(prev => {
      const newState = { ...prev }
      Object.keys(newState).forEach(key => {
        newState[key] = true
      })
      return newState
    })
  }

  const collapseAll = () => {
    setVisibilityState(prev => {
      const newState = { ...prev }
      Object.keys(newState).forEach(key => {
        newState[key] = false
      })
      return newState
    })
  }

  const isSectionVisible = (sectionKey: SectionKey): boolean => {
    return visibilityState[sectionKey] ?? true
  }
  
  // Track section usage
  const trackSectionUsage = (sectionKey: SectionKey) => {
    const now = Date.now()
    setUsageStats(prev => {
      const current = prev[sectionKey] || { clicks: 0, timeSpent: 0, lastUsed: 0, score: 0 }
      const newStats = {
        ...current,
        clicks: current.clicks + 1,
        lastUsed: now,
      }
      
      // Calculate usage score based on clicks, recency, and frequency
      const daysSinceLastUse = (now - newStats.lastUsed) / (1000 * 60 * 60 * 24)
      newStats.score = newStats.clicks * (1 / Math.max(daysSinceLastUse, 0.1))
      
      return {
        ...prev,
        [sectionKey]: newStats
      }
    })
  }
  
  // Get section usage score
  const getSectionUsageScore = (sectionKey: SectionKey): number => {
    return usageStats[sectionKey]?.score || 0
  }
  
  // Apply smart auto-collapse based on usage patterns
  const applySmartCollapse = () => {
    const scores = Object.entries(usageStats).map(([key, stats]) => ({
      key: key as SectionKey,
      score: stats.score
    }))
    
    // Sort by usage score
    scores.sort((a, b) => b.score - a.score)
    
    // Always keep dailyCards and news visible (core features)
    const coreFeatures = ['dailyCards', 'news']
    
    // Auto-collapse the lowest-scoring non-core sections
    const sectionsToCollapse = scores
      .filter(({ key }) => !coreFeatures.includes(key))
      .slice(-1) // Collapse the lowest-scoring section
      .map(({ key }) => key)
    
    if (sectionsToCollapse.length > 0) {
      setVisibilityState(prev => {
        const newState = { ...prev }
        sectionsToCollapse.forEach(key => {
          newState[key] = false
        })
        return newState
      })
    }
  }

  return (
    <SectionVisibilityContext.Provider value={{
      visibilityState,
      toggleSection,
      expandAll,
      collapseAll,
      isSectionVisible,
      trackSectionUsage,
      getSectionUsageScore,
      applySmartCollapse
    }}>
      {children}
    </SectionVisibilityContext.Provider>
  )
}

export function useSectionVisibility() {
  const context = useContext(SectionVisibilityContext)
  if (context === undefined) {
    throw new Error('useSectionVisibility must be used within a SectionVisibilityProvider')
  }
  return context
}