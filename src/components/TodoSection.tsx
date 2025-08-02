'use client'

import { useState } from 'react'
import { useTodos, TodoItem, TodoFilter } from '@/contexts/TodoContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { trackEvents } from '@/lib/analytics'

const CATEGORIES = ['Personal', 'Work', 'Shopping', 'Health', 'Learning', 'Projects']
const PRIORITIES = [
  { value: 'high', label: 'High', color: 'text-red-400 bg-red-900/20' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400 bg-yellow-900/20' },
  { value: 'low', label: 'Low', color: 'text-green-400 bg-green-900/20' }
] as const

export default function TodoSection() {
  const { 
    todos, 
    loading, 
    error, 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodo, 
    markAllCompleted, 
    deleteCompleted,
    filterTodos,
    syncTodos,
    lastSynced
  } = useTodos()
  
  const { getStorageLimit } = useUserPlan()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [filter, setFilter] = useState<TodoFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  
  // Form state
  const [newTodo, setNewTodo] = useState<{
    title: string
    description: string
    priority: TodoItem['priority']
    category: string
    tags: string[]
    dueDate: string
  }>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Personal',
    tags: [],
    dueDate: ''
  })
  
  const [tagInput, setTagInput] = useState('')

  const limit = getStorageLimit()
  const filteredTodos = filterTodos(filter)
  const isAtLimit = todos.length >= limit

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode)
    setSelectedItems(new Set())
  }

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    setSelectedItems(new Set(filteredTodos.map(todo => todo.id)))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const bulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    if (confirm(`선택된 ${selectedItems.size}개의 할 일을 삭제하시겠습니까?`)) {
      try {
        await Promise.all(
          Array.from(selectedItems).map(id => deleteTodo(id))
        )
        setSelectedItems(new Set())
        setBulkMode(false)
      } catch (error) {
        console.error('Bulk delete failed:', error)
        alert('일부 항목 삭제에 실패했습니다.')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.title.trim()) return

    try {
      await addTodo({
        title: newTodo.title.trim(),
        description: newTodo.description.trim() || undefined,
        completed: false,
        priority: newTodo.priority,
        category: newTodo.category,
        tags: newTodo.tags,
        dueDate: newTodo.dueDate || undefined
      })
      
      // Reset form
      setNewTodo({
        title: '',
        description: '',
        priority: 'medium',
        category: 'Personal',
        tags: [],
        dueDate: ''
      })
      setTagInput('')
      setShowAddForm(false)
      trackEvents.addContent('todo')
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !newTodo.tags.includes(tagInput.trim())) {
      setNewTodo(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewTodo(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < -24) {
      return `${Math.abs(Math.floor(diffInHours / 24))}일 전`
    } else if (diffInHours < 0) {
      return `${Math.abs(Math.floor(diffInHours))}시간 전`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 후`
    } else {
      return `${Math.floor(diffInHours / 24)}일 후`
    }
  }

  const getPriorityStyle = (priority: TodoItem['priority']) => {
    const config = PRIORITIES.find(p => p.value === priority)
    return config?.color || 'text-gray-400 bg-gray-900/20'
  }

  return (
    <div className="bg-black rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-blue-400">Todo List</h2>
          {lastSynced && (
            <div className="text-xs text-gray-500">
              동기화: {new Date(lastSynced).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400">
            <span className={todos.length >= limit ? 'text-yellow-400' : ''}>{todos.length}</span>
            <span className="text-gray-500">/{limit === Infinity ? '∞' : limit}</span>
          </div>
          {todos.length > 1 && (
            <button
              onClick={toggleBulkMode}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                bulkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {bulkMode ? '완료' : '다중선택'}
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              showFilters 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
            }`}
          >
            필터
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={isAtLimit}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 rounded text-xs transition-colors"
          >
            + 추가
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">카테고리</label>
              <select
                value={filter.category || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="">전체</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">우선순위</label>
              <select
                value={filter.priority || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: (e.target.value as TodoItem['priority']) || undefined }))}
                className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="">전체</option>
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">상태</label>
              <select
                value={filter.completed === undefined ? '' : filter.completed.toString()}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  completed: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="">전체</option>
                <option value="false">미완료</option>
                <option value="true">완료</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">검색</label>
              <input
                type="text"
                value={filter.search || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value || undefined }))}
                placeholder="제목, 설명, 태그 검색"
                className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-400">
              {filteredTodos.length}개 항목 표시 중
            </div>
            <button
              onClick={() => setFilter({})}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}

      {/* Bulk operation controls */}
      {bulkMode && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">
                {selectedItems.size}개 선택됨
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  전체선택
                </button>
                <button
                  onClick={clearSelection}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                  선택해제
                </button>
              </div>
            </div>
            <button
              onClick={bulkDelete}
              disabled={selectedItems.size === 0}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded transition-colors"
            >
              삭제 ({selectedItems.size})
            </button>
          </div>
        </div>
      )}

      {/* Add Todo Form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                value={newTodo.title}
                onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="할 일 제목"
                className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                autoFocus
              />
            </div>
            <div>
              <textarea
                value={newTodo.description}
                onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="상세 설명 (선택사항)"
                rows={2}
                className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">카테고리</label>
                <select
                  value={newTodo.category}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">우선순위</label>
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value as TodoItem['priority'] }))}
                  className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">마감일</label>
                <input
                  type="date"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">태그</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="태그 입력"
                  className="flex-1 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {newTodo.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newTodo.title.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white text-sm rounded transition-colors"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error and loading states */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
          <div className="text-red-400 text-sm">⚠️ {error}</div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
          <div className="text-gray-400 text-sm mt-2">동기화 중...</div>
        </div>
      )}

      {/* Todo Items */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredTodos.map((todo) => {
          const isSelected = selectedItems.has(todo.id)
          const priorityStyle = getPriorityStyle(todo.priority)
          
          return (
            <div 
              key={todo.id} 
              className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border group relative transition-all duration-200 hover:bg-gray-800/70 ${
                isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700/50'
              } ${todo.completed ? 'opacity-60' : ''}`}
            >
              {/* Bulk selection checkbox */}
              {bulkMode && (
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={() => toggleSelectItem(todo.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-400 bg-gray-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </button>
                </div>
              )}

              {/* Action buttons */}
              <div className={`absolute top-2 right-2 flex gap-1 z-10 ${
                bulkMode ? 'hidden' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-7 h-7 flex items-center justify-center border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm ${
                    todo.completed 
                      ? 'text-green-400 hover:text-green-300 bg-green-600/20' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title={todo.completed ? '미완료로 변경' : '완료로 변경'}
                >
                  {todo.completed ? '✓' : '○'}
                </button>
                <button
                  onClick={async () => {
                    const newTitle = prompt('할 일 제목을 수정하세요:', todo.title)
                    if (newTitle && newTitle.trim() !== todo.title) {
                      await updateTodo(todo.id, { title: newTitle.trim() })
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm"
                  title="수정"
                >
                  ✎
                </button>
                <button
                  onClick={async () => {
                    if (confirm('이 할 일을 삭제하시겠습니까?')) {
                      await deleteTodo(todo.id)
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm"
                  title="삭제"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  todo.completed ? 'bg-green-600' : 'bg-blue-500'
                }`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {todo.completed ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    )}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium text-sm truncate ${
                      todo.completed ? 'text-gray-400 line-through' : 'text-white'
                    }`}>
                      {todo.title}
                    </h4>
                    <span className={`px-2 py-0.5 text-xs rounded ${priorityStyle}`}>
                      {PRIORITIES.find(p => p.value === todo.priority)?.label}
                    </span>
                  </div>
                  
                  {todo.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {todo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="bg-gray-700 px-2 py-0.5 rounded">
                      {todo.category}
                    </span>
                    
                    {todo.tags.length > 0 && (
                      <div className="flex gap-1">
                        {todo.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="bg-blue-900/30 text-blue-300 px-1 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                        {todo.tags.length > 3 && (
                          <span className="text-gray-500">+{todo.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    <span>{formatDate(todo.createdAt)}</span>
                    
                    {todo.dueDate && (
                      <span className={`${
                        new Date(todo.dueDate) < new Date() ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        마감: {formatDate(todo.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Empty state */}
        {filteredTodos.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            {todos.length === 0 ? (
              <div>
                <div className="text-4xl mb-2">📝</div>
                <div>할 일을 추가해보세요</div>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">🔍</div>
                <div>검색 결과가 없습니다</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      {todos.length > 0 && !bulkMode && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={markAllCompleted}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
          >
            모두 완료
          </button>
          <button
            onClick={deleteCompleted}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
          >
            완료된 항목 삭제
          </button>
          <button
            onClick={syncTodos}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded transition-colors"
          >
            동기화
          </button>
        </div>
      )}

      {isAtLimit && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>할 일 한도에 도달했습니다 ({limit === Infinity ? 'unlimited' : limit}개)</span>
          </div>
          <p className="text-xs text-yellow-300 mt-1">
            기존 할 일을 삭제하거나 <a href="/pricing" className="underline hover:text-yellow-200">Pro 플랜으로 업그레이드</a>하세요
          </p>
        </div>
      )}
    </div>
  )
}