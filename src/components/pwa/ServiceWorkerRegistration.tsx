'use client'

import { useEffect, useState } from 'react'

export default function ServiceWorkerRegistration() {
  const [swStatus, setSWStatus] = useState<string>('checking')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('🔧 PWA: Registering Service Worker...')
      
      navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
        .then((registration) => {
          console.log('✅ PWA: Service Worker registered successfully:', registration)
          setSWStatus('registered')
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('🔄 PWA: New Service Worker found, preparing to update...')
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🆕 PWA: New content available, reload to update!')
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('❌ PWA: Service Worker registration failed:', error)
          setSWStatus('failed')
        })

      // Listen for messages from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('💬 PWA: Message from Service Worker:', event.data)
        
        if (event.data?.type === 'SYNC_COMPLETE') {
          console.log('🔄 PWA: Background sync completed:', event.data.data)
        }
      })

      // Check if app was launched from installed PWA
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('📱 PWA: App launched from installed PWA!')
      }
    } else {
      console.warn('⚠️ PWA: Service Worker not supported')
      setSWStatus('unsupported')
    }
  }, [])

  // Only show status in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}>
        SW: {swStatus}
      </div>
    )
  }

  return null
}