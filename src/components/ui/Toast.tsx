'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'

interface ToastProps {
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ show, message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />
      case 'error':
        return <X className="w-5 h-5 text-red-600" />
      default:
        return <span className="text-lg">ℹ️</span>
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="fixed top-4 right-4 z-[10002] max-w-sm"
        >
          <div className={`px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm ${getBgColor()}`}>
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              >
                {getIcon()}
              </motion.div>
              
              <div className="flex-1">
                <motion.p
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm font-medium"
                >
                  {message}
                </motion.p>
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}