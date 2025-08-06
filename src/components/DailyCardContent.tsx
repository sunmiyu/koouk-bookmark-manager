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

type DayData = {
  date: string
  todos: TodoItem[]
  diary: DiaryEntry
  budget: BudgetEntry
  goal: GoalEntry
}

export default function DailyCardContent() {
  // Generate 7 days (3 past, today, 3 future)
  const generateDates = () => {
    const dates: DayData[] = []
    const today = new Date()
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      
      dates.push({
        date: dateString,
        todos: [],
        diary: { date: dateString, content: '', characterCount: 0 },
        budget: { date: dateString, income: 0, expense: 0, details: '' },
        goal: { date: dateString, goal: '', current: '' }
      })
    }
    return dates
  }

  const [daysData, setDaysData] = useState<DayData[]>(generateDates())

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    if (isToday) {
      return `오늘 ${date.getMonth() + 1}/${date.getDate()}`
    }
    
    const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === -1) return `어제 ${date.getMonth() + 1}/${date.getDate()}`
    if (diff === 1) return `내일 ${date.getMonth() + 1}/${date.getDate()}`
    
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const addTodo = (dateString: string, content: string) => {
    if (!content.trim()) return
    
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      content: content.trim(),
      completed: false,
      createdAt: dateString
    }
    
    setDaysData(prev => prev.map(day => 
      day.date === dateString 
        ? { ...day, todos: [...day.todos, newTodo] }
        : day
    ))
  }

  const toggleTodo = (dateString: string, todoId: string) => {
    setDaysData(prev => prev.map(day => 
      day.date === dateString
        ? { 
            ...day, 
            todos: day.todos.map(todo => 
              todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            )
          }
        : day
    ))
  }

  const deleteTodo = (dateString: string, todoId: string) => {
    setDaysData(prev => prev.map(day => 
      day.date === dateString
        ? { ...day, todos: day.todos.filter(todo => todo.id !== todoId) }
        : day
    ))
  }

  const updateDiary = (dateString: string, content: string) => {
    if (content.length <= 500) {
      setDaysData(prev => prev.map(day => 
        day.date === dateString
          ? { 
              ...day, 
              diary: { 
                ...day.diary, 
                content, 
                characterCount: content.length 
              }
            }
          : day
      ))
    }
  }

  return (
    <div className="h-full" style={{ 
      padding: 'var(--space-10) var(--space-8)',
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* Header - 세련된 타이포그래피 */}
      <div className="mb-12">
        <h1 style={{ 
          fontSize: 'var(--text-3xl)',
          fontWeight: '300',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: '1.2',
          marginBottom: 'var(--space-2)'
        }}>
          Daily Cards
        </h1>
        <p style={{ 
          fontSize: 'var(--text-lg)',
          color: 'var(--text-secondary)',
          fontWeight: '400',
          lineHeight: '1.5',
          letterSpacing: '0.01em'
        }}>
          각 날짜별로 나만의 일상을 기록해보세요
        </p>
      </div>

      {/* Horizontal Date Scroll Container */}
      <div 
        className="overflow-x-auto" 
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="flex gap-8 pb-6" style={{ minWidth: 'min-content' }}>
          {daysData.map((dayData) => (
            <div key={dayData.date} className="flex-shrink-0" style={{ width: '22rem' }}>
              {/* Date Header - 미니멀하고 우아한 */}
              <div className="mb-6 text-center">
                <h2 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: dayData.date === new Date().toISOString().split('T')[0] ? '500' : '400',
                  color: dayData.date === new Date().toISOString().split('T')[0] ? 'var(--text-primary)' : 'var(--text-secondary)',
                  letterSpacing: '-0.01em',
                  padding: 'var(--space-3) var(--space-6)',
                  backgroundColor: dayData.date === new Date().toISOString().split('T')[0] ? 'var(--bg-secondary)' : 'transparent',
                  borderRadius: 'var(--radius-xl)',
                  border: dayData.date === new Date().toISOString().split('T')[0] ? '1px solid var(--border-medium)' : 'none',
                  transition: 'all 0.2s ease-out'
                }}>
                  {formatDate(dayData.date)}
                </h2>
              </div>

              {/* Cards Stack for this Date - 더 넉넉한 간격 */}
              <div className="space-y-5">
                {/* Todo Card */}
                <TodoCard
                  todos={dayData.todos}
                  onAddTodo={(content) => addTodo(dayData.date, content)}
                  onToggleTodo={(id) => toggleTodo(dayData.date, id)}
                  onDeleteTodo={(id) => deleteTodo(dayData.date, id)}
                />

                {/* Diary Card */}
                <DiaryCard
                  diary={dayData.diary}
                  onUpdateDiary={(content) => updateDiary(dayData.date, content)}
                />

                {/* Budget Card (placeholder) */}
                <BudgetCard />

                {/* Goal Tracker Card (placeholder) */}
                <GoalCard />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Todo Card Component - Apple/Linear 스타일
function TodoCard({ 
  todos, 
  onAddTodo, 
  onToggleTodo, 
  onDeleteTodo 
}: {
  todos: TodoItem[]
  onAddTodo: (content: string) => void
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
}) {
  const [newTodo, setNewTodo] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleAdd = () => {
    onAddTodo(newTodo)
    setNewTodo('')
  }

  return (
    <div 
      className="group transition-all duration-300 ease-out"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-subtle)',
        transition: 'all 0.3s ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
      }}
    >
      {/* 카드 제목 - 미니멀하고 우아한 */}
      <div className="mb-5">
        <h3 style={{ 
          fontSize: '1.1rem',
          fontWeight: '500',
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
          lineHeight: '1.3'
        }}>
          Tasks
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* 입력 필드 - 세련된 디자인 */}
        <div className="relative">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="할 일 입력 → 엔터키!"
            className="w-full text-sm transition-all duration-200 ease-out"
            style={{
              backgroundColor: '#FAFAF9',
              border: `1px solid ${isFocused ? '#E8E5E1' : '#F5F3F0'}`,
              borderRadius: '0.875rem',
              padding: '0.875rem 1rem',
              color: '#1A1A1A',
              outline: 'none',
              fontSize: '0.9rem',
              fontWeight: '400',
              lineHeight: '1.4',
              letterSpacing: '0.01em'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          {newTodo && (
            <button
              onClick={handleAdd}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 transition-all duration-200 ease-out"
              style={{
                backgroundColor: '#1A1A1A',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                width: '1.75rem',
                height: '1.75rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333333'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1A1A1A'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            >
              +
            </button>
          )}
        </div>
        
        {/* Todo 리스트 - 깔끔하고 우아한 */}
        <div className="space-y-3 max-h-36 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {todos.map(todo => (
            <div 
              key={todo.id} 
              className="flex items-center gap-3 group/item transition-all duration-200 ease-out"
              style={{ padding: '0.5rem 0' }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleTodo(todo.id)}
                className="w-4 h-4 transition-all duration-200"
                style={{
                  accentColor: '#1A1A1A',
                  transform: 'scale(1.1)'
                }}
              />
              <span 
                className={`flex-1 transition-all duration-200 ${todo.completed ? 'line-through' : ''}`} 
                style={{
                  color: todo.completed ? '#9CA3AF' : '#1A1A1A',
                  fontSize: '0.9rem',
                  fontWeight: '400',
                  lineHeight: '1.4',
                  letterSpacing: '0.01em',
                  opacity: todo.completed ? 0.6 : 1
                }}
              >
                {todo.content}
              </span>
              <button
                onClick={() => onDeleteTodo(todo.id)}
                className="opacity-0 group-hover/item:opacity-100 transition-all duration-200 ease-out"
                style={{
                  color: '#9CA3AF',
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#EF4444'
                  e.currentTarget.style.backgroundColor = '#FEF2F2'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9CA3AF'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Diary Card Component - 세련된 디자인
function DiaryCard({ 
  diary, 
  onUpdateDiary 
}: {
  diary: DiaryEntry
  onUpdateDiary: (content: string) => void
}) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div 
      className="group transition-all duration-300 ease-out"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-subtle)',
        transition: 'all 0.3s ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
      }}
    >
      {/* 카드 제목 */}
      <div className="mb-5">
        <h3 style={{ 
          fontSize: '1.1rem',
          fontWeight: '500',
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
          lineHeight: '1.3'
        }}>
          Daily Journal
        </h3>
      </div>
      
      <div className="space-y-3">
        <textarea
          value={diary.content}
          onChange={(e) => onUpdateDiary(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="오늘 어땠나요? 간단히라도 👋"
          className="w-full resize-none transition-all duration-200 ease-out"
          style={{
            backgroundColor: '#FAFAF9',
            border: `1px solid ${isFocused ? '#E8E5E1' : '#F5F3F0'}`,
            borderRadius: '0.875rem',
            padding: '1rem',
            color: '#1A1A1A',
            outline: 'none',
            fontSize: '0.9rem',
            fontWeight: '400',
            lineHeight: '1.6',
            letterSpacing: '0.01em',
            height: '6rem',
            minHeight: '6rem'
          }}
          maxLength={500}
        />
        
        {/* 글자수 카운터 - 미묘하고 우아한 */}
        <div className="flex justify-end">
          <span style={{ 
            color: diary.characterCount > 450 ? '#EF4444' : '#9CA3AF',
            fontSize: '0.75rem',
            fontWeight: '400',
            letterSpacing: '0.02em',
            transition: 'color 0.2s ease-out'
          }}>
            {diary.characterCount}/500
          </span>
        </div>
      </div>
    </div>
  )
}

// Budget Card Component - 세련된 디자인
function BudgetCard() {
  return (
    <div 
      className="group transition-all duration-300 ease-out"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-subtle)',
        transition: 'all 0.3s ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
      }}
    >
      <div className="mb-5">
        <h3 style={{ 
          fontSize: '1.1rem',
          fontWeight: '500',
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
          lineHeight: '1.3'
        }}>
          Budget Tracker
        </h3>
      </div>
      
      <div className="text-center py-8">
        <div style={{
          backgroundColor: '#FAFAF9',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #F5F3F0'
        }}>
          <p style={{ 
            color: '#6B7280',
            fontSize: '0.9rem',
            fontWeight: '400',
            lineHeight: '1.5',
            marginBottom: '0.5rem'
          }}>
            예산 관리 기능
          </p>
          <p style={{ 
            color: '#9CA3AF',
            fontSize: '0.8rem',
            fontWeight: '400',
            letterSpacing: '0.01em'
          }}>
            곧 출시 예정입니다
          </p>
        </div>
      </div>
    </div>
  )
}

// Goal Card Component - 세련된 디자인
function GoalCard() {
  return (
    <div 
      className="group transition-all duration-300 ease-out"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-subtle)',
        transition: 'all 0.3s ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
      }}
    >
      <div className="mb-5">
        <h3 style={{ 
          fontSize: '1.1rem',
          fontWeight: '500',
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
          lineHeight: '1.3'
        }}>
          Goal Tracker
        </h3>
      </div>
      
      <div className="text-center py-8">
        <div style={{
          backgroundColor: '#FAFAF9',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #F5F3F0'
        }}>
          <p style={{ 
            color: '#6B7280',
            fontSize: '0.9rem',
            fontWeight: '400',
            lineHeight: '1.5',
            marginBottom: '0.5rem'
          }}>
            목표 추적 기능
          </p>
          <p style={{ 
            color: '#9CA3AF',
            fontSize: '0.8rem',
            fontWeight: '400',
            letterSpacing: '0.01em'
          }}>
            곧 출시 예정입니다
          </p>
        </div>
      </div>
    </div>
  )
}