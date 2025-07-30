'use client'

import { useState, useEffect } from 'react'

interface Anniversary {
  id: string
  type: string
  name: string
  date: string
  createdAt: string
}

interface AnniversariesProps {
  isPreviewOnly?: boolean
}

export default function Anniversaries({ isPreviewOnly = false }: AnniversariesProps) {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])

  useEffect(() => {
    if (isPreviewOnly) {
      // Sample data for preview
      setAnniversaries([
        { 
          id: '1', 
          type: '생일', 
          name: '엄마 생신', 
          date: '2024-03-15', 
          createdAt: new Date().toISOString() 
        },
        { 
          id: '2', 
          type: '기타', 
          name: '회사 입사일', 
          date: '2024-04-01', 
          createdAt: new Date().toISOString() 
        }
      ])
      return
    }

    // Load from localStorage or API
    const saved = localStorage.getItem('koouk_anniversaries')
    if (saved) {
      setAnniversaries(JSON.parse(saved))
    }
  }, [isPreviewOnly])

  const getUpcomingAnniversaries = () => {
    const today = new Date()
    const currentYear = today.getFullYear()
    
    return anniversaries
      .map(anniversary => {
        const anniversaryDate = new Date(anniversary.date)
        anniversaryDate.setFullYear(currentYear)
        
        // If the anniversary has passed this year, show next year's
        if (anniversaryDate < today) {
          anniversaryDate.setFullYear(currentYear + 1)
        }
        
        const daysUntil = Math.ceil((anniversaryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          ...anniversary,
          nextDate: anniversaryDate,
          daysUntil
        }
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { 
      month: 'long', 
      day: 'numeric'
    })
  }

  const upcomingAnniversaries = getUpcomingAnniversaries()

  return (
    <div className="space-y-2">
      {isPreviewOnly ? (
        <div className="text-gray-300 text-sm">
          <div className="mb-2">등록된 기념일: {anniversaries.length}개</div>
          {upcomingAnniversaries.slice(0, 2).map((anniversary) => (
            <div key={anniversary.id} className="text-xs text-gray-400 flex justify-between">
              <span>{anniversary.name}</span>
              <span>D-{anniversary.daysUntil}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingAnniversaries.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {upcomingAnniversaries.map((anniversary) => (
                <div key={anniversary.id} className="p-3 bg-gray-800 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                          {anniversary.type}
                        </span>
                        <span className="text-white text-sm font-medium">
                          {anniversary.name}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {formatDate(anniversary.nextDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 text-sm font-medium">
                        D-{anniversary.daysUntil}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              등록된 기념일이 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  )
}