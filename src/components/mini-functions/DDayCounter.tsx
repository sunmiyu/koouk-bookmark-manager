'use client'

import { useState, useEffect, useCallback } from 'react'
import { DDayData, DDayEvent } from '@/types/miniFunctions'

interface DDayCounterProps {
  isPreviewOnly?: boolean
}

export default function DDayCounter({ isPreviewOnly = false }: DDayCounterProps) {
  const [ddayData, setDdayData] = useState<DDayData | null>(null)
  const [loading, setLoading] = useState(true)

  // 더미 데이터 생성
  const generateSampleData = (): DDayData => {
    const events: DDayEvent[] = [
      {
        id: '1',
        name: '신년',
        targetDate: '2026-01-01',
        category: '기념일',
        isImportant: true
      },
      {
        id: '2',
        name: '생일',
        targetDate: '2025-03-15',
        category: '개인',
        isImportant: true
      },
      {
        id: '3',
        name: '휴가',
        targetDate: '2025-05-01',
        category: '일정',
        isImportant: false
      }
    ]

    // 가장 가까운 이벤트 찾기
    const now = new Date()
    const upcomingEvents = events
      .map(event => ({
        ...event,
        daysRemaining: Math.ceil((new Date(event.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))
      .filter(event => event.daysRemaining > 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)

    return {
      events,
      nextEvent: upcomingEvents[0],
      lastUpdated: new Date().toISOString()
    }
  }

  const loadDDayData = useCallback(async () => {
    try {
      setLoading(true)
      
      // 실제 앱에서는 API 호출 또는 로컬 저장소에서 데이터 로드
      // 현재는 더미 데이터 사용
      const data = generateSampleData()
      setDdayData(data)
      
    } catch (error) {
      console.error('D-day 데이터 로드 실패:', error)
      // 에러 시에도 더미 데이터 표시
      setDdayData(generateSampleData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDDayData()
    
    if (!isPreviewOnly) {
      // 매일 자정에 D-day 업데이트
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime()
      const midnightTimer = setTimeout(() => {
        loadDDayData()
        // 그 이후로는 24시간마다 업데이트
        setInterval(loadDDayData, 24 * 60 * 60 * 1000)
      }, msUntilMidnight)

      return () => clearTimeout(midnightTimer)
    }
  }, [isPreviewOnly, loadDDayData])

  if (loading) {
    return (
      <div className="flex items-center justify-center text-gray-400 h-12">
        <div className="animate-pulse text-sm">로딩 중...</div>
      </div>
    )
  }

  if (!ddayData || !ddayData.nextEvent) {
    return (
      <div className="text-center text-gray-500 py-2">
        <div className="text-sm">예정된 이벤트가 없습니다</div>
        <div className="text-sm text-gray-600 mt-1">
          {isPreviewOnly ? '미리보기 모드' : 'D-day 이벤트를 추가해보세요'}
        </div>
      </div>
    )
  }

  const { nextEvent } = ddayData

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-white truncate">
            {nextEvent.name}
          </div>
          <div className="text-sm text-gray-400">
            {new Date(nextEvent.targetDate).toLocaleDateString('ko-KR')}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm font-bold text-blue-400">
            D-{nextEvent.daysRemaining}
          </div>
          <div className="text-sm text-gray-500">
            {nextEvent.category}
          </div>
        </div>
      </div>

      {/* 진행률 바 (남은 일수에 따라) */}
      <div className="w-full bg-gray-700 rounded-full h-1">
        <div 
          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
          style={{ 
            width: `${Math.max(10, Math.min(90, 100 - (nextEvent.daysRemaining / 365) * 100))}%` 
          }}
        />
      </div>

      {/* 추가 이벤트 정보 */}
      {ddayData.events.length > 1 && (
        <div className="text-sm text-gray-500 text-center">
          총 {ddayData.events.length}개의 D-day 이벤트
        </div>
      )}
    </div>
  )
}