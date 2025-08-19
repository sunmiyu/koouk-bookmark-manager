'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Sparkles } from 'lucide-react'

interface FloatingMarketplaceButtonProps {
  onClick: () => void
  show?: boolean
}

export default function FloatingMarketplaceButton({ 
  onClick, 
  show = true 
}: FloatingMarketplaceButtonProps) {
  if (!show) return null

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-40"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 300
      }}
    >
      <motion.button
        onClick={onClick}
        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-xl flex items-center justify-center relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        {/* Sparkle effect */}
        <div className="absolute inset-0 rounded-full">
          <div className="absolute top-2 right-2">
            <Sparkles size={8} className="text-white/70" />
          </div>
          <div className="absolute bottom-2 left-2">
            <Sparkles size={6} className="text-white/50" />
          </div>
        </div>
        
        {/* Main icon */}
        <ShoppingBag size={20} />
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
      </motion.button>
      
      {/* Tooltip */}
      <motion.div
        className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        Browse Collections
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black/80" />
      </motion.div>
    </motion.div>
  )
}