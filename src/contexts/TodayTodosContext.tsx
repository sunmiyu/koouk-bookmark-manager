'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

interface DiaryEntry {
  id: string
  content: string
  date: string
  createdAt: string
  updatedAt: string
}

interface TodayTodosContextType {
  todayTodos: Todo[]
  addTodo: (text: string, date?: Date) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  diaryEntries: DiaryEntry[]
  updateDiaryEntry: (date: Date, content: string) => void
  getSelectedDateEntry: (date: Date) => string
}

const TodayTodosContext = createContext<TodayTodosContextType | undefined>(undefined)

export function TodayTodosProvider({ children }: { children: ReactNode }) {
  const [todayTodos, setTodayTodos] = useState<Todo[]>([
    { id: '1', text: 'Complete project presentation', completed: false, createdAt: new Date().toISOString() },
    { id: '2', text: 'Review team feedback', completed: false, createdAt: new Date().toISOString() },
    { id: '3', text: 'Update project documentation', completed: true, createdAt: new Date().toISOString() },
  ])

  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])

  // Load diary entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('diaryEntries')
    if (savedEntries) {
      try {
        setDiaryEntries(JSON.parse(savedEntries))
      } catch (error) {
        console.error('Failed to load diary entries:', error)
      }
    }
  }, [])

  // Save diary entries to localStorage
  const saveDiaryEntries = (entries: DiaryEntry[]) => {
    setDiaryEntries(entries)
    localStorage.setItem('diaryEntries', JSON.stringify(entries))
  }

  const addTodo = (text: string, date?: Date) => {
    if (!text.trim()) return
    
    const targetDate = date || new Date()
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: targetDate.toISOString()
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

  // Update diary entry
  const updateDiaryEntry = (date: Date, content: string) => {
    const dateStr = date.toDateString()
    const trimmedContent = content.trim()
    
    if (trimmedContent === '') {
      // Remove entry if content is empty
      const updatedEntries = diaryEntries.filter(entry => entry.date !== dateStr)
      saveDiaryEntries(updatedEntries)
    } else {
      // Update or create entry
      const existingEntryIndex = diaryEntries.findIndex(entry => entry.date === dateStr)
      
      if (existingEntryIndex >= 0) {
        // Update existing entry
        const updatedEntries = [...diaryEntries]
        updatedEntries[existingEntryIndex] = {
          ...updatedEntries[existingEntryIndex],
          content: trimmedContent,
          updatedAt: new Date().toISOString()
        }
        saveDiaryEntries(updatedEntries)
      } else {
        // Create new entry
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          content: trimmedContent,
          date: dateStr,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        saveDiaryEntries([...diaryEntries, newEntry])
      }
    }
  }

  // Get diary entry for specific date
  const getSelectedDateEntry = (date: Date): string => {
    const dateStr = date.toDateString()
    const entry = diaryEntries.find(entry => entry.date === dateStr)
    return entry?.content || ''
  }

  return (
    <TodayTodosContext.Provider value={{
      todayTodos,
      addTodo,
      toggleTodo,
      deleteTodo,
      diaryEntries,
      updateDiaryEntry,
      getSelectedDateEntry
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