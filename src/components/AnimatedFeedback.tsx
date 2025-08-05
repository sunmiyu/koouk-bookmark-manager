'use client'

import { useState, useEffect } from 'react'

export type FeedbackType = 'success' | 'error' | 'warning' | 'info'

interface AnimatedFeedbackProps {
  type: FeedbackType
  message: string
  description?: string
  duration?: number
  onComplete?: () => void
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  autoHide?: boolean
}

export default function AnimatedFeedback({
  type,
  message,
  description,
  duration = 3000,
  onComplete,
  size = 'md',
  showIcon = true,
  autoHide = true
}: AnimatedFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto hide
    if (autoHide && duration > 0) {
      const hideTimer = setTimeout(() => {
        setIsLeaving(true)
        setTimeout(() => {
          onComplete?.()
        }, 500)
      }, duration)
      
      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    }
    
    return () => clearTimeout(showTimer)
  }, [duration, autoHide, onComplete])

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          icon: (
            <div className="relative">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="absolute inset-0 animate-ping">
                <svg className="w-6 h-6 text-green-400 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )
        }
      case 'error':
        return {
          bgColor: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          icon: (
            <div className="relative animate-shake">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )
        }
      case 'warning':
        return {
          bgColor: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          icon: (
            <div className="animate-bounce">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          )
        }
      case 'info':
        return {
          bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          icon: (
            <div className="animate-pulse">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )
        }
      default:
        return {
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-400',
          icon: null
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3 text-sm'
      case 'md':
        return 'p-4 text-base'
      case 'lg':
        return 'p-6 text-lg'
      default:
        return 'p-4 text-base'
    }
  }

  const config = getTypeConfig()

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} ${getSizeClasses()}
        border rounded-xl backdrop-blur-sm shadow-lg
        transition-all duration-500 ease-out transform
        ${isVisible && !isLeaving 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-2'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {showIcon && config.icon && (
          <div className="flex-shrink-0 mt-0.5">
            {config.icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${config.textColor} leading-tight`}>
            {message}
          </h4>
          {description && (
            <p className="text-gray-300 text-sm mt-1 leading-relaxed opacity-90">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Animated Progress Bar for Auto-hide */}
      {autoHide && duration > 0 && (
        <div className="mt-3 h-1 bg-black/20 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              type === 'success' ? 'bg-green-400' :
              type === 'error' ? 'bg-red-400' :
              type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
            } transition-all ease-linear`}
            style={{
              width: isVisible ? '0%' : '100%',
              transitionDuration: `${duration}ms`
            }}
          />
        </div>
      )}
    </div>
  )
}