'use client'

import { useState } from 'react'

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
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

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
      {/* Header with Date */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h1 style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: '700', 
              color: 'var(--text-primary)' 
            }}>
              Daily Cards
            </h1>
          </div>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
          />
          
          <div className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>
            {formatDate(selectedDate)}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              fontSize: 'var(--text-lg)', 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }}>
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
              fontSize: 'var(--text-lg)', 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }}>
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
              fontSize: 'var(--text-lg)', 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }}>
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
              fontSize: 'var(--text-lg)', 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }}>
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