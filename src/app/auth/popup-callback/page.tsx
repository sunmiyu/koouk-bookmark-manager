/**
 * 🚀 CORRECT SUPABASE POPUP CALLBACK PAGE
 * Uses BroadcastChannel for proper communication with parent window
 * Target: <100ms processing time with reliable OAuth handling
 */

'use client'

import { useEffect } from 'react'

export default function PopupCallback() {
  useEffect(() => {
    const handlePopupCallback = async () => {
      try {
        console.log('🔔 Popup callback triggered')
        
        // 🔧 CORRECT METHOD: Use BroadcastChannel instead of postMessage
        const channel = new BroadcastChannel('supabase-auth-popup')
        
        // Check URL for OAuth result
        const urlParams = new URLSearchParams(window.location.search)
        const error = urlParams.get('error')
        const code = urlParams.get('code')
        
        if (error) {
          console.error('OAuth error in popup:', error)
          channel.postMessage({
            type: 'OAUTH_ERROR',
            error: error
          })
        } else if (code) {
          console.log('✅ OAuth code received in popup:', code.substring(0, 8) + '...')
          channel.postMessage({
            type: 'OAUTH_SUCCESS',
            code: code
          })
        } else {
          console.error('No code or error in popup callback URL')
          channel.postMessage({
            type: 'OAUTH_ERROR',
            error: 'No authorization code received'
          })
        }
        
        // Clean up and close popup
        channel.close()
        
        // 🚀 OPTIMIZATION: Immediate popup closure
        setTimeout(() => {
          window.close()
        }, 100)
        
      } catch (error) {
        console.error('Popup callback error:', error)
        
        // Fallback: try BroadcastChannel
        try {
          const channel = new BroadcastChannel('supabase-auth-popup')
          channel.postMessage({
            type: 'OAUTH_ERROR',
            error: 'Callback processing failed'
          })
          channel.close()
        } catch (e) {
          console.error('Failed to send error message:', e)
        }
        
        setTimeout(() => {
          window.close()
        }, 100)
      }
    }

    // Start immediately
    handlePopupCallback()
  }, [])

  // Minimal UI for fastest render
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'system-ui',
      backgroundColor: '#ffffff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '20px', 
          height: '20px', 
          border: '2px solid #e5e7eb', 
          borderTop: '2px solid #000000',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 8px'
        }} />
        <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
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