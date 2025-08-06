'use client'

import { useState } from 'react'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'

type TodoItem = {
  id: string
  content: string
  completed: boolean
  createdAt: string
}

type DiaryEntry = {
  date: string
  content: string
  characterCount: number
}

type BudgetEntry = {
  date: string
  income: number
  expense: number
  details: string
}

type GoalEntry = {
  date: string
  goal: string
  current: string
}

export default function DailyCardContent() {
  // Generate 7 days starting from today
  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const [dates] = useState(generateDates())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [diary, setDiary] = useState<DiaryEntry>({
    date: selectedDate,
    content: '',
    characterCount: 0
  })
  const [budget, setBudget] = useState<BudgetEntry>({
    date: selectedDate,
    income: 0,
    expense: 0,
    details: ''
  })
  const [goal, setGoal] = useState<GoalEntry>({
    date: selectedDate,
    goal: '',
    current: ''
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (dateStr === today) return '오늘'
    if (dateStr === tomorrowStr) return '내일'
    if (dateStr === yesterdayStr) return '어제'
    
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // Mobile swipe functionality - 임포트 추가 필요
  const goToNextDate = () => {
    const currentIndex = dates.indexOf(selectedDate)
    if (currentIndex < dates.length - 1) {
      setSelectedDate(dates[currentIndex + 1])
    }
  }

  const goToPreviousDate = () => {
    const currentIndex = dates.indexOf(selectedDate)
    if (currentIndex > 0) {
      setSelectedDate(dates[currentIndex - 1])
    }
  }

  // 스와이프 기능 추가
  const { setRef: setSwipeRef } = useSwipeGesture({
    onSwipeLeft: goToNextDate,
    onSwipeRight: goToPreviousDate,
    minDistance: 50,
    preventScroll: false
  })

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem: TodoItem = {
        id: Date.now().toString(),
        content: newTodo.trim(),
        completed: false,
        createdAt: selectedDate
      }
      setTodos(prev => [...prev, newTodoItem])
      setNewTodo('')
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const handleDiaryChange = (content: string) => {
    if (content.length <= 500) {
      setDiary(prev => ({
        ...prev,
        content,
        characterCount: content.length,
        date: selectedDate
      }))
    }
  }

  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      {/* Header with Date Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h1 style={{ 
            fontSize: 'var(--text-base)', 
            fontWeight: '700', 
            color: 'var(--text-primary)' 
          }} className="md:text-2xl">
            Daily Cards
          </h1>
        </div>
        
        {/* Date Navigation */}
        <div className="bg-white rounded-lg border p-4" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: '600',
              color: 'var(--text-primary)'
            }} className="md:text-lg">
              날짜 선택
            </h3>
            <div className="md:hidden text-xs" style={{ color: 'var(--text-secondary)' }}>
              ← 스와이프로 이동 →
            </div>
          </div>
          
          {/* Desktop Date Navigation */}
          <div className="hidden md:flex justify-center gap-2 overflow-x-auto">
            {dates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  selectedDate === date
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedDate === date ? 'var(--accent)' : 'transparent',
                  color: selectedDate === date ? 'white' : 'var(--text-secondary)'
                }}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>

          {/* Mobile Date Display */}
          <div className="md:hidden text-center">
            <div className="text-base font-bold md:text-2xl" style={{ color: 'var(--accent)' }}>
              {formatDate(selectedDate)}
            </div>
            <div className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
              {selectedDate}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Container with Swipe Support - 세로 스택 */}
      <div ref={setSwipeRef} className="space-y-6">
        {/* Todo Card */}
        <div className="bg-white rounded-lg border p-6" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }} className="md:text-lg">
              Todo Card
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="할일을 입력하세요..."
                className="flex-1 px-3 py-2 border rounded"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              />
              <button
                onClick={addTodo}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                추가
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {todos.filter(todo => todo.createdAt === selectedDate).map(todo => (
                <div key={todo.id} className="flex items-center gap-3 p-2 rounded" style={{
                  backgroundColor: todo.completed ? 'var(--bg-secondary)' : 'transparent'
                }}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className={`flex-1 ${todo.completed ? 'line-through opacity-60' : ''}`} style={{
                    color: 'var(--text-primary)'
                  }}>
                    {todo.content}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diary Card */}
        <div className="bg-white rounded-lg border p-6" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }} className="md:text-lg">
              Diary
            </h3>
          </div>
          
          <div className="space-y-3">
            <textarea
              value={diary.content}
              onChange={(e) => handleDiaryChange(e.target.value)}
              placeholder="오늘의 일기를 작성하세요... (최대 500자)"
              rows={8}
              className="w-full px-3 py-2 border rounded resize-none"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>
                {diary.characterCount}/500
              </span>
              {diary.characterCount >= 450 && (
                <span style={{ color: 'var(--warning)' }}>
                  {500 - diary.characterCount}자 남음
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Budget Card */}
        <div className="bg-white rounded-lg border p-6" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }} className="md:text-lg">
              Budget
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  수입
                </label>
                <input
                  type="number"
                  value={budget.income}
                  onChange={(e) => setBudget(prev => ({ ...prev, income: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  지출
                </label>
                <input
                  type="number"
                  value={budget.expense}
                  onChange={(e) => setBudget(prev => ({ ...prev, expense: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
            
            <hr style={{ borderColor: 'var(--border-light)' }} />
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                상세내역
              </label>
              <textarea
                value={budget.details}
                onChange={(e) => setBudget(prev => ({ ...prev, details: e.target.value }))}
                placeholder="수입/지출 상세내역을 입력하세요..."
                rows={4}
                className="w-full px-3 py-2 border rounded resize-none"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            
            <div className="text-center p-2 rounded" style={{
              backgroundColor: budget.income >= budget.expense ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
            }}>
              <span style={{
                color: budget.income >= budget.expense ? 'var(--success)' : 'var(--error)',
                fontWeight: '600'
              }}>
                잔액: {(budget.income - budget.expense).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* Goal Tracker Card */}
        <div className="bg-white rounded-lg border p-6" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }} className="md:text-lg">
              Goal Tracker
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                목표
              </label>
              <input
                type="text"
                value={goal.goal}
                onChange={(e) => setGoal(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="오늘의 목표를 입력하세요..."
                className="w-full px-3 py-2 border rounded"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                현황
              </label>
              <textarea
                value={goal.current}
                onChange={(e) => setGoal(prev => ({ ...prev, current: e.target.value }))}
                placeholder="현재 진행 상황을 입력하세요..."
                rows={6}
                className="w-full px-3 py-2 border rounded resize-none"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}