'use client'

import { useState, useEffect } from 'react'
import { useTodayTodos } from '@/contexts/TodayTodosContext'

interface DayData {
  date: Date
  label: string
  isToday: boolean
}

export default function ScrollableTodoCards() {
  const { todayTodos, addTodo, toggleTodo, deleteTodo } = useTodayTodos()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [newTodo, setNewTodo] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // 오늘을 중심으로 ±3일 범위의 날짜 생성
  const generateDays = (): DayData[] => {
    const days: DayData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      let label = ''
      if (i === 0) {
        label = "Today's"
      } else {
        const month = date.getMonth() + 1
        const day = date.getDate()
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
        label = `${month}/${day} ${dayOfWeek}`
      }
      
      days.push({
        date: new Date(date),
        label,
        isToday: i === 0
      })
    }
    
    return days
  }

  const days = generateDays()

  // 선택된 날짜의 todos 필터링
  const getSelectedDateTodos = () => {
    const selectedDateStr = selectedDate.toDateString()
    return todayTodos.filter(todo => {
      const todoDate = new Date(todo.createdAt).toDateString()
      return todoDate === selectedDateStr
    })
  }

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim())
      setNewTodo('')
      setShowAddForm(false)
    }
  }

  const selectedTodos = getSelectedDateTodos()

  return (
    <div className="mb-4">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800/50">
        
        {/* 좌우 스크롤 날짜 선택 */}
        <div className="mb-6">
          <div className="flex overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`flex-shrink-0 px-4 py-2 mx-1 rounded-lg text-sm font-medium transition-all ${
                  selectedDate.toDateString() === day.date.toDateString()
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Todo 카드 내용 */}
        <div className="space-y-3">
          {/* 추가 버튼 - 오늘일 때만 표시 */}
          {selectedDate.toDateString() === new Date().toDateString() && (
            <div className="mb-4">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add new todo
                </button>
              ) : (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="What needs to be done?"
                      autoFocus
                    />
                    <button
                      onClick={handleAddTodo}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false)
                        setNewTodo('')
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Todo 목록 */}
          {selectedTodos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {selectedDate.toDateString() === new Date().toDateString() 
                ? "No todos for today. Add one above!" 
                : "No todos for this date."
              }
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    todo.completed 
                      ? 'bg-gray-800/30 opacity-60' 
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                  
                  {/* 오늘일 때만 삭제 버튼 표시 */}
                  {selectedDate.toDateString() === new Date().toDateString() && (
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}