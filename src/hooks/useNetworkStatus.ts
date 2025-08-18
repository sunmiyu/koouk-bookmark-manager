'use client'

import { useState, useEffect } from 'react'

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string | null
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: null
  })

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return

    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine
      let connectionType: string | null = null
      let isSlowConnection = false

      // Get connection info if available
      const connection = (navigator as any)?.connection || 
                        (navigator as any)?.mozConnection || 
                        (navigator as any)?.webkitConnection

      if (connection) {
        connectionType = connection.effectiveType || connection.type || null
        
        // Consider 2g, slow-2g, or downlink < 1.5 Mbps as slow
        isSlowConnection = 
          connectionType === '2g' || 
          connectionType === 'slow-2g' ||
          (connection.downlink && connection.downlink < 1.5)
      }

      setNetworkStatus({
        isOnline,
        isSlowConnection,
        connectionType
      })
    }

    // Initial check
    updateNetworkStatus()

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    // Listen for connection changes if available
    const connection = (navigator as any)?.connection
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus)
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  }, [])

  return networkStatus
}

// Hook for simple online/offline status
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}