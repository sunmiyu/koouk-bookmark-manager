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

export type DailyCardState = {
  todo: boolean
  diary: boolean
  budget: boolean
  goalTracker: boolean
}

type DailyCardContentProps = {
  cardState?: DailyCardState
}

export default function DailyCardContent({ cardState }: DailyCardContentProps = {}) {
  // 기본값 설정 (Todo는 항상 true)
  const defaultCardState = {
    todo: true,
    diary: true,
    budget: false,
    goalTracker: false
  }
  
  const activeCards = cardState || defaultCardState
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
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[date.getDay()]
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
    
    if (isToday) {
      return { text: `${dateStr}`, weekday: `오늘 (${weekday})`, isToday: true }
    }
    
    const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === -1) return { text: `${dateStr}`, weekday: `어제 (${weekday})`, isToday: false }
    if (diff === 1) return { text: `${dateStr}`, weekday: `내일 (${weekday})`, isToday: false }
    
    return { text: `${dateStr}`, weekday: `${weekday}`, isToday: false }
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
    <div className="h-full overflow-y-auto" style={{ 
      padding: 'var(--space-6) var(--space-4)',
      backgroundColor: 'var(--bg-primary)'
    }}>

      {/* Horizontal Date Scroll Container */}
      <div 
        className="overflow-x-auto overflow-y-hidden" 
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.cursor = 'grabbing'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.cursor = 'grab'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.cursor = 'grab'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="flex gap-3 md:gap-8 pb-4 md:pb-6" style={{ minWidth: 'max-content', width: 'fit-content' }}>
          {daysData.map((dayData) => {
            const dateInfo = formatDate(dayData.date)
            return (
              <div key={dayData.date} className="flex-shrink-0 w-64 md:w-80" style={{ minWidth: '16rem' }}>
                {/* Date Header - 카드 상단 왼쪽 정렬 */}
                <div className="mb-4 md:mb-6 text-left">
                  <div className="mb-3">
                    <h2 style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'bold',
                      color: dateInfo.isToday ? 'var(--text-primary)' : 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {dateInfo.text}
                    </h2>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: dateInfo.isToday ? 'bold' : '500',
                      color: dateInfo.isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
                      letterSpacing: '0.01em'
                    }}>
                      {dateInfo.weekday}
                    </p>
                  </div>
                </div>

              {/* Cards Stack for this Date - 모바일 최적화된 간격 */}
              <div className="space-y-3 md:space-y-5">
                {/* Todo Card - 항상 표시 */}
                {activeCards.todo && (
                  <TodoCard
                    todos={dayData.todos}
                    onAddTodo={(content) => addTodo(dayData.date, content)}
                    onToggleTodo={(id) => toggleTodo(dayData.date, id)}
                    onDeleteTodo={(id) => deleteTodo(dayData.date, id)}
                  />
                )}

                {/* Diary Card - 체크박스 상태에 따라 표시 */}
                {activeCards.diary && (
                  <DiaryCard
                    diary={dayData.diary}
                    onUpdateDiary={(content) => updateDiary(dayData.date, content)}
                  />
                )}

                {/* Budget Card - 체크박스 상태에 따라 표시 */}
                {activeCards.budget && <BudgetCard />}

                {/* Goal Tracker Card - 체크박스 상태에 따라 표시 */}
                {activeCards.goalTracker && <GoalCard />}
              </div>
              </div>
            )
          })}
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
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
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
      <div className="mb-3 md:mb-5">
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
      
      <div className="space-y-3 md:space-y-4">
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
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-3) var(--space-4)',
              color: '#1A1A1A',
              outline: 'none',
              fontSize: 'var(--text-sm)',
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
        <div className="space-y-2 md:space-y-3 max-h-32 md:max-h-36 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
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
                  fontSize: 'var(--text-sm)',
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
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
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
      <div className="mb-3 md:mb-5">
        <h3 style={{ 
          fontSize: 'var(--text-lg)',
          fontWeight: '500',
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
          lineHeight: '1.3'
        }}>
          Daily Journal
        </h3>
      </div>
      
      <div className="space-y-2 md:space-y-3">
        <textarea
          value={diary.content}
          onChange={(e) => onUpdateDiary(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="오늘 어땠나요?"
          className="w-full resize-none transition-all duration-200 ease-out"
          style={{
            backgroundColor: '#FAFAF9',
            border: `1px solid ${isFocused ? '#E8E5E1' : '#F5F3F0'}`,
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            color: '#1A1A1A',
            outline: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: '400',
            lineHeight: '1.6',
            letterSpacing: '0.01em',
            height: '5rem',
            minHeight: '5rem'
          }}
          maxLength={500}
        />
        
        {/* 글자수 카운터 - 미묘하고 우아한 */}
        <div className="flex justify-end">
          <span style={{ 
            color: diary.characterCount > 450 ? '#EF4444' : '#9CA3AF',
            fontSize: 'var(--text-xs)',
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

// Budget Card Component - 감성있는 예산 관리
function BudgetCard() {
  const [income, setIncome] = useState('')
  const [expense, setExpense] = useState('')
  const [note, setNote] = useState('')
  const [isFocused, setIsFocused] = useState('')

  return (
    <div 
      className="group transition-all duration-300 ease-out"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
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
      <div className="mb-3 md:mb-5">
        <h3 style={{ 
          fontSize: 'var(--text-lg)',
          fontWeight: '500',
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
          lineHeight: '1.3'
        }}>
          Budget Tracker
        </h3>
      </div>
      
      <div className="space-y-3">
        {/* 수입 입력 */}
        <div className="flex items-center gap-3">
          <span style={{ 
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            fontWeight: '500',
            minWidth: '40px'
          }}>
            수입
          </span>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            onFocus={() => setIsFocused('income')}
            onBlur={() => setIsFocused('')}
            placeholder="0"
            className="flex-1 transition-all duration-200 ease-out"
            style={{
              backgroundColor: '#FAFAF9',
              border: `1px solid ${isFocused === 'income' ? '#E8E5E1' : '#F5F3F0'}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-3)',
              color: '#16A34A',
              outline: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              textAlign: 'right'
            }}
          />
          <span style={{ 
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            fontWeight: '400'
          }}>
            원
          </span>
        </div>

        {/* 지출 입력 */}
        <div className="flex items-center gap-3">
          <span style={{ 
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            fontWeight: '500',
            minWidth: '40px'
          }}>
            지출
          </span>
          <input
            type="number"
            value={expense}
            onChange={(e) => setExpense(e.target.value)}
            onFocus={() => setIsFocused('expense')}
            onBlur={() => setIsFocused('')}
            placeholder="0"
            className="flex-1 transition-all duration-200 ease-out"
            style={{
              backgroundColor: '#FAFAF9',
              border: `1px solid ${isFocused === 'expense' ? '#E8E5E1' : '#F5F3F0'}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-3)',
              color: '#DC2626',
              outline: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              textAlign: 'right'
            }}
          />
          <span style={{ 
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            fontWeight: '400'
          }}>
            원
          </span>
        </div>

        {/* 메모 */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onFocus={() => setIsFocused('note')}
          onBlur={() => setIsFocused('')}
          placeholder="오늘의 가계부 메모..."
          className="w-full resize-none transition-all duration-200 ease-out"
          style={{
            backgroundColor: '#FAFAF9',
            border: `1px solid ${isFocused === 'note' ? '#E8E5E1' : '#F5F3F0'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            color: '#1A1A1A',
            outline: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: '400',
            lineHeight: '1.5',
            height: '3rem',
            minHeight: '3rem'
          }}
        />

        {/* 잔액 표시 */}
        {(income || expense) && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span style={{ 
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                잔액
              </span>
              <span style={{ 
                fontSize: 'var(--text-md)',
                color: (parseFloat(income || '0') - parseFloat(expense || '0')) >= 0 ? '#16A34A' : '#DC2626',
                fontWeight: 'bold'
              }}>
                {(parseFloat(income || '0') - parseFloat(expense || '0')).toLocaleString()}원
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Goal Card Component - 감성있는 목표 관리
function GoalCard() {
  const [goal, setGoal] = useState('')
  const [current, setCurrent] = useState('')
  const [note, setNote] = useState('')
  const [isFocused, setIsFocused] = useState('')

  return (
    <div 
      className="group transition-all duration-300 ease-out"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
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
      <div className="mb-3 md:mb-5">
        <h3 style={{ 
          fontSize: 'var(--text-lg)',
          fontWeight: '500',
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
          lineHeight: '1.3'
        }}>
          Goal Tracker
        </h3>
      </div>
      
      <div className="space-y-3">
        {/* 목표 입력 */}
        <div>
          <label style={{ 
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            fontWeight: '500',
            marginBottom: 'var(--space-2)',
            display: 'block'
          }}>
            오늘의 목표 🎯
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onFocus={() => setIsFocused('goal')}
            onBlur={() => setIsFocused('')}
            placeholder="예: 운동 30분, 책 10페이지 읽기..."
            className="w-full transition-all duration-200 ease-out"
            style={{
              backgroundColor: '#FAFAF9',
              border: `1px solid ${isFocused === 'goal' ? '#E8E5E1' : '#F5F3F0'}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              color: '#1A1A1A',
              outline: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: '400',
              lineHeight: '1.4'
            }}
          />
        </div>

        {/* 현재 상황 입력 */}
        <div>
          <label style={{ 
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            fontWeight: '500',
            marginBottom: 'var(--space-2)',
            display: 'block'
          }}>
            지금 어떤가요? 💪
          </label>
          <input
            type="text"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            onFocus={() => setIsFocused('current')}
            onBlur={() => setIsFocused('')}
            placeholder="예: 운동 15분 완료, 책 5페이지..."
            className="w-full transition-all duration-200 ease-out"
            style={{
              backgroundColor: '#FAFAF9',
              border: `1px solid ${isFocused === 'current' ? '#E8E5E1' : '#F5F3F0'}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              color: '#1A1A1A',
              outline: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: '400',
              lineHeight: '1.4'
            }}
          />
        </div>

        {/* 메모 */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onFocus={() => setIsFocused('note')}
          onBlur={() => setIsFocused('')}
          placeholder="목표에 대한 생각이나 느낌을 적어보세요..."
          className="w-full resize-none transition-all duration-200 ease-out"
          style={{
            backgroundColor: '#FAFAF9',
            border: `1px solid ${isFocused === 'note' ? '#E8E5E1' : '#F5F3F0'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            color: '#1A1A1A',
            outline: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: '400',
            lineHeight: '1.5',
            height: '3rem',
            minHeight: '3rem'
          }}
        />

        {/* 진행 상황 표시 */}
        {(goal || current) && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div style={{ 
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  fontWeight: '500',
                  marginBottom: 'var(--space-1)'
                }}>
                  진행 상황
                </div>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: current ? '#16A34A' : '#E5E7EB'
                  }} />
                  <span style={{ 
                    fontSize: 'var(--text-sm)',
                    color: current ? '#16A34A' : '#6B7280',
                    fontWeight: current ? '500' : '400'
                  }}>
                    {current ? '진행 중' : '시작 전'}
                  </span>
                </div>
              </div>
              
              {goal && current && (
                <div className="text-right">
                  <span style={{ 
                    fontSize: 'var(--text-xs)',
                    color: '#6B7280',
                    fontWeight: '400'
                  }}>
                    화이팅! 🔥
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}