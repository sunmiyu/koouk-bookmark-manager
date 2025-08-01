'use client'

import { useState } from 'react'
import { useTodayTodos } from '@/contexts/TodayTodosContext'

export default function TodayTodoCard() {
  const { todayTodos, addTodo, toggleTodo, deleteTodo } = useTodayTodos()
  const [newTodoText, setNewTodoText] = useState('')

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodoText.trim()) {
      addTodo(newTodoText)
      setNewTodoText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTodo(e as unknown as React.FormEvent)
    }
  }

  // Get today's date info
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekday = weekdays[today.getDay()]

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 w-full transition-all duration-200 hover:bg-gray-800/70 shadow-lg shadow-blue-500/10 border border-blue-500/20">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-white">{month}/{day}</div>
            <div className="text-sm text-gray-400">{weekday}</div>
          </div>
          <div className="flex gap-1">
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-md font-medium border border-blue-500/30">Today</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-1 mb-2">
        {todayTodos.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-4">
            No todos for today
          </div>
        ) : (
          todayTodos.map((todo) => (
            <div key={todo.id} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="rounded w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0"
              />
              <span className={`flex-1 text-sm break-words transition-colors ${
                todo.completed ? 'line-through text-gray-500' : 'text-gray-200'
              }`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center transition-all text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-700/50 pt-4">
        <form onSubmit={handleAddTodo}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add new todo..."
            className="w-full px-3 py-2 text-sm bg-gray-700/50 rounded-lg focus:outline-none focus:bg-gray-700 text-white placeholder-gray-400 transition-colors"
          />
        </form>
      </div>
    </div>
  )
}