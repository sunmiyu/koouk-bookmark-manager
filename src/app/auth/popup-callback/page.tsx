/**
 * 🚀 ULTRA-FAST Popup Callback Page
 * Minimal overhead popup callback for sub-second authentication
 * Target: <100ms processing time vs 200-400ms regular callback
 */

'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PopupCallback() {
  useEffect(() => {
    const handlePopupCallback = async () => {
      try {
        // 🚀 OPTIMIZATION 16: Minimal processing for maximum speed
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          // Send error to parent window
          window.opener?.postMessage({
            type: 'OAUTH_ERROR',
            error: error.message
          }, window.location.origin)
        } else if (data.session) {
          // 🚀 OPTIMIZATION 17: Immediate success notification
          window.opener?.postMessage({
            type: 'OAUTH_SUCCESS',
            session: data.session
          }, window.location.origin)
        } else {
          // No session case
          window.opener?.postMessage({
            type: 'OAUTH_ERROR',
            error: 'No session found'
          }, window.location.origin)
        }
        
        // 🚀 OPTIMIZATION 18: Immediate popup closure
        window.close()
        
      } catch (error) {
        console.error('Popup callback error:', error)
        window.opener?.postMessage({
          type: 'OAUTH_ERROR',
          error: 'Callback processing failed'
        }, window.location.origin)
        window.close()
      }
    }

    // 🚀 OPTIMIZATION 19: Start immediately, no delays
    handlePopupCallback()
  }, [])

  // 🚀 OPTIMIZATION 20: Minimal UI to reduce render time
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'system-ui',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          border: '3px solid #e5e7eb', 
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
          Completing authentication...
        </p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}