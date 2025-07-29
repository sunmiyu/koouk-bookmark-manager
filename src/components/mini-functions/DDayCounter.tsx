'use client'

import { useState, useEffect, useCallback } from 'react'
import { DDayData, DDayEvent } from '@/types/miniFunctions'
import { ddayService } from '@/lib/supabase-services'
import { supabase } from '@/lib/supabase'

interface DDayCounterProps {
  isPreviewOnly?: boolean
}

export default function DDayCounter({ isPreviewOnly = false }: DDayCounterProps) {
  const [ddayData, setDdayData] = useState<DDayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    name: '',
    targetDate: '',
    category: '',
    isImportant: false
  })

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
      
      if (isPreviewOnly) {
        // 프리뷰용 더미 데이터
        const data = generateSampleData()
        setDdayData(data)
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // 비로그인 사용자 - 더미 데이터 사용
        const data = generateSampleData()
        setDdayData(data)
        return
      }

      // Supabase에서 데이터 로드
      const dbEvents = await ddayService.getAll(user.id)
      
      if (dbEvents.length === 0) {
        // 첫 사용자 - 샘플 데이터 생성
        const sampleEvents = [
          {
            user_id: user.id,
            name: '신년',
            target_date: '2026-01-01',
            category: '기념일',
            is_important: true
          },
          {
            user_id: user.id,
            name: '생일',
            target_date: '2025-03-15',
            category: '개인',
            is_important: true
          }
        ]
        
        for (const event of sampleEvents) {
          await ddayService.create(event)
        }
        
        // 다시 로드
        const newDbEvents = await ddayService.getAll(user.id)
        const events = convertDbEventsToEvents(newDbEvents)
        const data = processEventsData(events)
        setDdayData(data)
      } else {
        const events = convertDbEventsToEvents(dbEvents)
        const data = processEventsData(events)
        setDdayData(data)
      }
      
    } catch (error) {
      console.error('D-day 데이터 로드 실패:', error)
      // 에러 시 더미 데이터 표시
      const data = generateSampleData()
      setDdayData(data)
    } finally {
      setLoading(false)
    }
  }, [isPreviewOnly])

  const convertDbEventsToEvents = (dbEvents: unknown[]): DDayEvent[] => {
    return dbEvents.map((event: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      id: event.id,
      name: event.name,
      targetDate: event.target_date,
      category: event.category || '',
      isImportant: event.is_important || false
    }))
  }

  const processEventsData = (events: DDayEvent[]): DDayData => {
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

  const addNewEvent = async () => {
    if (isPreviewOnly || !newEvent.name.trim() || !newEvent.targetDate) return

    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      await ddayService.create({
        user_id: user.id,
        name: newEvent.name.trim(),
        target_date: newEvent.targetDate,
        category: newEvent.category || '기타',
        is_important: newEvent.isImportant
      })

      // 데이터 새로고침
      await loadDDayData()
      
      // 폼 초기화
      setNewEvent({
        name: '',
        targetDate: '',
        category: '',
        isImportant: false
      })
      setIsAddingEvent(false)
    } catch (error) {
      console.error('Failed to add D-day event:', error)
    } finally {
      setLoading(false)
    }
  }

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
      <div className="flex justify-between items-center py-1">
        <span className="text-white font-medium truncate flex-1">
          {nextEvent.name}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">
            {new Date(nextEvent.targetDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </span>
          <span className="text-blue-400 font-bold text-sm">
            D-{nextEvent.daysRemaining}
          </span>
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

      {/* 이벤트 추가 버튼 */}
      {!isPreviewOnly && !isAddingEvent && (
        <div className="text-center pt-2">
          <button
            onClick={() => setIsAddingEvent(true)}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            + 새 D-day 추가
          </button>
        </div>
      )}

      {/* 이벤트 추가 폼 */}
      {!isPreviewOnly && isAddingEvent && (
        <div className="space-y-2 p-2 bg-gray-800 rounded">
          <input
            type="text"
            value={newEvent.name}
            onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
            placeholder="이벤트 이름"
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
          />
          <input
            type="date"
            value={newEvent.targetDate}
            onChange={(e) => setNewEvent(prev => ({ ...prev, targetDate: e.target.value }))}
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
          />
          <input
            type="text"
            value={newEvent.category}
            onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value }))}
            placeholder="카테고리 (예: 기념일, 개인 등)"
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={newEvent.isImportant}
                onChange={(e) => setNewEvent(prev => ({ ...prev, isImportant: e.target.checked }))}
                className="rounded"
              />
              중요 이벤트
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addNewEvent}
              disabled={loading || !newEvent.name.trim() || !newEvent.targetDate}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:opacity-50"
            >
              추가
            </button>
            <button
              onClick={() => {
                setIsAddingEvent(false)
                setNewEvent({ name: '', targetDate: '', category: '', isImportant: false })
              }}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
            >
              취소
            </button>
          </div>
        </div>
      )}

    </div>
  )
}