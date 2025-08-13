import { useState, useCallback } from 'react'

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info'
  })

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type })
  }, [])

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success')
  }, [showToast])

  const showError = useCallback((message: string) => {
    showToast(message, 'error')
  }, [showToast])

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info')
  }, [showToast])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }))
  }, [])

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    hideToast
  }
}