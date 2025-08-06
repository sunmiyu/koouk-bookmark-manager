'use client'

import { useEffect, useState, useCallback } from 'react'
import { Toast as ToastType, ToastPosition } from '@/contexts/ToastContext'

interface ToastProps {
  toast: ToastType
  onClose: (id: string) => void
  position: ToastPosition
}

export default function Toast({ toast, onClose, position }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(toast.id)
    }, 200)
  }, [onClose, toast.id])

  useEffect(() => {
    // Entry animation
    setTimeout(() => setIsVisible(true), 10)

    // Auto hide
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.duration, handleClose])

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: '#DCFCE7',
          borderColor: '#16A34A',
          color: '#166534'
        }
      case 'error':
        return {
          backgroundColor: '#FEE2E2',
          borderColor: '#DC2626',
          color: '#991B1B'
        }
      case 'warning':
        return {
          backgroundColor: '#FEF3C7',
          borderColor: '#F59E0B',
          color: '#92400E'
        }
      case 'info':
      default:
        return {
          backgroundColor: '#DBEAFE',
          borderColor: '#3B82F6',
          color: '#1E40AF'
        }
    }
  }

  const getTypeIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  const getAnimationClasses = () => {
    const isRightSide = position.includes('right')
    const isLeftSide = position.includes('left')
    const isCenter = position.includes('center')
    
    let transformOrigin = 'center'
    let translateX = '0'
    
    if (isRightSide) {
      transformOrigin = 'right'
      translateX = isExiting ? '100%' : (isVisible ? '0' : '100%')
    } else if (isLeftSide) {
      transformOrigin = 'left'
      translateX = isExiting ? '-100%' : (isVisible ? '0' : '-100%')
    } else if (isCenter) {
      transformOrigin = 'center'
      translateX = '0'
    }

    const opacity = isExiting ? '0' : (isVisible ? '1' : '0')
    const scale = isExiting ? '0.95' : (isVisible ? '1' : '0.95')

    return {
      transform: `translateX(${translateX}) scale(${scale})`,
      opacity,
      transformOrigin,
      transition: 'all 0.2s ease-out'
    }
  }

  const typeStyles = getTypeStyles()

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-lg shadow-lg min-w-80 max-w-md cursor-pointer"
      style={{
        ...typeStyles,
        border: `1px solid ${typeStyles.borderColor}`,
        ...getAnimationClasses()
      }}
      onClick={handleClose}
    >
      <div className="flex-shrink-0 text-lg">
        {getTypeIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm mb-1">
          {toast.title}
        </div>
        {toast.message && (
          <div className="text-sm opacity-90">
            {toast.message}
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
        }}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
        style={{ color: typeStyles.color }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}