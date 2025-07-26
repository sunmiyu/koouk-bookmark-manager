'use client'

import { useState, useEffect } from 'react'

export default function Weather() {
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      
      // 시간 포맷 (24시간 형식)
      const timeString = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      
      // 날짜 포맷
      const dateString = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
      
      setCurrentTime(timeString)
      setCurrentDate(dateString)
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-2">
      {/* 데스크톱: 한 줄로 표시 */}
      <div className="hidden md:flex items-center responsive-gap-md responsive-text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Seoul, South Korea</span>
        </div>
        
        <span className="text-gray-500">|</span>
        
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            <circle cx="12" cy="12" r="5"/>
          </svg>
          <span>8°</span>
          <span className="text-gray-500">|</span>
          <span>15°</span>
          <span className="text-gray-500">|</span>
          <span>12°</span>
        </div>
        
        <span className="text-gray-500">|</span>
        
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <span className="font-mono">{currentTime}</span>
        </div>
      </div>

      {/* 모바일/태블릿: 여러 줄로 표시 */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between responsive-text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs sm:text-sm">Seoul, KR</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span className="font-mono text-xs sm:text-sm">{currentTime}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 responsive-text-sm text-gray-300">
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            <circle cx="12" cy="12" r="5"/>
          </svg>
          <span>8°</span>
          <span className="text-gray-500">|</span>
          <span>15°</span>
          <span className="text-gray-500">|</span>
          <span>12°</span>
        </div>
      </div>
      
      <div className="responsive-text-sm text-gray-400 text-center md:text-left">
        {currentDate}
      </div>
    </div>
  )
}