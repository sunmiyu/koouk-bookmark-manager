'use client'

import { useState, useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface SimpleToastProps {
  message: string
  type: ToastType
  show: boolean
  onClose: () => void
}

export default function SimpleToast({ message, type, show, onClose }: SimpleToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000) // 3초 후 자동 닫기
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  const getStyles = () => {
    switch (type) {
      case 'success':
        return { bg: '#DCFCE7', border: '#16A34A', color: '#166534', icon: '✅' }
      case 'error':
        return { bg: '#FEE2E2', border: '#DC2626', color: '#991B1B', icon: '❌' }
      default:
        return { bg: '#DBEAFE', border: '#3B82F6', color: '#1E40AF', icon: 'ℹ️' }
    }
  }

  const styles = getStyles()

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex items-center gap-2 p-3 rounded-lg shadow-lg max-w-sm"
      style={{
        backgroundColor: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        color: styles.color
      }}
      onClick={onClose}
    >
      <span>{styles.icon}</span>
      <span className="text-sm font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-auto text-lg hover:opacity-70"
      >
        ×
      </button>
    </div>
  )
}

// 간단한 훅
export function useSimpleToast() {
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
    show: boolean
  }>({
    message: '',
    type: 'info',
    show: false
  })

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, show: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  return { toast, showToast, hideToast }
}