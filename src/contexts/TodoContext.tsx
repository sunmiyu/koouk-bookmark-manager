'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export interface TodoItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  dueDate?: string
  userId?: string
}

interface TodoContextType {
  todos: TodoItem[]
  loading: boolean
  error: string | null
  
  // CRUD operations
  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTodo: (id: string, updates: Partial<TodoItem>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  
  // Batch operations
  markAllCompleted: () => Promise<void>
  deleteCompleted: () => Promise<void>
  
  // Filtering
  filterTodos: (filter: TodoFilter) => TodoItem[]
  
  // Sync
  syncTodos: () => Promise<void>
  lastSynced: string | null
}

export interface TodoFilter {
  category?: string
  priority?: 'high' | 'medium' | 'low'
  completed?: boolean
  tags?: string[]
  search?: string
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

// Supabase Todo Service
class TodoService {
  private supabase: any // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor() {
    // Import Supabase client dynamically to avoid SSR issues
    if (typeof window !== 'undefined') {
      import('@/lib/supabase').then(({ supabase }) => {
        this.supabase = supabase
      })
    }
  }

  async getAll(userId: string): Promise<TodoItem[]> {
    try {
      // Try Supabase first
      if (this.supabase && userId !== 'guest') {
        const { data, error } = await this.supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        return data.map((row: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          id: row.id,
          title: row.title,
          description: row.description,
          completed: row.completed,
          priority: row.priority,
          category: row.category,
          tags: row.tags || [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          dueDate: row.due_date,
          userId: row.user_id
        }))
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(`todos_${userId}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to fetch todos:', error)
      // Fallback to localStorage on error
      const stored = localStorage.getItem(`todos_${userId}`)
      return stored ? JSON.parse(stored) : []
    }
  }

  async create(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoItem> {
    const now = new Date().toISOString()
    const newTodo: TodoItem = {
      ...todo,
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    }

    try {
      // Try Supabase first
      if (this.supabase && todo.userId && todo.userId !== 'guest') {
        const { data, error } = await this.supabase
          .from('todos')
          .insert({
            id: newTodo.id,
            user_id: todo.userId,
            title: todo.title,
            description: todo.description,
            completed: todo.completed,
            priority: todo.priority,
            category: todo.category,
            tags: todo.tags,
            due_date: todo.dueDate,
            created_at: now,
            updated_at: now
          })
          .select()
          .single()

        if (error) throw error
        
        // Return the created todo with proper field mapping
        return {
          id: data.id,
          title: data.title,
          description: data.description,
          completed: data.completed,
          priority: data.priority,
          category: data.category,
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          dueDate: data.due_date,
          userId: data.user_id
        }
      }

      // Fallback to localStorage
      const userId = todo.userId || 'guest'
      const stored = localStorage.getItem(`todos_${userId}`)
      const todos = stored ? JSON.parse(stored) : []
      todos.unshift(newTodo) // Add to beginning for newest first
      localStorage.setItem(`todos_${userId}`, JSON.stringify(todos))
      
      return newTodo
    } catch (error) {
      console.error('Failed to create todo:', error)
      
      // Always save to localStorage as backup
      const userId = todo.userId || 'guest'
      const stored = localStorage.getItem(`todos_${userId}`)
      const todos = stored ? JSON.parse(stored) : []
      todos.unshift(newTodo)
      localStorage.setItem(`todos_${userId}`, JSON.stringify(todos))
      
      return newTodo
    }
  }

  async update(id: string, updates: Partial<TodoItem>): Promise<TodoItem> {
    const now = new Date().toISOString()
    
    try {
      // Try Supabase first
      if (this.supabase && updates.userId && updates.userId !== 'guest') {
        const { data, error } = await this.supabase
          .from('todos')
          .update({
            title: updates.title,
            description: updates.description,
            completed: updates.completed,
            priority: updates.priority,
            category: updates.category,
            tags: updates.tags,
            due_date: updates.dueDate,
            updated_at: now
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return {
          id: data.id,
          title: data.title,
          description: data.description,
          completed: data.completed,
          priority: data.priority,
          category: data.category,
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          dueDate: data.due_date,
          userId: data.user_id
        }
      }

      // Fallback to localStorage
      const userId = updates.userId || 'guest'
      const stored = localStorage.getItem(`todos_${userId}`)
      const todos: TodoItem[] = stored ? JSON.parse(stored) : []
      
      const index = todos.findIndex(todo => todo.id === id)
      if (index === -1) throw new Error('Todo not found')
      
      const updatedTodo = {
        ...todos[index],
        ...updates,
        updatedAt: now
      }
      
      todos[index] = updatedTodo
      localStorage.setItem(`todos_${userId}`, JSON.stringify(todos))
      
      return updatedTodo
    } catch (error) {
      console.error('Failed to update todo:', error)
      
      // Try localStorage as fallback
      const userId = updates.userId || 'guest'
      const stored = localStorage.getItem(`todos_${userId}`)
      const todos: TodoItem[] = stored ? JSON.parse(stored) : []
      
      const index = todos.findIndex(todo => todo.id === id)
      if (index === -1) throw error
      
      const updatedTodo = {
        ...todos[index],
        ...updates,
        updatedAt: now
      }
      
      todos[index] = updatedTodo
      localStorage.setItem(`todos_${userId}`, JSON.stringify(todos))
      
      return updatedTodo
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      // Try Supabase first
      if (this.supabase && userId !== 'guest') {
        const { error } = await this.supabase
          .from('todos')
          .delete()
          .eq('id', id)

        if (error) throw error
      }

      // Also remove from localStorage
      const stored = localStorage.getItem(`todos_${userId}`)
      const todos: TodoItem[] = stored ? JSON.parse(stored) : []
      
      const filteredTodos = todos.filter(todo => todo.id !== id)
      localStorage.setItem(`todos_${userId}`, JSON.stringify(filteredTodos))
    } catch (error) {
      console.error('Failed to delete todo:', error)
      
      // Fallback to localStorage only
      const stored = localStorage.getItem(`todos_${userId}`)
      const todos: TodoItem[] = stored ? JSON.parse(stored) : []
      
      const filteredTodos = todos.filter(todo => todo.id !== id)
      localStorage.setItem(`todos_${userId}`, JSON.stringify(filteredTodos))
    }
  }
}

const todoService = new TodoService()

export function TodoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<string | null>(null)

  // Load todos when user changes
  useEffect(() => {
    if (user) {
      syncTodos()
    } else {
      // Load guest todos
      loadGuestTodos()
    }
  }, [user])

  const loadGuestTodos = async () => {
    try {
      setLoading(true)
      const guestTodos = await todoService.getAll('guest')
      setTodos(guestTodos)
    } catch {
      setError('Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  const syncTodos = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      const serverTodos = await todoService.getAll(user.id)
      setTodos(serverTodos)
      setLastSynced(new Date().toISOString())
      
      console.log(`Synced ${serverTodos.length} todos for user ${user.id}`)
    } catch (err) {
      setError('Failed to sync todos')
      console.error('Sync error:', err)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const userId = user?.id || 'guest'
      const newTodo = await todoService.create({ ...todoData, userId })
      setTodos(prev => [newTodo, ...prev])
    } catch (err) {
      setError('Failed to add todo')
      throw err
    }
  }

  const updateTodo = async (id: string, updates: Partial<TodoItem>) => {
    try {
      const userId = user?.id || 'guest'
      const updatedTodo = await todoService.update(id, { ...updates, userId })
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo))
    } catch (err) {
      setError('Failed to update todo')
      throw err
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const userId = user?.id || 'guest'
      await todoService.delete(id, userId)
      setTodos(prev => prev.filter(todo => todo.id !== id))
    } catch (err) {
      setError('Failed to delete todo')
      throw err
    }
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      await updateTodo(id, { completed: !todo.completed })
    }
  }

  const markAllCompleted = async () => {
    try {
      const incompleteTodos = todos.filter(todo => !todo.completed)
      await Promise.all(
        incompleteTodos.map(todo => updateTodo(todo.id, { completed: true }))
      )
    } catch {
      setError('Failed to mark all completed')
    }
  }

  const deleteCompleted = async () => {
    try {
      const completedTodos = todos.filter(todo => todo.completed)
      await Promise.all(
        completedTodos.map(todo => deleteTodo(todo.id))
      )
    } catch {
      setError('Failed to delete completed todos')
    }
  }

  const filterTodos = (filter: TodoFilter): TodoItem[] => {
    return todos.filter(todo => {
      // Category filter
      if (filter.category && todo.category !== filter.category) return false
      
      // Priority filter
      if (filter.priority && todo.priority !== filter.priority) return false
      
      // Completion filter
      if (filter.completed !== undefined && todo.completed !== filter.completed) return false
      
      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasAnyTag = filter.tags.some(tag => todo.tags.includes(tag))
        if (!hasAnyTag) return false
      }
      
      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        const matchesTitle = todo.title.toLowerCase().includes(searchLower)
        const matchesDescription = todo.description?.toLowerCase().includes(searchLower)
        const matchesTags = todo.tags.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!matchesTitle && !matchesDescription && !matchesTags) return false
      }
      
      return true
    })
  }

  // Auto-sync every 5 minutes
  useEffect(() => {
    if (!user) return
    
    const interval = setInterval(syncTodos, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  const value: TodoContextType = {
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
  }

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  )
}

export function useTodos() {
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider')
  }
  return context
}