'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  icon?: string
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => string
  hideToast: (id: string) => void
  clearAll: () => void
  position: ToastPosition
  setPosition: (position: ToastPosition) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
}

export function ToastProvider({ 
  children, 
  position = 'top-right',
  maxToasts = 5 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [toastPosition, setToastPosition] = useState<ToastPosition>(position)

  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = generateId()
    const newToast: Toast = {
      id,
      duration: 5000, // 5 seconds default
      ...toastData
    }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      // Limit number of toasts
      return updated.slice(0, maxToasts)
    })

    // Auto-remove toast if not persistent
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id)
      }, newToast.duration)
    }

    return id
  }, [generateId, maxToasts, hideToast])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  const setPosition = useCallback((newPosition: ToastPosition) => {
    setToastPosition(newPosition)
  }, [])

  return (
    <ToastContext.Provider value={{
      toasts,
      showToast,
      hideToast,
      clearAll,
      position: toastPosition,
      setPosition
    }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience functions
export function useToastActions() {
  const { showToast } = useToast()

  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({
      type: 'success',
      title,
      message,
      icon: '✅',
      ...options
    })
  }, [showToast])

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({
      type: 'error',
      title,
      message,
      icon: '❌',
      duration: 7000, // Longer for errors
      ...options
    })
  }, [showToast])

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({
      type: 'warning',
      title,
      message,
      icon: '⚠️',
      ...options
    })
  }, [showToast])

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({
      type: 'info',
      title,
      message,
      icon: 'ℹ️',
      ...options
    })
  }, [showToast])

  return { success, error, warning, info, showToast }
}