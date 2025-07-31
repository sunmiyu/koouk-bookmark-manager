'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
}

interface TodayTodosContextType {
  todayTodos: Todo[]
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
}

const TodayTodosContext = createContext<TodayTodosContextType | undefined>(undefined)

export function TodayTodosProvider({ children }: { children: ReactNode }) {
  const [todayTodos, setTodayTodos] = useState<Todo[]>([
    { id: '1', text: 'Complete project presentation', completed: false },
    { id: '2', text: 'Review team feedback', completed: false },
    { id: '3', text: 'Update project documentation', completed: true },
  ])

  const addTodo = (text: string) => {
    if (!text.trim()) return
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false
    }
    
    setTodayTodos(prev => [...prev, newTodo])
  }

  const toggleTodo = (id: string) => {
    setTodayTodos(prev => 
      prev.map(todo => 
        todo.id === id 
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodayTodos(prev => prev.filter(todo => todo.id !== id))
  }

  return (
    <TodayTodosContext.Provider value={{
      todayTodos,
      addTodo,
      toggleTodo,
      deleteTodo
    }}>
      {children}
    </TodayTodosContext.Provider>
  )
}

export function useTodayTodos() {
  const context = useContext(TodayTodosContext)
  if (context === undefined) {
    throw new Error('useTodayTodos must be used within a TodayTodosProvider')
  }
  return context
}