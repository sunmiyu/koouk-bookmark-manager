'use client'

import { useState, useEffect } from 'react'

interface SwipeIndicatorProps {
  currentTab: string
  totalTabs: number
  className?: string
}

export default function SwipeIndicator({ currentTab, totalTabs, className = '' }: SwipeIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 && 'ontouchstart' in window
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Show indicator briefly when component mounts on mobile
    if (isMobile) {
      const hasSeenSwipeHint = localStorage.getItem('koouk_swipe_hint_seen')
      if (!hasSeenSwipeHint) {
        setShowIndicator(true)
        setTimeout(() => {
          setShowIndicator(false)
          localStorage.setItem('koouk_swipe_hint_seen', 'true')
        }, 3000)
      }
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [isMobile])

  if (!isMobile) return null

  return (
    <>
      {/* Tab Position Indicator */}
      <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-700/50">
          {Array.from({ length: totalTabs }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === ['dashboard', 'storage', 'tools', 'settings'].indexOf(currentTab)
                  ? 'bg-blue-400 w-6'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Swipe Hint Overlay */}
      {showIndicator && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 mx-4 animate-pulse">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">Swipe</span>
                </div>
                <div className="w-8 h-px bg-gray-500"></div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-sm">Swipe</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <p className="text-white text-sm font-medium">
                Swipe left or right to navigate between tabs
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}