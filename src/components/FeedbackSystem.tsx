'use client'

import { useState, useCallback } from 'react'
import { useToastActions } from '@/contexts/ToastContext'
import { useLoadingActions } from '@/contexts/LoadingContext'
import AnimatedFeedback, { FeedbackType } from '@/components/AnimatedFeedback'

interface FeedbackOptions {
  showToast?: boolean
  showInline?: boolean
  showLoading?: boolean
  duration?: number
  toastDuration?: number
  loadingMessage?: string
}

interface InlineFeedback {
  id: string
  type: FeedbackType
  message: string
  description?: string
}

export function useFeedbackSystem() {
  const [inlineFeedbacks, setInlineFeedbacks] = useState<InlineFeedback[]>([])
  const toastActions = useToastActions()
  const loadingActions = useLoadingActions()

  const showFeedback = useCallback((
    type: FeedbackType,
    message: string,
    description?: string,
    options: FeedbackOptions = {}
  ) => {
    const {
      showToast = true,
      showInline = false,
      showLoading = false,
      duration = 3000,
      toastDuration = 5000,
      loadingMessage = 'Processing...'
    } = options

    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Show toast notification
    if (showToast) {
      const toastOptions = {
        duration: toastDuration,
        ...(type === 'success' && {
          action: {
            label: 'Done',
            onClick: () => console.log('Success acknowledged')
          }
        })
      }

      switch (type) {
        case 'success':
          toastActions.success(message, description, toastOptions)
          break
        case 'error':
          toastActions.error(message, description, toastOptions)
          break
        case 'warning':
          toastActions.warning(message, description, toastOptions)
          break
        case 'info':
          toastActions.info(message, description, toastOptions)
          break
      }
    }

    // Show inline feedback
    if (showInline) {
      const newFeedback: InlineFeedback = {
        id: feedbackId,
        type,
        message,
        description
      }

      setInlineFeedbacks(prev => [...prev, newFeedback])

      // Auto-remove inline feedback
      setTimeout(() => {
        setInlineFeedbacks(prev => prev.filter(f => f.id !== feedbackId))
      }, duration)
    }

    // Show loading
    if (showLoading) {
      loadingActions.showSpinner(feedbackId, loadingMessage)
    }

    return feedbackId
  }, [toastActions, loadingActions])

  const clearInlineFeedback = useCallback((id: string) => {
    setInlineFeedbacks(prev => prev.filter(f => f.id !== id))
  }, [])

  const clearAllInlineFeedbacks = useCallback(() => {
    setInlineFeedbacks([])
  }, [])

  // Convenience methods
  const showSuccess = useCallback((message: string, description?: string, options?: FeedbackOptions) => {
    return showFeedback('success', message, description, options)
  }, [showFeedback])

  const showError = useCallback((message: string, description?: string, options?: FeedbackOptions) => {
    return showFeedback('error', message, description, options)
  }, [showFeedback])

  const showWarning = useCallback((message: string, description?: string, options?: FeedbackOptions) => {
    return showFeedback('warning', message, description, options)
  }, [showFeedback])

  const showInfo = useCallback((message: string, description?: string, options?: FeedbackOptions) => {
    return showFeedback('info', message, description, options)
  }, [showFeedback])

  // Process feedback - shows loading then success/error
  const processWithFeedback = useCallback(
    async function<T>(
      asyncOperation: () => Promise<T>,
      loadingMessage: string,
      successMessage: string,
      errorMessage: string,
      options: FeedbackOptions = {}
    ): Promise<T | null> {
      const feedbackId = `process-${Date.now()}`
      
      try {
        // Show loading
        loadingActions.showSpinner(feedbackId, loadingMessage)
        
        // Execute operation
        const result = await asyncOperation()
        
        // Hide loading
        loadingActions.hideLoading(feedbackId)
        
        // Show success
        showSuccess(successMessage, undefined, options)
        
        return result
      } catch (error) {
        // Hide loading
        loadingActions.hideLoading(feedbackId)
        
        // Show error
        const errorDesc = error instanceof Error ? error.message : 'An unexpected error occurred'
        showError(errorMessage, errorDesc, options)
        
        return null
      }
    },
    [loadingActions, showSuccess, showError]
  )

  return {
    inlineFeedbacks,
    showFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    processWithFeedback,
    clearInlineFeedback,
    clearAllInlineFeedbacks
  }
}

interface FeedbackContainerProps {
  inlineFeedbacks: InlineFeedback[]
  onClearFeedback: (id: string) => void
  position?: 'top' | 'bottom'
  className?: string
}

export function FeedbackContainer({ 
  inlineFeedbacks, 
  onClearFeedback,
  position = 'top',
  className = ''
}: FeedbackContainerProps) {
  if (inlineFeedbacks.length === 0) return null

  return (
    <div className={`space-y-3 ${position === 'bottom' ? 'flex flex-col-reverse' : ''} ${className}`}>
      {inlineFeedbacks.map((feedback) => (
        <AnimatedFeedback
          key={feedback.id}
          type={feedback.type}
          message={feedback.message}
          description={feedback.description}
          onComplete={() => onClearFeedback(feedback.id)}
          duration={3000}
          size="md"
        />
      ))}
    </div>
  )
}