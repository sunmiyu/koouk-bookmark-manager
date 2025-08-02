'use client'

import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showContent, setShowContent] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Much faster and simpler animation
    const timeline = [
      { delay: 100, action: () => setShowContent(true) },
      { delay: 1000, action: () => setFadeOut(true) },
      { delay: 1300, action: onComplete }
    ]

    const timeouts = timeline.map(({ delay, action }) => 
      setTimeout(action, delay)
    )

    return () => timeouts.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Simple background */}
      <div className="absolute inset-0 bg-black" />

      {/* Minimal content */}
      <div className="relative flex flex-col items-center">
        {/* Simple logo */}
        <div className={`transition-all duration-500 ${
          showContent 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">
              KOOUK
            </span>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="w-6 h-1 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}