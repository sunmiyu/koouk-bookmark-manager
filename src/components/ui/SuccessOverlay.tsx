'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface SuccessOverlayProps {
  show: boolean
  message: string
  onComplete?: () => void
}

export default function SuccessOverlay({ 
  show, 
  message, 
  onComplete 
}: SuccessOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-[60] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            if (!show) onComplete?.()
          }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 mx-4 max-w-sm w-full"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: -50 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
          >
            <div className="text-center">
              {/* Success Icon with Animation */}
              <motion.div
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15, stiffness: 400 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', damping: 15, stiffness: 400 }}
                >
                  <CheckCircle2 size={32} className="text-green-600" />
                </motion.div>
              </motion.div>
              
              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Success!
                </h3>
                <p className="text-gray-600 text-sm">
                  {message}
                </p>
              </motion.div>
              
              {/* Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][i % 4],
                      left: `${20 + (i * 10)}%`,
                      top: '20%'
                    }}
                    initial={{ scale: 0, y: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      y: [0, -30, -60],
                      x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40]
                    }}
                    transition={{
                      duration: 1.2,
                      delay: 0.5 + (i * 0.1),
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}