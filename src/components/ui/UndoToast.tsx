'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Undo2, X } from 'lucide-react'

interface UndoToastProps {
  show: boolean
  message: string
  onUndo: () => void
  onDismiss: () => void
  autoHideMs?: number
}

export default function UndoToast({
  show,
  message,
  onUndo,
  onDismiss,
  autoHideMs = 5000
}: UndoToastProps) {
  const [timeLeft, setTimeLeft] = useState(autoHideMs / 1000)

  useEffect(() => {
    if (!show) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onDismiss()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [show, onDismiss])

  useEffect(() => {
    if (show) {
      setTimeLeft(autoHideMs / 1000)
    }
  }, [show, autoHideMs])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gray-900 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[320px]">
            {/* 메시지 */}
            <span className="flex-1 text-sm">{message}</span>
            
            {/* Undo 버튼 */}
            <button
              onClick={() => {
                onUndo()
                onDismiss()
              }}
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium transition-colors"
            >
              <Undo2 className="w-3 h-3" />
              실행취소
            </button>
            
            {/* 닫기 버튼 */}
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* 타이머 표시 */}
            <div className="text-xs text-gray-400 min-w-[20px] text-center">
              {timeLeft}s
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}