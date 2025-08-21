'use client'

import { useState } from 'react'

interface UndoToastState {
  show: boolean
  message: string
  onUndo: () => void
}

export function useUndoToast() {
  const [toastState, setToastState] = useState<UndoToastState>({
    show: false,
    message: '',
    onUndo: () => {}
  })

  const showUndoToast = (message: string, onUndo: () => void) => {
    setToastState({
      show: true,
      message,
      onUndo
    })
  }

  const hideUndoToast = () => {
    setToastState(prev => ({ ...prev, show: false }))
  }

  return {
    toastState,
    showUndoToast,
    hideUndoToast
  }
}