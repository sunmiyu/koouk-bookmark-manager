'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTodayTodos } from '@/contexts/TodayTodosContext'

interface DiaryEntry {
  id: string
  content: string
  date: string
  createdAt: string
  updatedAt: string
}

interface DayData {
  date: Date
  label: string
  isToday: boolean
  dateStr: string
}

export default function SynchronizedTodayCards() {
  const { todayTodos, addTodo, toggleTodo, deleteTodo } = useTodayTodos()
  const [selectedIndex, setSelectedIndex] = useState(0) // Today is at index 0 (first)
  const [newTodo, setNewTodo] = useState<Record<number, string>>({})
  const [showAddForm, setShowAddForm] = useState<Record<number, boolean>>({})
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Diary states
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<Record<number, string>>({})
  const [isEditing, setIsEditing] = useState<Record<number, boolean>>({})
  const [charCount, setCharCount] = useState<Record<number, number>>({})
  
  const containerRef = useRef<HTMLDivElement>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const MAX_CHARS = 500
  
  // Touch handling for mobile swipe
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // 오늘을 첫번째로, 과거 30일, 미래 3일 순서로 배치
  const generateDays = (): DayData[] => {
    const days: DayData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 오늘을 첫번째에 배치
    days.push({
      date: new Date(today),
      label: "Today",
      isToday: true,
      dateStr: today.toDateString()
    })
    
    // 과거 30일 (어제부터 30일 전까지)
    for (let i = -1; i >= -30; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
      
      days.push({
        date: new Date(date),
        label: `${month}/${day} ${dayOfWeek}`,
        isToday: false,
        dateStr: date.toDateString()
      })
    }
    
    // 미래 3일 (내일부터 3일 후까지)
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
      
      days.push({
        date: new Date(date),
        label: `${month}/${day} ${dayOfWeek}`,
        isToday: false,
        dateStr: date.toDateString()
      })
    }
    
    return days
  }

  const days = generateDays()
  
  // Show limited cards when collapsed (Today + last 6 days + next 3 days)
  const displayDays = isExpanded ? days : days.slice(0, 10)

  // 로컬 스토리지에서 일기 데이터 로드
  useEffect(() => {
    const savedEntries = localStorage.getItem('diaryEntries')
    if (savedEntries) {
      try {
        setDiaryEntries(JSON.parse(savedEntries))
      } catch (error) {
        console.error('Failed to load diary entries:', error)
      }
    }
  }, [])

  // 일기 데이터 저장
  const saveDiaryEntries = (entries: DiaryEntry[]) => {
    setDiaryEntries(entries)
    localStorage.setItem('diaryEntries', JSON.stringify(entries))
  }

  // 특정 날짜의 todos 필터링
  const getDateTodos = (date: Date) => {
    const dateStr = date.toDateString()
    return todayTodos.filter(todo => {
      const todoDate = new Date(todo.createdAt).toDateString()
      return todoDate === dateStr
    })
  }

  // 선택된 날짜의 일기 가져오기
  const getSelectedDateEntry = useCallback((date: Date): DiaryEntry | null => {
    const dateStr = date.toDateString()
    return diaryEntries.find(entry => entry.date === dateStr) || null
  }, [diaryEntries])

  // Todo 추가
  const handleAddTodo = (cardIndex: number) => {
    const todoText = newTodo[cardIndex]?.trim()
    if (todoText) {
      const cardDate = displayDays[cardIndex]?.date || new Date()
      addTodo(todoText, cardDate)
      setNewTodo(prev => ({ ...prev, [cardIndex]: '' }))
      setShowAddForm(prev => ({ ...prev, [cardIndex]: false }))
    }
  }

  // 일기 저장
  const saveDiary = (cardIndex: number) => {
    const cardDate = displayDays[cardIndex]?.date || new Date()
    const entryContent = currentEntry[cardIndex]?.trim() || ''
    
    if (entryContent === '') {
      const dateStr = cardDate.toDateString()
      const updatedEntries = diaryEntries.filter(entry => entry.date !== dateStr)
      saveDiaryEntries(updatedEntries)
    } else {
      const dateStr = cardDate.toDateString()
      const existingEntryIndex = diaryEntries.findIndex(entry => entry.date === dateStr)
      
      if (existingEntryIndex >= 0) {
        const updatedEntries = [...diaryEntries]
        updatedEntries[existingEntryIndex] = {
          ...updatedEntries[existingEntryIndex],
          content: entryContent,
          updatedAt: new Date().toISOString()
        }
        saveDiaryEntries(updatedEntries)
      } else {
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          content: entryContent,
          date: dateStr,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        saveDiaryEntries([...diaryEntries, newEntry])
      }
    }
    
    setIsEditing(prev => ({ ...prev, [cardIndex]: false }))
  }

  // 날짜 변경 시 각 카드의 일기 내용 로드
  useEffect(() => {
    const newEntries: Record<number, string> = {}
    const newCounts: Record<number, number> = {}
    
    displayDays.forEach((day, index) => {
      const entry = getSelectedDateEntry(day.date)
      newEntries[index] = entry?.content || ''
      newCounts[index] = entry?.content?.length || 0
    })
    
    setCurrentEntry(newEntries)
    setCharCount(newCounts)
  }, [displayDays, diaryEntries, getSelectedDateEntry])

  // 텍스트 변경 핸들러
  const handleTextChange = (cardIndex: number, value: string) => {
    if (value.length <= MAX_CHARS) {
      setCurrentEntry(prev => ({ ...prev, [cardIndex]: value }))
      setCharCount(prev => ({ ...prev, [cardIndex]: value.length }))
    }
  }

  // 스크롤 핸들러
  const scrollToCard = (index: number) => {
    setSelectedIndex(index)
    if (containerRef.current) {
      const cardWidth = 320 // Fixed card width + margin  
      let scrollLeft = index * cardWidth
      // Today(첫번째) 카드일 때는 왼쪽 끝에서 시작
      if (index === 0) {
        scrollLeft = 0
      }
      containerRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      })
    }
    if (cardContainerRef.current) {
      const cardWidth = 320 // Fixed card width + margin
      let scrollLeft = index * cardWidth
      // Today(첫번째) 카드일 때는 왼쪽 끝에서 시작
      if (index === 0) {
        scrollLeft = 0
      }
      cardContainerRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      })
    }
  }

  // 컴포넌트 마운트 시 Today 카드로 스크롤
  useEffect(() => {
    scrollToCard(0)
  }, [])

  // Touch handlers for swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && selectedIndex < displayDays.length - 1) {
      scrollToCard(selectedIndex + 1)
    }
    if (isRightSwipe && selectedIndex > 0) {
      scrollToCard(selectedIndex - 1)
    }
  }


  return (
    <div className="mb-4">

      {/* History Header with Expand/Collapse */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Daily Cards</h2>
          <span className="text-sm text-gray-400">
            {isExpanded ? `${days.length} days • Full History` : `${displayDays.length} days • Recent`}
          </span>
        </div>
        <button
          onClick={() => {
            setIsExpanded(!isExpanded)
            // If collapsing and current selection is beyond the collapsed range, reset to today
            if (isExpanded && selectedIndex >= 10) {
              setSelectedIndex(0)
              scrollToCard(0)
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all duration-200"
        >
          <span className="text-sm">
            {isExpanded ? 'Show Less' : 'View History'}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Synchronized Card Container with Navigation */}
      <div className="relative">
        {/* Left Scroll Arrow - only show when expanded and not at start */}
        {isExpanded && selectedIndex > 0 && (
          <button
            onClick={() => scrollToCard(selectedIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800/80 hover:bg-gray-700/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Right Scroll Arrow - only show when expanded and not at end */}
        {isExpanded && selectedIndex < displayDays.length - 1 && (
          <button
            onClick={() => scrollToCard(selectedIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800/80 hover:bg-gray-700/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div 
          ref={cardContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {displayDays.map((day, index) => (
          <div 
            key={index}
            className="flex-shrink-0 w-80 space-y-2"
            style={{ scrollSnapAlign: 'center' }}
          >
            {/* Todo Card */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50 h-40 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Todos
                </h3>
                <span className="text-xs text-gray-400">{day.label}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {/* Add Todo Form - now available for all dates */}
                <div className="mb-4">
                  {!showAddForm[index] ? (
                    <button
                      onClick={() => setShowAddForm(prev => ({ ...prev, [index]: true }))}
                      className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors text-sm"
                    >
                      + Add todo
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newTodo[index] || ''}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, [index]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTodo(index)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="What needs to be done?"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddTodo(index)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddForm(prev => ({ ...prev, [index]: false }))
                            setNewTodo(prev => ({ ...prev, [index]: '' }))
                          }}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Todo List */}
                {(() => {
                  const dayTodos = getDateTodos(day.date)
                  return dayTodos.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      No todos for this date
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dayTodos.slice(0, 6).map((todo) => (
                        <div
                          key={todo.id}
                          className={`flex items-center gap-2 p-2 rounded transition-all text-sm ${
                            todo.completed 
                              ? 'bg-gray-800/30 opacity-60' 
                              : 'bg-gray-800/50'
                          }`}
                        >
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
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
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Diary Card */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50 h-40 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Mini Diary
                </h3>
                <span className="text-xs text-gray-400">{day.label}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto">
{(() => {
                  const dayEntry = getSelectedDateEntry(day.date)
                  return (
                    <>
                      {isEditing[index] || !dayEntry ? (
                        <div className="space-y-3 h-full flex flex-col">
                          <div className="flex-1 relative">
                            <textarea
                              value={currentEntry[index] || ''}
                              onChange={(e) => handleTextChange(index, e.target.value)}
                              className="w-full h-full bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                              placeholder={`Write your thoughts for this day...`}
                              autoFocus
                            />
                            <div className={`absolute bottom-2 right-2 text-xs ${
                              (charCount[index] || 0) > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-gray-500'
                            }`}>
                              {charCount[index] || 0}/{MAX_CHARS}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setIsEditing(prev => ({ ...prev, [index]: false }))
                                const entry = getSelectedDateEntry(day.date)
                                setCurrentEntry(prev => ({ ...prev, [index]: entry?.content || '' }))
                                setCharCount(prev => ({ ...prev, [index]: entry?.content?.length || 0 }))
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveDiary(index)}
                              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {dayEntry ? (
                            <div className="space-y-3 h-full flex flex-col">
                              <div className="flex-1 bg-gray-800/30 rounded p-3 overflow-y-auto">
                                <div className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                                  {dayEntry.content}
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <div className="text-gray-500">
                                  {dayEntry.updatedAt !== dayEntry.createdAt ? 'Updated' : 'Created'}: {' '}
                                  {new Date(dayEntry.updatedAt).toLocaleDateString()}
                                </div>
                                <button
                                  onClick={() => setIsEditing(prev => ({ ...prev, [index]: true }))}
                                  className="text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                              <div className="space-y-3">
                                <div>No diary entry yet</div>
                                <button
                                  onClick={() => setIsEditing(prev => ({ ...prev, [index]: true }))}
                                  className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/30 transition-colors text-sm"
                                >
                                  Start Writing
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}