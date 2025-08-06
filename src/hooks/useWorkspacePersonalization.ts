import { useState, useEffect, useCallback } from 'react'

interface WorkspaceUsage {
  section: string
  visits: number
  timeSpent: number
  lastAccessed: number
  interactions: number
}

interface PersonalizationSettings {
  preferredLayout: 'grid' | 'list' | 'compact'
  prioritizedSections: string[]
  frequentlyUsedCategories: string[]
  quickAccessItems: string[]
  smartSuggestions: boolean
  favoritesSections: string[]
  showFavoritesFirst: boolean
}

interface WorkspacePersonalization {
  usage: { [key: string]: WorkspaceUsage }
  settings: PersonalizationSettings
  suggestions: string[]
}

const STORAGE_KEY = 'koouk_workspace_personalization'
const USAGE_TRACKING_KEY = 'koouk_workspace_usage'

export function useWorkspacePersonalization() {
  const [personalization, setPersonalization] = useState<WorkspacePersonalization | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<{ [key: string]: number }>({})

  // Initialize personalization data
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY)
    const storedUsage = localStorage.getItem(USAGE_TRACKING_KEY)
    
    const defaultPersonalization: WorkspacePersonalization = {
      usage: storedUsage ? JSON.parse(storedUsage) : {},
      settings: {
        preferredLayout: 'grid',
        prioritizedSections: [],
        frequentlyUsedCategories: [],
        quickAccessItems: [],
        smartSuggestions: true,
        favoritesSections: [],
        showFavoritesFirst: true
      },
      suggestions: []
    }

    const initialData = storedData ? 
      { ...defaultPersonalization, ...JSON.parse(storedData) } : 
      defaultPersonalization

    setPersonalization(initialData)
  }, [])

  // Track section visit
  const trackSectionVisit = useCallback((section: string) => {
    if (!personalization) return

    const now = Date.now()
    setSessionStartTime(prev => ({ ...prev, [section]: now }))

    setPersonalization(prev => {
      if (!prev) return null

      const currentUsage = prev.usage[section] || {
        section,
        visits: 0,
        timeSpent: 0,
        lastAccessed: 0,
        interactions: 0
      }

      const updatedUsage = {
        ...currentUsage,
        visits: currentUsage.visits + 1,
        lastAccessed: now
      }

      const newPersonalization = {
        ...prev,
        usage: {
          ...prev.usage,
          [section]: updatedUsage
        }
      }

      localStorage.setItem(USAGE_TRACKING_KEY, JSON.stringify(newPersonalization.usage))
      return newPersonalization
    })
  }, [personalization])

  // Track section leave (to calculate time spent)
  const trackSectionLeave = useCallback((section: string) => {
    if (!personalization || !sessionStartTime[section]) return

    const timeSpent = Date.now() - sessionStartTime[section]

    setPersonalization(prev => {
      if (!prev) return null

      const currentUsage = prev.usage[section]
      if (!currentUsage) return prev

      const updatedUsage = {
        ...currentUsage,
        timeSpent: currentUsage.timeSpent + timeSpent
      }

      const newPersonalization = {
        ...prev,
        usage: {
          ...prev.usage,
          [section]: updatedUsage
        }
      }

      localStorage.setItem(USAGE_TRACKING_KEY, JSON.stringify(newPersonalization.usage))
      return newPersonalization
    })

    setSessionStartTime(prev => {
      const newState = { ...prev }
      delete newState[section]
      return newState
    })
  }, [personalization, sessionStartTime])

  // Track interaction (click, search, etc.)
  const trackInteraction = useCallback((section: string) => {
    if (!personalization) return

    setPersonalization(prev => {
      if (!prev) return null

      const currentUsage = prev.usage[section] || {
        section,
        visits: 0,
        timeSpent: 0,
        lastAccessed: Date.now(),
        interactions: 0
      }

      const updatedUsage = {
        ...currentUsage,
        interactions: currentUsage.interactions + 1
      }

      return {
        ...prev,
        usage: {
          ...prev.usage,
          [section]: updatedUsage
        }
      }
    })
  }, [personalization])

  // Get personalized layout suggestions
  const getLayoutSuggestions = useCallback(() => {
    if (!personalization) return null

    const { usage } = personalization
    const sections = Object.values(usage)
    
    // Sort sections by engagement score (visits + interactions + recency)
    const engagementScores = sections.map(section => {
      const recencyScore = Math.max(0, 7 - Math.floor((Date.now() - section.lastAccessed) / (24 * 60 * 60 * 1000))) // Days ago
      const engagementScore = section.visits + section.interactions + recencyScore
      
      return {
        section: section.section,
        score: engagementScore,
        usage: section
      }
    }).sort((a, b) => b.score - a.score)

    const mostUsedSections = engagementScores.slice(0, 3).map(item => item.section)
    const suggestions: string[] = []

    // Generate suggestions based on usage patterns
    if (mostUsedSections.includes('links')) {
      suggestions.push('Add quick access buttons to Links section')
    }
    
    if (mostUsedSections.includes('notes')) {
      suggestions.push('Enable note templates for faster creation')
    }

    if (engagementScores.length > 0 && engagementScores[0].usage.timeSpent > 300000) { // 5 minutes
      suggestions.push('Consider enabling expanded view for your most used section')
    }

    // Layout preference suggestions
    const totalInteractions = sections.reduce((sum, section) => sum + section.interactions, 0)
    if (totalInteractions > 50) {
      suggestions.push('Switch to compact layout for faster navigation')
    }

    return {
      prioritizedSections: mostUsedSections,
      layoutSuggestions: suggestions,
      recommendedLayout: totalInteractions > 30 ? 'compact' : 'grid',
      quickAccessRecommendations: mostUsedSections.slice(0, 2)
    }
  }, [personalization])

  // Update personalization settings
  const updateSettings = useCallback((newSettings: Partial<PersonalizationSettings>) => {
    setPersonalization(prev => {
      if (!prev) return null

      const updatedPersonalization = {
        ...prev,
        settings: {
          ...prev.settings,
          ...newSettings
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPersonalization))
      return updatedPersonalization
    })
  }, [])

  // Get usage analytics
  const getUsageAnalytics = useCallback(() => {
    if (!personalization) return null

    const { usage } = personalization
    const sections = Object.values(usage)
    const totalVisits = sections.reduce((sum, section) => sum + section.visits, 0)
    const totalTimeSpent = sections.reduce((sum, section) => sum + section.timeSpent, 0)
    const totalInteractions = sections.reduce((sum, section) => sum + section.interactions, 0)

    const analytics = sections.map(section => ({
      section: section.section,
      visitPercentage: totalVisits > 0 ? (section.visits / totalVisits) * 100 : 0,
      avgTimePerVisit: section.visits > 0 ? section.timeSpent / section.visits : 0,
      interactionRate: section.visits > 0 ? section.interactions / section.visits : 0,
      lastAccessed: section.lastAccessed,
      engagementLevel: getEngagementLevel(section, totalVisits, totalInteractions)
    })).sort((a, b) => b.visitPercentage - a.visitPercentage)

    return {
      totalVisits,
      totalTimeSpent,
      totalInteractions,
      sectionAnalytics: analytics,
      topSection: analytics[0]?.section || null,
      avgSessionDuration: totalVisits > 0 ? totalTimeSpent / totalVisits : 0
    }
  }, [personalization])

  // Add/remove section from favorites
  const toggleFavorite = useCallback((sectionId: string) => {
    setPersonalization(prev => {
      if (!prev) return null

      const currentFavorites = prev.settings.favoritesSections || []
      const isFavorite = currentFavorites.includes(sectionId)
      
      const updatedFavorites = isFavorite
        ? currentFavorites.filter(id => id !== sectionId)
        : [...currentFavorites, sectionId]

      const updatedSettings = {
        ...prev.settings,
        favoritesSections: updatedFavorites
      }

      const updatedPersonalization = {
        ...prev,
        settings: updatedSettings
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPersonalization))
      return updatedPersonalization
    })
  }, [])

  // Check if section is favorite
  const isFavorite = useCallback((sectionId: string) => {
    return personalization?.settings.favoritesSections?.includes(sectionId) || false
  }, [personalization])

  // Get favorite sections
  const getFavorites = useCallback(() => {
    return personalization?.settings.favoritesSections || []
  }, [personalization])

  // Reset personalization data
  const resetPersonalization = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(USAGE_TRACKING_KEY)
    setPersonalization({
      usage: {},
      settings: {
        preferredLayout: 'grid',
        prioritizedSections: [],
        frequentlyUsedCategories: [],
        quickAccessItems: [],
        smartSuggestions: true,
        favoritesSections: [],
        showFavoritesFirst: true
      },
      suggestions: []
    })
  }, [])

  return {
    personalization,
    trackSectionVisit,
    trackSectionLeave,
    trackInteraction,
    getLayoutSuggestions,
    getUsageAnalytics,
    updateSettings,
    toggleFavorite,
    isFavorite,
    getFavorites,
    resetPersonalization
  }
}

function getEngagementLevel(
  section: WorkspaceUsage, 
  totalVisits: number, 
  totalInteractions: number
): 'high' | 'medium' | 'low' {
  const visitRatio = totalVisits > 0 ? section.visits / totalVisits : 0
  const interactionRatio = totalInteractions > 0 ? section.interactions / totalInteractions : 0
  const avgRatio = (visitRatio + interactionRatio) / 2

  if (avgRatio > 0.3) return 'high'
  if (avgRatio > 0.1) return 'medium'
  return 'low'
}

export type { WorkspacePersonalization, PersonalizationSettings, WorkspaceUsage }