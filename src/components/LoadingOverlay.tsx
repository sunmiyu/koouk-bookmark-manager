'use client'

import { useLoading } from '@/contexts/LoadingContext'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function LoadingOverlay() {
  const { loadingStates } = useLoading()

  // Only show overlay for blocking loading states
  const overlayStates = loadingStates.filter(state => state.overlay && state.blocking)

  if (overlayStates.length === 0) return null

  const currentState = overlayStates[0] // Show only the first overlay

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900/95 border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
        <div className="text-center space-y-4">
          <LoadingSpinner 
            size="lg"
            text={currentState.message || 'Loading...'}
          />
          
          {currentState.progress !== undefined && currentState.progress > 0 && (
            <div className="text-xs text-gray-400">
              Please wait while we process your request...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}