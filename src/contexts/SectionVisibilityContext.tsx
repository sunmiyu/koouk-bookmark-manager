'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type SectionKey = 'weather' | 'dailyCards' | 'news' | 'music' | 'market'

interface SectionVisibilityState {
  [key: string]: boolean
}

interface SectionVisibilityContextType {
  visibilityState: SectionVisibilityState
  toggleSection: (sectionKey: SectionKey) => void
  expandAll: () => void
  collapseAll: () => void
  isSectionVisible: (sectionKey: SectionKey) => boolean
}

const defaultVisibilityState: SectionVisibilityState = {
  weather: true,
  dailyCards: true,
  news: true,
  music: true,
  market: true,
}

const SectionVisibilityContext = createContext<SectionVisibilityContextType | undefined>(undefined)

export function SectionVisibilityProvider({ children }: { children: ReactNode }) {
  const [visibilityState, setVisibilityState] = useState<SectionVisibilityState>(defaultVisibilityState)

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sectionVisibility')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setVisibilityState({ ...defaultVisibilityState, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved section visibility:', error)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sectionVisibility', JSON.stringify(visibilityState))
  }, [visibilityState])

  const toggleSection = (sectionKey: SectionKey) => {
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

  return (
    <SectionVisibilityContext.Provider value={{
      visibilityState,
      toggleSection,
      expandAll,
      collapseAll,
      isSectionVisible
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