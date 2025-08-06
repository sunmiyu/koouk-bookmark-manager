'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      style={{ color: 'var(--text-secondary)' }}
    >
      {/* Simple Spinner */}
      <div 
        className={`${sizeClasses[size]} border-2 rounded-full animate-spin`}
        style={{
          borderColor: 'var(--border-light)',
          borderTopColor: 'var(--text-primary)'
        }}
      />
      
      {/* Loading Text */}
      {text && (
        <span 
          className={`${textSizes[size]} font-medium`}
          style={{ color: 'var(--text-secondary)' }}
        >
          {text}
        </span>
      )}
    </div>
  )
}