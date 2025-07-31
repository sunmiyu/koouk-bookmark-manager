'use client'

import { useState, useEffect } from 'react'
import { todosService } from '@/lib/supabase-services'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { useTodayTodos } from '@/contexts/TodayTodosContext'

type TodoRow = Database['public']['Tables']['todo_items']['Row']
type TodoInsert = Database['public']['Tables']['todo_items']['Insert']
type TodoUpdate = Database['public']['Tables']['todo_items']['Update']

interface Todo {
  id: string
  text: string
  completed: boolean
  date: string
  completedAt?: string
  repeat?: {
    type: 'none' | 'weekly' | 'monthly' | 'yearly'
    dayOfWeek?: number // 0=Sunday, 1=Monday, ..., 6=Saturday
    dayOfMonth?: number // 1-31
    dayOfYear?: { month: number, day: number } // 월/일
  }
}

interface DateCard {
  date: string
  todos: Todo[]
}

export default function TodoSection() {
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const { todayTodos, addTodo, toggleTodo, deleteTodo } = useTodayTodos()
  
  // 현재 날짜 기준으로 미래 7일
  const getFutureDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  // 과거 날짜들 (히스토리용)
  const getHistoryDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 10; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  // Load user and todos from Supabase
  useEffect(() => {
    loadUserAndTodos()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserAndTodos = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      
      if (authUser) {
        await loadTodos(authUser.id)
      } else {
        // Use sample data for non-authenticated users
        loadSampleData()
      }
    } catch (error) {
      console.error('Failed to load user and todos:', error)
      loadSampleData()
    } finally {
      setLoading(false)
    }
  }

  const loadTodos = async (userId: string) => {
    try {
      const todos = await todosService.getAll(userId)
      const processedTodos = todos.map(convertDbTodoToTodo)
      
      // Group todos by date
      const todosByDate: { [date: string]: Todo[] } = {}
      processedTodos.forEach(todo => {
        const date = todo.date
        if (!todosByDate[date]) {
          todosByDate[date] = []
        }
        todosByDate[date].push(todo)
      })
      
      // Create future date cards
      const futureDates = getFutureDates()
      const futureDateCards = futureDates.map(date => ({
        date,
        todos: todosByDate[date] || []
      }))
      setDateCards(futureDateCards)
      
      // Create history date cards
      const historyDates = getHistoryDates()
      const historyDateCards = historyDates.map(date => ({
        date,
        todos: todosByDate[date] || []
      }))
      setHistoryData(historyDateCards)
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  }

  const convertDbTodoToTodo = (dbTodo: TodoRow): Todo => {
    const repeat = dbTodo.repeat_type !== 'none' ? {
      type: dbTodo.repeat_type as 'none' | 'weekly' | 'monthly' | 'yearly',
      dayOfWeek: dbTodo.day_of_week || undefined,
      dayOfMonth: dbTodo.day_of_month || undefined,
      dayOfYear: dbTodo.day_of_year as { month: number, day: number } || undefined
    } : undefined
    
    return {
      id: dbTodo.id,
      text: dbTodo.title,
      completed: dbTodo.completed,
      date: dbTodo.date || new Date().toISOString().split('T')[0],
      completedAt: dbTodo.completed_at || undefined,
      repeat
    }
  }

  const loadSampleData = () => {
    // Sample data for non-authenticated users
    const futureDates = getFutureDates()
    setDateCards(futureDates.map(date => ({ date, todos: [] })))
    
    const historyDates = getHistoryDates()
    const sampleHistoryData = historyDates.map((date, index) => ({
      date,
      todos: index < 3 ? [
        { id: `history-${date}-1`, text: `Complete project milestone ${index + 1}`, completed: true, date, completedAt: date },
        { id: `history-${date}-2`, text: `Review code changes`, completed: true, date, completedAt: date },
        ...(index === 0 ? [{ id: `history-${date}-3`, text: `Team meeting notes`, completed: true, date, completedAt: date }] : [])
      ] : index < 6 ? [
        { id: `history-${date}-1`, text: `Daily standup`, completed: true, date, completedAt: date }
      ] : []
    }))
    setHistoryData(sampleHistoryData)
  }

  const [dateCards, setDateCards] = useState<DateCard[]>(
    getFutureDates().map(date => ({ date, todos: [] }))
  )
  const [historyData, setHistoryData] = useState<DateCard[]>([])
  
  const [newTodoText, setNewTodoText] = useState<{[key: string]: string}>({})
  const [showRepeatOptions, setShowRepeatOptions] = useState<{[key: string]: boolean}>({})
  const [repeatSettings, setRepeatSettings] = useState<{[key: string]: Todo['repeat']}>({})

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
    return { month, day, weekday }
  }

  const addTodoLocal = async (dateStr: string) => {
    const text = newTodoText[dateStr]?.trim()
    if (!text) return

    // If it's today's date, use the context function for synchronization
    if (isToday(dateStr)) {
      addTodo(text)
      setNewTodoText(prev => ({ ...prev, [dateStr]: '' }))
      setRepeatSettings(prev => ({ ...prev, [dateStr]: { type: 'none' } }))
      setShowRepeatOptions(prev => ({ ...prev, [dateStr]: false }))
      return
    }

    // For other dates, use the original logic
    if (!user) return

    try {
      const repeat = repeatSettings[dateStr] || { type: 'none' }
      const targetDate = new Date(dateStr)
      
      // Prepare todo insert data
      const todoInsert: TodoInsert = {
        user_id: user.id,
        title: text,
        completed: false,
        date: dateStr,
        repeat_type: repeat.type
      }
      
      // 반복 설정에 따라 dayOfWeek, dayOfMonth, dayOfYear 자동 설정
      if (repeat.type === 'weekly') {
        repeat.dayOfWeek = targetDate.getDay()
        todoInsert.day_of_week = repeat.dayOfWeek
      } else if (repeat.type === 'monthly') {
        repeat.dayOfMonth = targetDate.getDate()
        todoInsert.day_of_month = repeat.dayOfMonth
      } else if (repeat.type === 'yearly') {
        repeat.dayOfYear = { month: targetDate.getMonth() + 1, day: targetDate.getDate() }
        todoInsert.day_of_year = repeat.dayOfYear
      }

      // Save to Supabase
      const savedTodo = await todosService.create(todoInsert)
      const newTodo = convertDbTodoToTodo(savedTodo)

      setDateCards(prev => prev.map(card => 
        card.date === dateStr 
          ? { ...card, todos: [...card.todos, newTodo] }
          : card
      ))

      setNewTodoText(prev => ({ ...prev, [dateStr]: '' }))
      setRepeatSettings(prev => ({ ...prev, [dateStr]: { type: 'none' } }))
      setShowRepeatOptions(prev => ({ ...prev, [dateStr]: false }))
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const toggleDateTodo = async (dateStr: string, todoId: string) => {
    if (!user) return

    try {
      const todo = dateCards.find(card => card.date === dateStr)?.todos.find(t => t.id === todoId)
      if (!todo) return

      const updates: TodoUpdate = {
        completed: !todo.completed,
        completed_at: !todo.completed ? new Date().toISOString() : null
      }

      await todosService.update(todoId, updates)

      setDateCards(prev => prev.map(card => 
        card.date === dateStr 
          ? {
              ...card, 
              todos: card.todos.map(t =>
                t.id === todoId ? { 
                  ...t, 
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined
                } : t
              )
            }
          : card
      ))
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const deleteDateTodo = async (dateStr: string, todoId: string) => {
    if (!user) return

    try {
      await todosService.delete(todoId)

      setDateCards(prev => prev.map(card => 
        card.date === dateStr 
          ? { ...card, todos: card.todos.filter(todo => todo.id !== todoId) }
          : card
      ))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, dateStr: string) => {
    if (e.key === 'Enter') {
      addTodoLocal(dateStr)
    }
  }

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  const isPast = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr < today
  }

  const renderDateCard = (card: DateCard, isHistoryCard = false) => {
    const { month, day, weekday } = formatDate(card.date)
    const todayCard = isToday(card.date)
    const pastCard = isPast(card.date)
    
    // For today's card, use synchronized todos from context
    const displayTodos = todayCard ? todayTodos.map(todo => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      date: card.date
    })) : card.todos
    
    return (
      <div key={card.date} className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 w-full transition-all duration-200 hover:bg-gray-800/70 ${
        todayCard ? 'shadow-lg shadow-blue-500/10 border border-blue-500/20' : ''
      }`}>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-white">{month}/{day}</div>
              <div className="text-sm text-gray-400">{weekday}</div>
            </div>
            <div className="flex gap-1">
              {todayCard && <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-md font-medium border border-blue-500/30">Today</span>}
              {pastCard && !isHistoryCard && <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-md font-medium border border-gray-500/30">Past</span>}
            </div>
          </div>
        </div>
        
        <div className="space-y-1 mb-2">
          {displayTodos.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-2">
              {todayCard ? 'No todos for today' : ''}
            </div>
          ) : (
            displayTodos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={isHistoryCard ? undefined : () => {
                    if (todayCard) {
                      toggleTodo(todo.id) // Use context function for today's todos
                    } else {
                      toggleDateTodo(card.date, todo.id) // Use original function for other dates
                    }
                  }}
                  disabled={isHistoryCard}
                  className="rounded w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0"
                />
                <span className={`flex-1 text-sm transition-colors break-words ${
                  todo.completed ? 'line-through text-gray-500' : 'text-gray-200'
                }`}>
                  {todo.text}
                </span>
                {!isHistoryCard && (
                  <button
                    onClick={() => {
                      if (todayCard) {
                        deleteTodo(todo.id) // Use context function for today's todos
                      } else {
                        deleteDateTodo(card.date, todo.id) // Use original function for other dates
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center transition-all text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
                {isHistoryCard && todo.completed && (
                  <div className="w-6 h-6 flex items-center justify-center bg-green-600/20 rounded-lg border border-green-500/30">
                    <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {!isHistoryCard && (
          <div className="space-y-3 pt-2 border-t border-gray-700/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodoText[card.date] || ''}
                onChange={(e) => setNewTodoText(prev => ({ ...prev, [card.date]: e.target.value }))}
                onKeyPress={(e) => handleKeyPress(e, card.date)}
                placeholder="Add new todo..."
                className="flex-1 px-3 py-2 text-sm bg-gray-700/50 rounded-lg focus:outline-none focus:bg-gray-700 text-white placeholder-gray-400 transition-colors"
              />
              <button
                onClick={() => setShowRepeatOptions(prev => ({ ...prev, [card.date]: !prev[card.date] }))}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all flex-shrink-0 text-sm font-medium ${
                  showRepeatOptions[card.date] 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                    : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Repeat options"
              >
                ↻
              </button>
              <button 
                onClick={() => addTodoLocal(card.date)}
                className="w-9 h-9 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex-shrink-0 text-sm font-medium shadow-sm"
                title="Add todo"
              >
                +
              </button>
            </div>
            
            {showRepeatOptions[card.date] && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Repeat Settings</div>
                <div className="space-y-3">
                  {(['none', 'weekly', 'monthly', 'yearly'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-700/30 p-2 rounded-lg transition-colors">
                      <input
                        type="radio"
                        name={`repeat-${card.date}`}
                        checked={(repeatSettings[card.date]?.type || 'none') === type}
                        onChange={() => setRepeatSettings(prev => ({
                          ...prev,
                          [card.date]: { type }
                        }))}
                        className="text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <span className="text-gray-300 font-medium">
                        {type === 'none' && '반복 안함'}
                        {type === 'weekly' && '매주 반복'}
                        {type === 'monthly' && '매월 동일 날짜'}
                        {type === 'yearly' && '매년 동일 날짜'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-gray-400">Loading todos...</div>
      </div>
    )
  }

  return (
    <div className="bg-black rounded-xl p-6">
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Todos</h2>
          <p className="text-sm text-gray-400">Swipe up to see past dates</p>
        </div>
      </div>

      {/* Mobile Vertical Scroll - Date Cards */}
      <div className="space-y-4">
        {/* History cards (past dates) */}
        {historyData.slice(0, 3).reverse().map((card) => renderDateCard(card, true))}
        
        {/* Current and future date cards */}
        {dateCards.map((card) => renderDateCard(card, false))}
      </div>
    </div>
  )
}