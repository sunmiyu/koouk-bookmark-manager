'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTodayTodos } from '@/contexts/TodayTodosContext'
import DailyCardsHistory from './DailyCardsHistory'

interface DayData {
  date: Date
  label: string
  isToday: boolean
  dateStr: string
  isPast: boolean
  isFuture: boolean
}

type ViewMode = 'main' | 'history' | 'specific'

export default function EnhancedDailyCards() {
  const { diaryEntries, updateDiaryEntry, getSelectedDateEntry, todayTodos, addTodo, toggleTodo, deleteTodo } = useTodayTodos()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [currentEntry, setCurrentEntry] = useState<string[]>([])
  const [charCount, setCharCount] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('main')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  
  // Todo states
  const [newTodo, setNewTodo] = useState<Record<number, string>>({})
  const [showAddForm, setShowAddForm] = useState<Record<number, boolean>>({})

  // 메인 화면: 오늘 + 미래 7일 (총 8개)
  const generateMainDays = (): DayData[] => {
    const days: DayData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 8; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
      
      days.push({
        date: new Date(date),
        label: i === 0 ? "Today" : `${month}/${day} ${dayOfWeek}`,
        isToday: i === 0,
        dateStr: date.toDateString(),
        isPast: false,
        isFuture: i > 0
      })
    }
    
    return days
  }

  // 특정 날짜 중심 ±2일 (총 5개)
  const generateSpecificDays = (centerDate: Date): DayData[] => {
    const days: DayData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = -2; i <= 2; i++) {
      const date = new Date(centerDate)
      date.setDate(centerDate.getDate() + i)
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
      
      const isToday = date.toDateString() === today.toDateString()
      const isPast = date < today
      const isFuture = date > today
      
      days.push({
        date: new Date(date),
        label: isToday ? "Today" : `${month}/${day} ${dayOfWeek}`,
        isToday,
        dateStr: date.toDateString(),
        isPast,
        isFuture
      })
    }
    
    return days
  }

  // 현재 표시할 날짜들 결정
  const getCurrentDays = (): DayData[] => {
    if (viewMode === 'specific' && selectedDate) {
      return generateSpecificDays(selectedDate)
    }
    return generateMainDays()
  }

  const displayDays = getCurrentDays()

  // 일기 데이터 로드 및 동기화
  useEffect(() => {
    const newEntries: string[] = []
    const newCounts: number[] = []
    
    displayDays.forEach((day) => {
      const entry = getSelectedDateEntry(day.date)
      newEntries.push(entry)
      newCounts.push(entry.length)
    })
    
    setCurrentEntry(newEntries)
    setCharCount(newCounts)
  }, [displayDays, diaryEntries, getSelectedDateEntry])

  // 텍스트 변경 핸들러
  const handleTextChange = (cardIndex: number, value: string) => {
    if (cardIndex >= 0 && cardIndex < displayDays.length) {
      const targetDate = displayDays[cardIndex].date
      updateDiaryEntry(targetDate, value)
    }
  }

  // Todo 관련 함수들
  const getDateTodos = (date: Date) => {
    const dateStr = date.toDateString()
    return todayTodos.filter(todo => {
      const todoDate = new Date(todo.createdAt).toDateString()
      return todoDate === dateStr
    })
  }

  const handleAddTodo = (cardIndex: number) => {
    const todoText = newTodo[cardIndex]?.trim()
    if (todoText && cardIndex >= 0 && cardIndex < displayDays.length) {
      const cardDate = displayDays[cardIndex].date
      addTodo(todoText, cardDate)
      setNewTodo(prev => ({ ...prev, [cardIndex]: '' }))
      setShowAddForm(prev => ({ ...prev, [cardIndex]: false }))
    }
  }

  // 부드러운 스크롤
  const scrollToCard = useCallback((index: number) => {
    if (cardContainerRef.current) {
      const cardWidth = 320 // w-80 = 320px
      const gap = 16 // gap-4 = 16px
      const scrollLeft = index * (cardWidth + gap)
      
      cardContainerRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      })
    }
  }, [])

  // 특정 날짜로 이동
  const goToDate = (date: Date) => {
    setIsAnimating(true)
    setSelectedDate(date)
    setViewMode('specific')
    setSelectedIndex(2) // 중앙 카드 선택
    setShowCalendar(false)
    
    setTimeout(() => {
      scrollToCard(2)
      setIsAnimating(false)
    }, 100)
  }

  // 오늘로 돌아가기
  const goToToday = () => {
    setIsAnimating(true)
    setViewMode('main')
    setSelectedDate(null)
    setSelectedIndex(0)
    
    setTimeout(() => {
      scrollToCard(0)
      setIsAnimating(false)
    }, 100)
  }

  // 히스토리 보기
  const showHistory = () => {
    setViewMode('history')
  }

  // 히스토리에서 날짜 선택
  const handleHistoryDateSelect = (date: Date) => {
    goToDate(date)
  }

  // 히스토리 닫기
  const closeHistory = () => {
    setViewMode('main')
  }

  // 간단한 캘린더 팝업
  const CalendarPopup = () => {
    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth()))
    
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
    
    const days = []
    
    // 빈 칸 추가
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>)
    }
    
    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isToday = date.toDateString() === today.toDateString()
      
      days.push(
        <button
          key={day}
          onClick={() => goToDate(date)}
          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
            isToday
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {day}
        </button>
      )
    }

    return (
      <div className="absolute top-full right-0 mt-2 bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-700 z-50">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="text-gray-400 hover:text-white"
          >
            ‹
          </button>
          <span className="text-white font-medium">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="text-gray-400 hover:text-white"
          >
            ›
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="w-8 h-8 text-xs text-gray-500 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    )
  }

  // History view 렌더링
  if (viewMode === 'history') {
    return (
      <DailyCardsHistory 
        onClose={closeHistory}
        onSelectDate={handleHistoryDateSelect}
      />
    )
  }

  return (
    <div className={`transition-all duration-300 ${isAnimating ? 'opacity-75' : 'opacity-100'}`}>
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Daily Cards</h2>
          <span className="text-sm text-gray-400">
            {viewMode === 'main' ? 'Today + Next 7 days' : 
             viewMode === 'specific' ? 'Selected Date ±2 days' : 'History View'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Go to Date Button */}
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all duration-200"
              title="Go to specific date"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Go to Date</span>
            </button>
            {showCalendar && <CalendarPopup />}
          </div>

          {/* View History Button */}
          <button
            onClick={showHistory}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all duration-200"
            title="View history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Back to Today Button (only show when not in main view) */}
          {viewMode !== 'main' && (
            <button
              onClick={goToToday}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg text-blue-400 hover:text-blue-300 transition-all duration-200"
              title="Back to today"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">Today</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div className="relative">
        <div
          ref={cardContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {displayDays.map((day, index) => (
            <div
              key={day.dateStr}
              className={`flex-shrink-0 w-80 h-96 bg-gray-900/50 backdrop-blur-sm rounded-xl border transition-all duration-200 ${
                selectedIndex === index
                  ? 'border-blue-500/50 shadow-lg shadow-blue-500/20'
                  : day.isToday
                  ? 'border-green-500/50 shadow-lg shadow-green-500/20'
                  : day.isFuture
                  ? 'border-gray-600/30'
                  : 'border-gray-700/50'
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${
                    day.isToday ? 'text-green-400' : 
                    day.isFuture ? 'text-blue-400' : 
                    'text-white'
                  }`}>
                    {day.label}
                  </h3>
                  <div className="flex items-center gap-2">
                    {day.isToday && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Today
                      </span>
                    )}
                    {day.isFuture && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        Future
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {charCount[index] || 0}/500
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {day.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Card Content */}
              <div className="p-4 h-80 flex flex-col">
                {/* Todo Section */}
                <div className="mb-4 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Todos
                    </h4>
                  </div>
                  
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {/* Add Todo Form */}
                    {!showAddForm[index] ? (
                      <button
                        onClick={() => setShowAddForm(prev => ({ ...prev, [index]: true }))}
                        className="w-full py-1.5 border border-dashed border-gray-600 rounded text-xs text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                      >
                        + Add todo
                      </button>
                    ) : (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={newTodo[index] || ''}
                          onChange={(e) => setNewTodo(prev => ({ ...prev, [index]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo(index)}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="What needs to be done?"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAddTodo(index)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowAddForm(prev => ({ ...prev, [index]: false }))
                              setNewTodo(prev => ({ ...prev, [index]: '' }))
                            }}
                            className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Todo List */}
                    {(() => {
                      const dayTodos = getDateTodos(day.date)
                      return dayTodos.slice(0, 3).map((todo) => (
                        <div
                          key={todo.id}
                          className={`flex items-center gap-2 p-1.5 rounded transition-all text-xs ${
                            todo.completed 
                              ? 'bg-gray-800/30 opacity-60' 
                              : 'bg-gray-800/50'
                          }`}
                        >
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
                              todo.completed
                                ? 'bg-green-600 border-green-600'
                                : 'border-gray-400'
                            }`}
                          >
                            {todo.completed && (
                              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          
                          <span className={`flex-1 ${
                            todo.completed 
                              ? 'text-gray-400 line-through' 
                              : 'text-white'
                          }`}>
                            {todo.text}
                          </span>
                          
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))
                    })()}
                  </div>
                </div>

                {/* Diary Section */}
                <div className="flex-1 border-t border-gray-800/50 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Diary
                    </h4>
                    <span className="text-xs text-gray-500">
                      {charCount[index] || 0}/500
                    </span>
                  </div>
                  <textarea
                    value={currentEntry[index] || ''}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    placeholder={
                      day.isToday 
                        ? "How was your day? Write your thoughts..."
                        : day.isFuture 
                        ? "Plan for this day..."
                        : "What happened on this day..."
                    }
                    className={`w-full h-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed placeholder-gray-500 ${
                      day.isToday ? 'text-white' : 
                      day.isFuture ? 'text-blue-200' : 
                      'text-gray-300'
                    }`}
                    maxLength={500}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Click outside to close calendar */}
      {showCalendar && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowCalendar(false)}
        />
      )}
    </div>
  )
}