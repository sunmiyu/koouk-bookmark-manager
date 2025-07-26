'use client'

import { useState } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
  completedAt?: string
}

interface DateCard {
  date: string
  todos: Todo[]
}

export default function TodoSection() {
  const [showHistory, setShowHistory] = useState(false)
  
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

  // 히스토리 데이터 (샘플)
  const historyData: DateCard[] = getHistoryDates().map((date, index) => ({
    date,
    todos: index < 3 ? [
      { id: `history-${date}-1`, text: `Complete project milestone ${index + 1}`, completed: true, completedAt: date },
      { id: `history-${date}-2`, text: `Review code changes`, completed: true, completedAt: date },
      ...(index === 0 ? [{ id: `history-${date}-3`, text: `Team meeting notes`, completed: true, completedAt: date }] : [])
    ] : index < 6 ? [
      { id: `history-${date}-1`, text: `Daily standup`, completed: true, completedAt: date }
    ] : []
  }))

  const [dateCards, setDateCards] = useState<DateCard[]>(
    getFutureDates().map(date => ({ date, todos: [] }))
  )
  
  const [newTodoText, setNewTodoText] = useState<{[key: string]: string}>({})

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
    return { month, day, weekday }
  }

  const addTodo = (dateStr: string) => {
    const text = newTodoText[dateStr]?.trim()
    if (!text) return

    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false
    }

    setDateCards(prev => prev.map(card => 
      card.date === dateStr 
        ? { ...card, todos: [...card.todos, newTodo] }
        : card
    ))

    setNewTodoText(prev => ({ ...prev, [dateStr]: '' }))
  }

  const toggleTodo = (dateStr: string, todoId: string) => {
    setDateCards(prev => prev.map(card => 
      card.date === dateStr 
        ? {
            ...card, 
            todos: card.todos.map(todo =>
              todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            )
          }
        : card
    ))
  }

  const deleteTodo = (dateStr: string, todoId: string) => {
    setDateCards(prev => prev.map(card => 
      card.date === dateStr 
        ? { ...card, todos: card.todos.filter(todo => todo.id !== todoId) }
        : card
    ))
  }

  const handleKeyPress = (e: React.KeyboardEvent, dateStr: string) => {
    if (e.key === 'Enter') {
      addTodo(dateStr)
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
    
    return (
      <div key={card.date} className={`card min-w-[280px] sm:min-w-[250px] flex-shrink-0 ${todayCard ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="mb-3">
          <div className="flex items-center responsive-gap-sm">
            <div className="responsive-text-lg font-semibold">{month}/{day}</div>
            {todayCard && <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Today</span>}
            {pastCard && !isHistoryCard && <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Past</span>}
          </div>
          <div className="responsive-text-sm text-gray-400">{weekday}요일</div>
        </div>
        
        <div className="space-y-1 mb-2">
          {card.todos.length === 0 ? (
            <div className="text-gray-500 responsive-text-sm py-2 text-center">
              No todos
            </div>
          ) : (
            card.todos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-2 group">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={isHistoryCard ? undefined : () => toggleTodo(card.date, todo.id)}
                  disabled={isHistoryCard}
                  className="rounded w-3.5 h-3.5 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 flex-shrink-0"
                />
                <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-white'} break-words`}>
                  {todo.text}
                </span>
                {!isHistoryCard && (
                  <button
                    onClick={() => deleteTodo(card.date, todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-1 transition-opacity flex-shrink-0"
                  >
                    ×
                  </button>
                )}
                {isHistoryCard && todo.completed && (
                  <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))
          )}
        </div>

        {!isHistoryCard && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodoText[card.date] || ''}
              onChange={(e) => setNewTodoText(prev => ({ ...prev, [card.date]: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, card.date)}
              placeholder="Add new todo..."
              className="flex-1 px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            />
            <button 
              onClick={() => addTodo(card.date)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors flex-shrink-0 text-sm"
              title="Add todo"
            >
              +
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center responsive-gap-md mb-3">
        <h2 className="section-title">Todos</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`px-3 py-1 rounded responsive-text-sm transition-colors flex items-center responsive-gap-sm self-start sm:self-auto ${
            showHistory 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">{showHistory ? 'Hide History' : 'Show History'}</span>
          <span className="sm:hidden">{showHistory ? 'Hide' : 'History'}</span>
        </button>
      </div>

      {showHistory && (
        <div className="mb-6">
          <h3 className="responsive-text-lg font-semibold mb-3 text-purple-400">History</h3>
          <div className="flex overflow-x-auto responsive-gap-md pb-4">
            {historyData.map((card) => renderDateCard(card, true))}
          </div>
        </div>
      )}
      
      <div className="flex overflow-x-auto responsive-gap-md pb-4">
        {dateCards.map((card) => renderDateCard(card, false))}
      </div>
    </div>
  )
}