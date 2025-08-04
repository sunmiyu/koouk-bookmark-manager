'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [newTodo, setNewTodo] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Diary states
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [charCount, setCharCount] = useState(0)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const MAX_CHARS = 500
  
  // Touch handling for mobile swipe
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // 오늘을 첫번째로, 과거 3일, 미래 3일 순서로 배치
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
    
    // 과거 3일 (어제부터 3일 전까지)
    for (let i = -1; i >= -3; i--) {
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
  const selectedDate = days[selectedIndex]?.date || new Date()

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

  // 선택된 날짜의 todos 필터링
  const getSelectedDateTodos = () => {
    const selectedDateStr = selectedDate.toDateString()
    return todayTodos.filter(todo => {
      const todoDate = new Date(todo.createdAt).toDateString()
      return todoDate === selectedDateStr
    })
  }

  // 선택된 날짜의 일기 가져오기
  const getSelectedDateEntry = useCallback((date: Date): DiaryEntry | null => {
    const dateStr = date.toDateString()
    return diaryEntries.find(entry => entry.date === dateStr) || null
  }, [diaryEntries])

  // Todo 추가
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim())
      setNewTodo('')
      setShowAddForm(false)
    }
  }

  // 일기 저장
  const saveDiary = () => {
    if (currentEntry.trim() === '') {
      const selectedDateStr = selectedDate.toDateString()
      const updatedEntries = diaryEntries.filter(entry => entry.date !== selectedDateStr)
      saveDiaryEntries(updatedEntries)
    } else {
      const selectedDateStr = selectedDate.toDateString()
      const existingEntryIndex = diaryEntries.findIndex(entry => entry.date === selectedDateStr)
      
      if (existingEntryIndex >= 0) {
        const updatedEntries = [...diaryEntries]
        updatedEntries[existingEntryIndex] = {
          ...updatedEntries[existingEntryIndex],
          content: currentEntry.trim(),
          updatedAt: new Date().toISOString()
        }
        saveDiaryEntries(updatedEntries)
      } else {
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          content: currentEntry.trim(),
          date: selectedDateStr,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        saveDiaryEntries([...diaryEntries, newEntry])
      }
    }
    
    setIsEditing(false)
  }

  // 날짜 변경 시 현재 일기 내용 로드
  useEffect(() => {
    const entry = getSelectedDateEntry(selectedDate)
    setCurrentEntry(entry?.content || '')
    setCharCount(entry?.content?.length || 0)
    setIsEditing(false)
  }, [selectedIndex, diaryEntries, getSelectedDateEntry, selectedDate])

  // 텍스트 변경 핸들러
  const handleTextChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setCurrentEntry(value)
      setCharCount(value.length)
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

    if (isLeftSwipe && selectedIndex < days.length - 1) {
      scrollToCard(selectedIndex + 1)
    }
    if (isRightSwipe && selectedIndex > 0) {
      scrollToCard(selectedIndex - 1)
    }
  }

  const selectedTodos = getSelectedDateTodos()
  const selectedEntry = getSelectedDateEntry(selectedDate)
  const isToday = selectedDate.toDateString() === new Date().toDateString()

  return (
    <div className="mb-4">
      {/* Date Navigation Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-white">Today&apos;s</h2>
          <div className="text-sm text-gray-400">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        {/* Horizontal Date Scroll */}
        <div 
          ref={containerRef}
          className="flex gap-2 overflow-x-auto pb-2 scroll-smooth"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => scrollToCard(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedIndex === index
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
              style={{ scrollSnapAlign: 'center' }}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Synchronized Card Container */}
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
        
        {days.map((day, index) => (
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
                {/* Add Todo Form - only for today */}
                {index === selectedIndex && isToday && (
                  <div className="mb-4">
                    {!showAddForm ? (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors text-sm"
                      >
                        + Add todo
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newTodo}
                          onChange={(e) => setNewTodo(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="What needs to be done?"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddTodo}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowAddForm(false)
                              setNewTodo('')
                            }}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Todo List */}
                {index === selectedIndex ? (
                  selectedTodos.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      {isToday ? "No todos yet" : "No todos for this date"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTodos.slice(0, 6).map((todo) => (
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
                          
                          {isToday && (
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Swipe to view todos
                  </div>
                )}
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
                {index === selectedIndex ? (
                  <>
                    {isEditing || (!selectedEntry && isToday) ? (
                      <div className="space-y-3 h-full flex flex-col">
                        <div className="flex-1 relative">
                          <textarea
                            value={currentEntry}
                            onChange={(e) => handleTextChange(e.target.value)}
                            className="w-full h-full bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                            placeholder={`Write your thoughts for ${isToday ? 'today' : 'this day'}...`}
                            autoFocus
                          />
                          <div className={`absolute bottom-2 right-2 text-xs ${
                            charCount > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-gray-500'
                          }`}>
                            {charCount}/{MAX_CHARS}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setIsEditing(false)
                              const entry = getSelectedDateEntry(selectedDate)
                              setCurrentEntry(entry?.content || '')
                              setCharCount(entry?.content?.length || 0)
                            }}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveDiary}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {selectedEntry ? (
                          <div className="space-y-3 h-full flex flex-col">
                            <div className="flex-1 bg-gray-800/30 rounded p-3 overflow-y-auto">
                              <div className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                                {selectedEntry.content}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <div className="text-gray-500">
                                {selectedEntry.updatedAt !== selectedEntry.createdAt ? 'Updated' : 'Created'}: {' '}
                                {new Date(selectedEntry.updatedAt).toLocaleDateString()}
                              </div>
                              {isToday && (
                                <button
                                  onClick={() => setIsEditing(true)}
                                  className="text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            {isToday ? (
                              <div className="space-y-3">
                                <div>No diary entry yet</div>
                                <button
                                  onClick={() => setIsEditing(true)}
                                  className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/30 transition-colors text-sm"
                                >
                                  Start Writing
                                </button>
                              </div>
                            ) : (
                              <div>No diary entry</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Swipe to view diary
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}