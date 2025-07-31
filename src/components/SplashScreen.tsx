'use client'

import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(false)
  const [showSubtext, setShowSubtext] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timeline = [
      { delay: 300, action: () => setShowLogo(true) },
      { delay: 1200, action: () => setShowSubtext(true) },
      { delay: 2500, action: () => setFadeOut(true) },
      { delay: 3300, action: onComplete }
    ]

    const timeouts = timeline.map(({ delay, action }) => 
      setTimeout(action, delay)
    )

    return () => timeouts.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-800 ${
      fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}>
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* Animated background dots */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <div className={`transition-all duration-1000 ${
          showLogo 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-8 scale-95'
        }`}>
          <div className="text-7xl sm:text-8xl font-bold text-white tracking-wider mb-4 relative">
            <span 
              className="inline-block"
              style={{ 
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                background: 'linear-gradient(135deg, #ffffff 0%, #3b82f6 50%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              KOOUK
            </span>
            
            {/* Glowing effect */}
            <div className="absolute inset-0 text-7xl sm:text-8xl font-bold tracking-wider opacity-20 blur-sm">
              <span 
                style={{ 
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                KOOUK
              </span>
            </div>
          </div>
        </div>

        {/* Subtext */}
        <div className={`transition-all duration-800 ${
          showSubtext 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}>
          <p className="text-gray-300 text-lg sm:text-xl font-medium mb-8 text-center">
            Your Daily Hub
          </p>

          {/* Loading animation */}
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
            <span className="text-gray-400 text-sm ml-3 animate-pulse">
              Loading...
            </span>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className={`absolute -bottom-20 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${
          showSubtext 
            ? 'opacity-30 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full" />
        </div>
      </div>

      {/* Version info */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-800 ${
        showSubtext 
          ? 'opacity-60 translate-y-0' 
          : 'opacity-0 translate-y-2'
      }`}>
        <p className="text-gray-500 text-xs text-center">
          Version 1.0.0
        </p>
      </div>
    </div>
  )
}