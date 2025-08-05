'use client'

import { useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'

interface LoadingButtonProps {
  children: React.ReactNode
  onClick?: () => Promise<void> | void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  loadingText?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function LoadingButton({
  children,
  onClick,
  loading: externalLoading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  loadingText = 'Loading...',
  type = 'button'
}: LoadingButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  
  const isLoading = externalLoading || internalLoading
  const isDisabled = disabled || isLoading

  const handleClick = async () => {
    if (!onClick || isDisabled) return

    try {
      setInternalLoading(true)
      await onClick()
    } catch (error) {
      console.error('Button action failed:', error)
    } finally {
      setInternalLoading(false)
    }
  }

  const getVariantClasses = () => {
    const baseClasses = 'font-medium transition-all duration-200 flex items-center justify-center gap-2'
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl`
      case 'secondary':
        return `${baseClasses} bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-gray-500`
      case 'success':
        return `${baseClasses} bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl`
      case 'danger':
        return `${baseClasses} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl`
      case 'ghost':
        return `${baseClasses} bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600`
      default:
        return baseClasses
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm rounded-lg'
      case 'md':
        return 'px-4 py-2 text-sm rounded-lg'
      case 'lg':
        return 'px-6 py-3 text-base rounded-xl'
      default:
        return 'px-4 py-2 text-sm rounded-lg'
    }
  }

  const getDisabledClasses = () => {
    if (isDisabled) {
      return 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none'
    }
    return 'hover:scale-105 active:scale-95'
  }

  const getSpinnerColor = (): 'blue' | 'green' | 'purple' | 'white' => {
    switch (variant) {
      case 'ghost':
        return 'white'
      default:
        return 'white'
    }
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${getDisabledClasses()}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <LoadingSpinner 
            type="spinner" 
            size="sm" 
            color={getSpinnerColor()}
          />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}