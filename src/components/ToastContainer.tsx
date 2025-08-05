'use client'

import { useToast } from '@/contexts/ToastContext'
import Toast from '@/components/Toast'

export default function ToastContainer() {
  const { toasts, hideToast, position } = useToast()

  if (toasts.length === 0) return null

  const getContainerClasses = () => {
    const baseClasses = 'fixed z-50 pointer-events-none'
    
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4 flex flex-col gap-3`
      case 'top-left':
        return `${baseClasses} top-4 left-4 flex flex-col gap-3`
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4 flex flex-col-reverse gap-3`
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4 flex flex-col-reverse gap-3`
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2 flex flex-col gap-3 items-center`
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col-reverse gap-3 items-center`
      default:
        return `${baseClasses} top-4 right-4 flex flex-col gap-3`
    }
  }

  return (
    <div className={getContainerClasses()}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            zIndex: 50 + (toasts.length - index),
            transform: `translateY(${index * 2}px) scale(${1 - index * 0.02})`,
            opacity: Math.max(0.7, 1 - index * 0.1)
          }}
        >
          <Toast
            toast={toast}
            onClose={hideToast}
            position={position}
          />
        </div>
      ))}
    </div>
  )
}