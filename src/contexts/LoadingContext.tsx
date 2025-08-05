'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type LoadingType = 'spinner' | 'skeleton' | 'progress' | 'dots' | 'pulse'

export interface LoadingState {
  id: string
  type: LoadingType
  message?: string
  progress?: number
  blocking?: boolean
  overlay?: boolean
}

interface LoadingContextType {
  loadingStates: LoadingState[]
  showLoading: (id: string, type: LoadingType, options?: Partial<LoadingState>) => void
  hideLoading: (id: string) => void
  updateLoading: (id: string, updates: Partial<LoadingState>) => void
  isLoading: (id?: string) => boolean
  clearAllLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([])

  const showLoading = useCallback((id: string, type: LoadingType, options?: Partial<LoadingState>) => {
    const newLoadingState: LoadingState = {
      id,
      type,
      message: 'Loading...',
      progress: 0,
      blocking: false,
      overlay: false,
      ...options
    }

    setLoadingStates(prev => {
      const filtered = prev.filter(state => state.id !== id)
      return [...filtered, newLoadingState]
    })
  }, [])

  const hideLoading = useCallback((id: string) => {
    setLoadingStates(prev => prev.filter(state => state.id !== id))
  }, [])

  const updateLoading = useCallback((id: string, updates: Partial<LoadingState>) => {
    setLoadingStates(prev => prev.map(state => 
      state.id === id ? { ...state, ...updates } : state
    ))
  }, [])

  const isLoading = useCallback((id?: string) => {
    if (id) {
      return loadingStates.some(state => state.id === id)
    }
    return loadingStates.length > 0
  }, [loadingStates])

  const clearAllLoading = useCallback(() => {
    setLoadingStates([])
  }, [])

  return (
    <LoadingContext.Provider value={{
      loadingStates,
      showLoading,
      hideLoading,
      updateLoading,
      isLoading,
      clearAllLoading
    }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

// Convenience hooks
export function useLoadingActions() {
  const { showLoading, hideLoading, updateLoading } = useLoading()

  const showSpinner = useCallback((id: string, message?: string) => {
    showLoading(id, 'spinner', { message })
  }, [showLoading])

  const showSkeleton = useCallback((id: string) => {
    showLoading(id, 'skeleton')
  }, [showLoading])

  const showProgress = useCallback((id: string, message?: string, progress?: number) => {
    showLoading(id, 'progress', { message, progress })
  }, [showLoading])

  const showDots = useCallback((id: string, message?: string) => {
    showLoading(id, 'dots', { message })
  }, [showLoading])

  const showPulse = useCallback((id: string, message?: string) => {
    showLoading(id, 'pulse', { message })
  }, [showLoading])

  const showOverlay = useCallback((id: string, message?: string) => {
    showLoading(id, 'spinner', { message, blocking: true, overlay: true })
  }, [showLoading])

  return {
    showSpinner,
    showSkeleton,
    showProgress,
    showDots,
    showPulse,
    showOverlay,
    hideLoading,
    updateLoading
  }
}