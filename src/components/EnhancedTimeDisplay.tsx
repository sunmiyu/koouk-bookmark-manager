'use client'

import { useState, useEffect } from 'react'

interface EnhancedTimeDisplayProps {
  showIcon?: boolean
}

export default function EnhancedTimeDisplay({ showIcon = false }: EnhancedTimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      setCurrentTime(timeString)
    }

    updateTime()
    const timeInterval = setInterval(updateTime, 1000)

    return () => clearInterval(timeInterval)
  }, [])

  return (
    <div className="flex items-center text-sm font-medium text-gray-900">
      {showIcon && (
        <span className="mr-1">🕐</span>
      )}
      <span className="font-mono">{currentTime}</span>
    </div>
  )
}