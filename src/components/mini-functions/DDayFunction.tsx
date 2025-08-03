'use client'

import { useState, useEffect } from 'react'

interface DDayEvent {
  id: string
  title: string
  date: string
  category: string
  color: string
}

export default function DDayFunction() {
  const [events, setEvents] = useState<DDayEvent[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('miniFunction_dday')
    if (saved) {
      setEvents(JSON.parse(saved))
    }
  }, [])

  const calculateDDay = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    
    // 시간을 00:00:00으로 설정하여 정확한 날짜 계산
    today.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)
    
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const formatDDay = (days: number) => {
    if (days === 0) return 'D-Day!'
    if (days > 0) return `D-${days}`
    return `D+${Math.abs(days)}`
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-400 border-red-700/30 bg-red-900/20'
      case 'blue': return 'text-blue-400 border-blue-700/30 bg-blue-900/20'
      case 'green': return 'text-green-400 border-green-700/30 bg-green-900/20'
      case 'purple': return 'text-purple-400 border-purple-700/30 bg-purple-900/20'
      case 'yellow': return 'text-yellow-400 border-yellow-700/30 bg-yellow-900/20'
      default: return 'text-gray-400 border-gray-700/30 bg-gray-900/20'
    }
  }

  // Sort events by date (closest first)
  const sortedEvents = [...events].sort((a, b) => {
    const daysA = Math.abs(calculateDDay(a.date))
    const daysB = Math.abs(calculateDDay(b.date))
    return daysA - daysB
  })

  const upcomingEvents = sortedEvents.filter(event => calculateDDay(event.date) >= 0)
  const pastEvents = sortedEvents.filter(event => calculateDDay(event.date) < 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">D-Day 현황</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">다가오는 일정: </span>
            <span className="text-white font-medium">{upcomingEvents.length}개</span>
          </div>
          <div>
            <span className="text-gray-400">지난 일정: </span>
            <span className="text-white font-medium">{pastEvents.length}개</span>
          </div>
        </div>
      </div>

      {/* Settings Info */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
        <div className="text-sm text-blue-400 mb-1">D-Day 설정</div>
        <div className="text-xs text-gray-300">
          톱니바퀴 → Mini Function Control에서 D-Day 이벤트를 추가할 수 있습니다.
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <div className="text-sm font-medium text-white mb-2">다가오는 일정</div>
          <div className="space-y-2">
            {upcomingEvents.slice(0, 5).map(event => {
              const dDay = calculateDDay(event.date)
              return (
                <div key={event.id} className={`rounded-lg p-3 border ${getColorClass(event.color)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {event.date} • {event.category}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ml-2 ${
                      dDay === 0 ? 'text-red-400' : dDay <= 7 ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {formatDDay(dDay)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-400 mb-2">지난 일정</div>
          <div className="space-y-2">
            {pastEvents.slice(0, 3).map(event => {
              const dDay = calculateDDay(event.date)
              return (
                <div key={event.id} className="rounded-lg p-3 border border-gray-700/30 bg-gray-800/20 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-400 truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.date} • {event.category}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-500 ml-2">
                      {formatDDay(dDay)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          설정된 D-Day 이벤트가 없습니다
        </div>
      )}
    </div>
  )
}