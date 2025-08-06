import { useState, useEffect, useCallback } from 'react'

interface ViewportInfo {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

interface UserInteraction {
  element: string
  action: 'click' | 'hover' | 'scroll' | 'focus'
  timestamp: number
  position?: { x: number; y: number }
}

interface LayoutMetrics {
  viewport: ViewportInfo
  interactions: UserInteraction[]
  sessionDuration: number
  scrollDepth: number
  clickHeatmap: { [key: string]: number }
  mostUsedFeatures: string[]
  engagementScore: number
}

const STORAGE_KEY = 'koouk_layout_analytics'
const SESSION_KEY = 'koouk_session_start'

export function useLayoutAnalytics() {
  const [metrics, setMetrics] = useState<LayoutMetrics | null>(null)
  const [sessionStart] = useState(() => Date.now())
  const [maxScrollDepth, setMaxScrollDepth] = useState(0)

  // Initialize analytics
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const storedMetrics = localStorage.getItem(STORAGE_KEY)
    const initialMetrics: LayoutMetrics = storedMetrics ? JSON.parse(storedMetrics) : {
      viewport: getViewportInfo(),
      interactions: [],
      sessionDuration: 0,
      scrollDepth: 0,
      clickHeatmap: {},
      mostUsedFeatures: [],
      engagementScore: 0
    }

    setMetrics(initialMetrics)
    localStorage.setItem(SESSION_KEY, sessionStart.toString())
  }, [sessionStart])

  // Update viewport info on resize
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleResize = () => {
      setMetrics(prev => prev ? {
        ...prev,
        viewport: getViewportInfo()
      } : null)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Track scroll depth
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollTop = window.pageYOffset
      const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      
      setMaxScrollDepth(prev => Math.max(prev, scrollPercentage))
      
      setMetrics(prev => prev ? {
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollPercentage)
      } : null)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Save metrics on page unload
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleBeforeUnload = () => {
      if (metrics) {
        const sessionEnd = Date.now()
        const sessionDuration = sessionEnd - sessionStart
        
        const finalMetrics = {
          ...metrics,
          sessionDuration,
          scrollDepth: maxScrollDepth,
          engagementScore: calculateEngagementScore(metrics, sessionDuration)
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalMetrics))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [metrics, sessionStart, maxScrollDepth])

  const trackInteraction = useCallback((element: string, action: UserInteraction['action'], position?: { x: number; y: number }) => {
    const interaction: UserInteraction = {
      element,
      action,
      timestamp: Date.now(),
      position
    }

    setMetrics(prev => {
      if (!prev) return null

      const newInteractions = [...prev.interactions, interaction]
      const clickHeatmap = { ...prev.clickHeatmap }
      
      if (action === 'click') {
        clickHeatmap[element] = (clickHeatmap[element] || 0) + 1
      }

      const mostUsedFeatures = Object.keys(clickHeatmap)
        .sort((a, b) => clickHeatmap[b] - clickHeatmap[a])
        .slice(0, 5)

      return {
        ...prev,
        interactions: newInteractions.slice(-100), // Keep last 100 interactions
        clickHeatmap,
        mostUsedFeatures
      }
    })
  }, [])

  const getOptimizedLayout = useCallback(() => {
    if (!metrics) return null

    const { viewport, mostUsedFeatures, engagementScore, interactions } = metrics
    
    // Mobile-first optimizations
    if (viewport.isMobile) {
      return {
        layout: 'mobile-optimized',
        recommendations: [
          'Prioritize most-used features at the top',
          'Use bottom navigation for key actions',
          'Implement swipe gestures for navigation',
          'Reduce cognitive load with simplified UI'
        ],
        prioritizedFeatures: mostUsedFeatures.slice(0, 3),
        suggestedLayout: {
          headerCompact: true,
          bottomNavigation: true,
          singleColumn: true,
          reducedPadding: true
        }
      }
    }

    // Tablet optimizations
    if (viewport.isTablet) {
      return {
        layout: 'tablet-optimized',
        recommendations: [
          'Use two-column layout for better space utilization',
          'Implement touch-friendly interaction zones',
          'Balance information density and usability'
        ],
        prioritizedFeatures: mostUsedFeatures.slice(0, 4),
        suggestedLayout: {
          twoColumnLayout: true,
          touchOptimized: true,
          mediumPadding: true
        }
      }
    }

    // Desktop optimizations
    const recentInteractions = interactions.slice(-20)
    const hasHighEngagement = engagementScore > 70

    return {
      layout: 'desktop-optimized',
      recommendations: [
        hasHighEngagement ? 'Expand information density' : 'Simplify interface',
        'Use sidebar for quick access to most-used features',
        'Implement keyboard shortcuts for power users',
        'Consider dashboard customization options'
      ],
      prioritizedFeatures: mostUsedFeatures,
      suggestedLayout: {
        sidebar: mostUsedFeatures.length > 3,
        expandedView: hasHighEngagement,
        keyboardShortcuts: recentInteractions.length > 10,
        customizable: engagementScore > 80
      }
    }
  }, [metrics])

  const getPerformanceInsights = useCallback(() => {
    if (!metrics) return null

    const { interactions, sessionDuration, scrollDepth, engagementScore } = metrics
    
    return {
      userEngagement: {
        score: engagementScore,
        level: engagementScore > 80 ? 'high' : engagementScore > 50 ? 'medium' : 'low',
        sessionDuration: formatDuration(sessionDuration),
        scrollDepth: `${Math.round(scrollDepth)}%`
      },
      usagePatterns: {
        totalInteractions: interactions.length,
        averageInteractionsPerMinute: sessionDuration > 0 ? (interactions.length / (sessionDuration / 60000)) : 0,
        mostActiveTime: getMostActiveTimePattern(interactions)
      },
      suggestions: generateOptimizationSuggestions(metrics)
    }
  }, [metrics])

  return {
    metrics,
    trackInteraction,
    getOptimizedLayout,
    getPerformanceInsights
  }
}

function getViewportInfo(): ViewportInfo {
  if (typeof window === 'undefined') {
    return {
      width: 1024,
      height: 768,
      isMobile: false,
      isTablet: false,
      isDesktop: true
    }
  }
  
  const width = window.innerWidth
  const height = window.innerHeight
  
  return {
    width,
    height,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024
  }
}

function calculateEngagementScore(metrics: LayoutMetrics, sessionDuration: number): number {
  const { interactions, scrollDepth } = metrics
  
  // Base score from interactions
  const interactionScore = Math.min(interactions.length * 2, 40)
  
  // Scroll engagement
  const scrollScore = Math.min(scrollDepth / 2, 30)
  
  // Session duration (longer sessions = higher engagement, but with diminishing returns)
  const durationMinutes = sessionDuration / 60000
  const durationScore = Math.min(durationMinutes * 5, 30)
  
  return Math.round(interactionScore + scrollScore + durationScore)
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

function getMostActiveTimePattern(interactions: UserInteraction[]): string {
  if (interactions.length === 0) return 'No data'
  
  const hours = interactions.map(i => new Date(i.timestamp).getHours())
  const hourCounts = hours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as { [key: number]: number })
  
  const mostActiveHour = Object.keys(hourCounts).reduce((a, b) => 
    hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
  )
  
  return `${mostActiveHour}:00 - ${parseInt(mostActiveHour) + 1}:00`
}

function generateOptimizationSuggestions(metrics: LayoutMetrics): string[] {
  const { viewport, mostUsedFeatures, engagementScore, scrollDepth } = metrics
  const suggestions: string[] = []
  
  if (viewport.isMobile && scrollDepth < 50) {
    suggestions.push('Consider moving important content higher on mobile')
  }
  
  if (mostUsedFeatures.length > 0) {
    suggestions.push(`Prioritize ${mostUsedFeatures[0]} in your layout`)
  }
  
  if (engagementScore < 30) {
    suggestions.push('Simplify the interface to improve user engagement')
  }
  
  if (engagementScore > 80) {
    suggestions.push('Consider adding advanced features for power users')
  }
  
  return suggestions
}