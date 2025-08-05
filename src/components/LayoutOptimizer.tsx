'use client'

import { useEffect, useState } from 'react'
import { useLayoutAnalytics } from '@/hooks/useLayoutAnalytics'

interface LayoutOptimizerProps {
  children: React.ReactNode
  onLayoutChange?: (optimizations: LayoutOptimizations | null) => void
}

interface LayoutOptimizations {
  layout: string
  recommendations: string[]
  prioritizedFeatures: string[]
  suggestedLayout: {
    headerCompact?: boolean
    bottomNavigation?: boolean
    singleColumn?: boolean
    reducedPadding?: boolean
    twoColumnLayout?: boolean
    touchOptimized?: boolean
    mediumPadding?: boolean
    sidebar?: boolean
    expandedView?: boolean
    keyboardShortcuts?: boolean
    customizable?: boolean
  }
}

export default function LayoutOptimizer({ children, onLayoutChange }: LayoutOptimizerProps) {
  const { metrics, trackInteraction, getOptimizedLayout, getPerformanceInsights } = useLayoutAnalytics()
  const [optimizations, setOptimizations] = useState<LayoutOptimizations | null>(null)
  const [showInsights, setShowInsights] = useState(false)

  useEffect(() => {
    // Track page view
    trackInteraction('page', 'focus')
  }, [trackInteraction])

  useEffect(() => {
    if (metrics) {
      const optimizedLayout = getOptimizedLayout()
      setOptimizations(optimizedLayout)
      onLayoutChange?.(optimizedLayout)
    }
  }, [metrics, getOptimizedLayout, onLayoutChange])

  // Add click tracking to all interactive elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const elementInfo = getElementInfo(target)
      
      if (elementInfo) {
        trackInteraction(elementInfo, 'click', { x: e.clientX, y: e.clientY })
      }
    }

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const elementInfo = getElementInfo(target)
      
      if (elementInfo && isInteractiveElement(target)) {
        trackInteraction(elementInfo, 'hover')
      }
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('mouseover', handleHover)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('mouseover', handleHover)
    }
  }, [trackInteraction])

  const performanceInsights = getPerformanceInsights()

  return (
    <div className="relative">
      {children}
      
      {/* Development Analytics Panel - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            title="Layout Analytics"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          {showInsights && (
            <div className="absolute bottom-16 right-0 w-80 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Layout Analytics</h3>
                  <button
                    onClick={() => setShowInsights(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {performanceInsights && (
                  <>
                    {/* Engagement Score */}
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">User Engagement</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              performanceInsights.userEngagement.level === 'high' ? 'bg-green-500' :
                              performanceInsights.userEngagement.level === 'medium' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${performanceInsights.userEngagement.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-white font-medium">
                          {performanceInsights.userEngagement.score}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Session: {performanceInsights.userEngagement.sessionDuration} • 
                        Scroll: {performanceInsights.userEngagement.scrollDepth}
                      </div>
                    </div>

                    {/* Most Used Features */}
                    {metrics?.mostUsedFeatures && metrics.mostUsedFeatures.length > 0 && (
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Most Used Features</h4>
                        <div className="space-y-1">
                          {metrics.mostUsedFeatures.slice(0, 3).map((feature, index) => (
                            <div key={feature} className="flex items-center justify-between text-xs">
                              <span className="text-gray-300">{feature}</span>
                              <div className="flex items-center gap-1">
                                <div className="w-8 bg-gray-700 rounded-full h-1">
                                  <div 
                                    className="bg-blue-400 h-1 rounded-full"
                                    style={{ width: `${((metrics.clickHeatmap[feature] || 0) / Math.max(...Object.values(metrics.clickHeatmap)) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-gray-400 w-8 text-right">
                                  {metrics.clickHeatmap[feature] || 0}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Layout Recommendations */}
                    {optimizations && (
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h4>
                        <div className="space-y-1">
                          {optimizations.recommendations.slice(0, 2).map((rec: string, recIndex: number) => (
                            <div key={recIndex} className="text-xs text-gray-400 flex items-start gap-1">
                              <span className="text-blue-400 mt-0.5">•</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Viewport Info */}
                    {metrics && (
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Viewport</h4>
                        <div className="text-xs text-gray-400">
                          {metrics.viewport.width}×{metrics.viewport.height} • 
                          {metrics.viewport.isMobile ? ' Mobile' : 
                           metrics.viewport.isTablet ? ' Tablet' : ' Desktop'}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getElementInfo(element: HTMLElement): string | null {
  // Priority order for identifying elements
  const identifiers = [
    element.getAttribute('data-analytics'),
    element.getAttribute('aria-label'),
    element.getAttribute('title'),
    element.textContent?.trim(),
    element.tagName.toLowerCase()
  ]

  for (const identifier of identifiers) {
    if (identifier && identifier.length > 0 && identifier.length < 50) {
      return identifier
    }
  }

  // Fallback to element type and position
  const tagName = element.tagName.toLowerCase()
  const parent = element.parentElement
  const siblings = parent ? Array.from(parent.children) : []
  const index = siblings.indexOf(element)
  
  return `${tagName}-${index}`
}

function isInteractiveElement(element: HTMLElement): boolean {
  const interactiveTagNames = ['button', 'a', 'input', 'select', 'textarea']
  const interactiveRoles = ['button', 'link', 'menuitem', 'tab']
  const interactiveTypes = ['submit', 'button', 'reset']
  
  return (
    interactiveTagNames.includes(element.tagName.toLowerCase()) ||
    interactiveRoles.includes(element.getAttribute('role') || '') ||
    interactiveTypes.includes(element.getAttribute('type') || '') ||
    element.hasAttribute('onclick') ||
    element.style.cursor === 'pointer'
  )
}