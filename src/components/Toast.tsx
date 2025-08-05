'use client'

import { useState, useEffect } from 'react'
import { Toast as ToastType, ToastPosition } from '@/contexts/ToastContext'

interface ToastProps {
  toast: ToastType
  onClose: (id: string) => void
  position: ToastPosition
}

export default function Toast({ toast, onClose, position }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (toast.duration! / 100))
          if (newProgress <= 0) {
            clearInterval(interval)
            return 0
          }
          return newProgress
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [toast.duration, toast.persistent])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => onClose(toast.id), 300)
  }

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-600/90 to-emerald-600/90 border-green-500/50 text-white'
      case 'error':
        return 'bg-gradient-to-r from-red-600/90 to-rose-600/90 border-red-500/50 text-white'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-600/90 to-orange-600/90 border-yellow-500/50 text-white'
      case 'info':
        return 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 border-blue-500/50 text-white'
      default:
        return 'bg-gray-800/90 border-gray-700/50 text-white'
    }
  }

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50'
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`
      case 'top-left':
        return `${baseClasses} top-4 left-4`
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`
      default:
        return `${baseClasses} top-4 right-4`
    }
  }

  const getAnimationClasses = () => {
    const isTop = position.includes('top')
    const isRight = position.includes('right')
    const isLeft = position.includes('left')
    const isCenter = position.includes('center')

    if (isLeaving) {
      if (isCenter) {
        return 'opacity-0 scale-95 transform -translate-x-1/2 translate-y-2'
      } else if (isRight) {
        return 'opacity-0 scale-95 transform translate-x-full'
      } else if (isLeft) {
        return 'opacity-0 scale-95 transform -translate-x-full'
      }
    }

    if (!isVisible) {
      if (isCenter) {
        return `opacity-0 scale-95 transform -translate-x-1/2 ${isTop ? '-translate-y-2' : 'translate-y-2'}`
      } else if (isRight) {
        return `opacity-0 scale-95 transform translate-x-full ${isTop ? '-translate-y-2' : 'translate-y-2'}`
      } else if (isLeft) {
        return `opacity-0 scale-95 transform -translate-x-full ${isTop ? '-translate-y-2' : 'translate-y-2'}`
      }
    }

    if (isCenter) {
      return 'opacity-100 scale-100 transform -translate-x-1/2 translate-y-0'
    }
    return 'opacity-100 scale-100 transform translate-x-0 translate-y-0'
  }

  const getProgressBarColor = () => {
    switch (toast.type) {
      case 'success': return 'bg-green-300'
      case 'error': return 'bg-red-300'
      case 'warning': return 'bg-yellow-300'
      case 'info': return 'bg-blue-300'
      default: return 'bg-gray-300'
    }
  }

  return (
    <div
      className={`
        ${getPositionClasses()}
        ${getTypeStyles()}
        ${getAnimationClasses()}
        backdrop-blur-sm border rounded-xl shadow-2xl
        min-w-80 max-w-md
        transition-all duration-300 ease-out
        overflow-hidden
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          {toast.icon && (
            <div className="flex-shrink-0 text-xl">
              {toast.icon}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-sm leading-tight">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-sm opacity-90 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Action Button */}
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    toast.action!.onClick()
                    handleClose()
                  }}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      {!toast.persistent && toast.duration && toast.duration > 0 && (
        <div className="h-1 bg-black/20">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}