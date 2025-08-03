'use client'

import { useState, useEffect } from 'react'

interface Anniversary {
  id: string
  title: string
  date: string // MM-DD format for yearly recurring
  year?: number // Optional original year
  category: string
  recurring: boolean
}

export default function AnniversaryFunction() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('miniFunction_anniversaries')
    if (saved) {
      setAnniversaries(JSON.parse(saved))
    }
  }, [])

  const calculateNextAnniversary = (date: string, year?: number) => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const [month, day] = date.split('-').map(Number)
    
    // This year's anniversary
    let nextDate = new Date(currentYear, month - 1, day)
    
    // If it's already passed this year, use next year
    if (nextDate < today) {
      nextDate = new Date(currentYear + 1, month - 1, day)
    }
    
    const diffTime = nextDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return {
      nextDate,
      daysUntil: diffDays,
      yearsSince: year ? currentYear - year : 0
    }
  }

  const formatAnniversary = (anniversary: Anniversary) => {
    const info = calculateNextAnniversary(anniversary.date, anniversary.year)
    const [month, day] = anniversary.date.split('-').map(Number)
    
    return {
      ...info,
      dateString: `${month}월 ${day}일`,
      fullDateString: `${info.nextDate.getFullYear()}년 ${month}월 ${day}일`
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '생일': return '🎂'
      case '결혼기념일': return '💒'
      case '연인기념일': return '💕'
      case '입사기념일': return '💼'
      case '졸업기념일': return '🎓'
      case '가족': return '👨‍👩‍👧‍👦'
      default: return '🎉'
    }
  }

  // Sort by closest anniversary first
  const sortedAnniversaries = [...anniversaries].sort((a, b) => {
    const aInfo = calculateNextAnniversary(a.date, a.year)
    const bInfo = calculateNextAnniversary(b.date, b.year)
    return aInfo.daysUntil - bInfo.daysUntil
  })

  const upcomingAnniversaries = sortedAnniversaries.filter(ann => {
    const info = calculateNextAnniversary(ann.date, ann.year)
    return info.daysUntil <= 30 // Show anniversaries within 30 days
  })

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">기념일 현황</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">등록된 기념일: </span>
            <span className="text-white font-medium">{anniversaries.length}개</span>
          </div>
          <div>
            <span className="text-gray-400">다가오는 기념일: </span>
            <span className="text-white font-medium">{upcomingAnniversaries.length}개</span>
          </div>
        </div>
      </div>

      {/* Settings Info */}
      <div className="bg-pink-900/20 border border-pink-700/30 rounded-lg p-3">
        <div className="text-sm text-pink-400 mb-1">기념일 설정</div>
        <div className="text-xs text-gray-300">
          톱니바퀴 → Mini Function Control에서 기념일을 추가할 수 있습니다.
        </div>
      </div>

      {/* Upcoming Anniversaries */}
      {upcomingAnniversaries.length > 0 && (
        <div>
          <div className="text-sm font-medium text-white mb-2">다가오는 기념일</div>
          <div className="space-y-2">
            {upcomingAnniversaries.slice(0, 5).map(anniversary => {
              const info = formatAnniversary(anniversary)
              return (
                <div key={anniversary.id} className="bg-pink-900/20 border border-pink-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(anniversary.category)}</span>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {anniversary.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {info.dateString} ({anniversary.category})
                          {info.yearsSince > 0 && ` • ${info.yearsSince}주년`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        info.daysUntil === 0 ? 'text-pink-400' :
                        info.daysUntil <= 7 ? 'text-yellow-400' : 'text-white'
                      }`}>
                        {info.daysUntil === 0 ? '오늘!' : `D-${info.daysUntil}`}
                      </div>
                      {info.daysUntil > 0 && (
                        <div className="text-xs text-gray-400">
                          {info.fullDateString}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All Anniversaries */}
      {anniversaries.length > upcomingAnniversaries.length && (
        <div>
          <div className="text-sm font-medium text-gray-400 mb-2">전체 기념일</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {sortedAnniversaries.filter(ann => {
              const info = calculateNextAnniversary(ann.date, ann.year)
              return info.daysUntil > 30
            }).slice(0, 5).map(anniversary => {
              const info = formatAnniversary(anniversary)
              return (
                <div key={anniversary.id} className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-2 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getCategoryIcon(anniversary.category)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-300">
                          {anniversary.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {info.dateString} • {anniversary.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      D-{info.daysUntil}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {anniversaries.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          설정된 기념일이 없습니다
        </div>
      )}
    </div>
  )
}