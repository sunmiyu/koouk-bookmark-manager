'use client'

import { useState, useEffect } from 'react'

interface TimeZone {
  id: string
  name: string
  city: string
  timezone: string
  offset: number
  isActive: boolean
}

export default function WorldTimeFunction() {
  const [timeZones, setTimeZones] = useState<TimeZone[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const saved = localStorage.getItem('miniFunction_worldTime')
    if (saved) {
      setTimeZones(JSON.parse(saved))
    } else {
      // Default time zones
      const defaultZones: TimeZone[] = [
        { id: '1', name: '서울', city: 'Seoul', timezone: 'Asia/Seoul', offset: 9, isActive: true },
        { id: '2', name: '뉴욕', city: 'New York', timezone: 'America/New_York', offset: -5, isActive: true },
        { id: '3', name: '런던', city: 'London', timezone: 'Europe/London', offset: 0, isActive: true },
        { id: '4', name: '도쿄', city: 'Tokyo', timezone: 'Asia/Tokyo', offset: 9, isActive: true }
      ]
      setTimeZones(defaultZones)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (timezone: string, offset: number) => {
    try {
      const now = new Date()
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
      const localTime = new Date(utc + (offset * 3600000))
      
      return {
        time: localTime.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        date: localTime.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric'
        }),
        day: localTime.toLocaleDateString('ko-KR', { weekday: 'short' }),
        isPM: localTime.getHours() >= 12,
        isNextDay: localTime.getDate() !== now.getDate()
      }
    } catch {
      return {
        time: '--:--',
        date: '--',
        day: '--',
        isPM: false,
        isNextDay: false
      }
    }
  }

  const getTimeOfDayIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0])
    if (hour >= 6 && hour < 12) return '🌅' // Morning
    if (hour >= 12 && hour < 18) return '☀️' // Afternoon
    if (hour >= 18 && hour < 22) return '🌆' // Evening
    return '🌙' // Night
  }

  const getTimeDifference = (offset: number) => {
    const seoulOffset = 9
    const diff = offset - seoulOffset
    
    if (diff === 0) return '기준시간'
    const sign = diff > 0 ? '+' : ''
    return `${sign}${diff}시간`
  }

  const activeTimeZones = timeZones.filter(tz => tz.isActive)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">세계시간 현황</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">표시 중인 도시: </span>
            <span className="text-white font-medium">{activeTimeZones.length}개</span>
          </div>
          <div>
            <span className="text-gray-400">현재 시간: </span>
            <span className="text-white font-medium">
              {currentTime.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Info */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
        <div className="text-sm text-blue-400 mb-1">세계시간 설정</div>
        <div className="text-xs text-gray-300">
          톱니바퀴 → Mini Function Control에서 표시할 도시를 선택할 수 있습니다.
        </div>
      </div>

      {/* Time Zones */}
      {activeTimeZones.length > 0 && (
        <div>
          <div className="text-sm font-medium text-white mb-2">세계 시간</div>
          <div className="space-y-2">
            {activeTimeZones.map(timezone => {
              const timeInfo = formatTime(timezone.timezone, timezone.offset)
              return (
                <div key={timezone.id} className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTimeOfDayIcon(timeInfo.time)}</span>
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          {timezone.name}
                          {timeInfo.isNextDay && (
                            <span className="text-xs bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded">
                              +1일
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {timezone.city} • {getTimeDifference(timezone.offset)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {timeInfo.time}
                      </div>
                      <div className="text-xs text-gray-400">
                        {timeInfo.date} {timeInfo.day}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Time Comparison */}
      <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3">
        <div className="text-sm text-purple-400 mb-2">시차 비교</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-300">
            <span className="text-gray-400">서울이 오후 2시일 때</span>
          </div>
          <div className="text-gray-300">
            <span className="text-gray-400">각 도시 시간</span>
          </div>
          {activeTimeZones.slice(0, 3).map(tz => {
            const diff = tz.offset - 9 // Seoul offset
            const localHour = (14 + diff + 24) % 24
            return (
              <div key={tz.id} className="text-white">
                {tz.name}: {localHour.toString().padStart(2, '0')}:00
              </div>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {timeZones.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          표시할 시간대가 없습니다
        </div>
      )}
    </div>
  )
}