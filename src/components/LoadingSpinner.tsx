'use client'

import { LoadingType } from '@/contexts/LoadingContext'

interface LoadingSpinnerProps {
  type: LoadingType
  message?: string
  progress?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'purple' | 'white'
}

export default function LoadingSpinner({ 
  type, 
  message, 
  progress = 0, 
  size = 'md',
  color = 'blue' 
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4'
      case 'md': return 'w-6 h-6'
      case 'lg': return 'w-8 h-8'
      default: return 'w-6 h-6'
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'border-blue-500'
      case 'green': return 'border-green-500'
      case 'purple': return 'border-purple-500'
      case 'white': return 'border-white'
      default: return 'border-blue-500'
    }
  }

  const renderSpinner = () => (
    <div className="flex items-center gap-3">
      <div 
        className={`${getSizeClasses()} border-2 ${getColorClasses()} border-t-transparent rounded-full animate-spin`}
      />
      {message && (
        <span className="text-sm text-gray-300 font-medium">{message}</span>
      )}
    </div>
  )

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
  )

  const renderProgress = () => (
    <div className="space-y-2">
      {message && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">{message}</span>
          <span className="text-gray-400">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )

  const renderDots = () => (
    <div className="flex items-center gap-3">
      <div className="flex space-x-1">
        <div className={`w-2 h-2 bg-${color}-500 rounded-full animate-bounce`}></div>
        <div className={`w-2 h-2 bg-${color}-500 rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
        <div className={`w-2 h-2 bg-${color}-500 rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
      </div>
      {message && (
        <span className="text-sm text-gray-300 font-medium">{message}</span>
      )}
    </div>
  )

  const renderPulse = () => (
    <div className="flex items-center gap-3">
      <div className={`${getSizeClasses()} bg-${color}-500 rounded-full animate-pulse`}></div>
      {message && (
        <span className="text-sm text-gray-300 font-medium animate-pulse">{message}</span>
      )}
    </div>
  )

  switch (type) {
    case 'spinner':
      return renderSpinner()
    case 'skeleton':
      return renderSkeleton()
    case 'progress':
      return renderProgress()
    case 'dots':
      return renderDots()
    case 'pulse':
      return renderPulse()
    default:
      return renderSpinner()
  }
}