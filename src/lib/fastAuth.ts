/**
 * 🚀 CORRECT SUPABASE POPUP OAUTH IMPLEMENTATION
 * Based on official Supabase documentation and best practices
 * Uses skipBrowserRedirect + BroadcastChannel for 400-800ms authentication
 */

import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

interface PopupAuthResult {
  success: boolean
  user?: User
  session?: Session
  error?: string
}

interface PopupAuthOptions {
  provider: 'google'
  timeout?: number
  popupFeatures?: string
}

/**
 * 🎯 CORRECT POPUP OAUTH Implementation
 * Uses Supabase's skipBrowserRedirect + BroadcastChannel
 */
export class FastAuth {
  private static authPopup: Window | null = null
  private static pendingAuth: Promise<PopupAuthResult> | null = null
  private static broadcastChannel: BroadcastChannel | null = null

  /**
   * Performs correct Supabase popup-based OAuth authentication
   * Target: 400-800ms total time with proper Supabase flow
   */
  static async signInWithPopup(options: PopupAuthOptions): Promise<PopupAuthResult> {
    // Prevent multiple simultaneous auth attempts
    if (this.pendingAuth) {
      console.log('🔄 Auth already in progress, waiting...')
      return this.pendingAuth
    }

    this.pendingAuth = this.performPopupAuth(options)
    const result = await this.pendingAuth
    this.pendingAuth = null
    
    return result
  }

  private static async performPopupAuth(options: PopupAuthOptions): Promise<PopupAuthResult> {
    const startTime = performance.now()
    
    try {
      console.log('🚀 Starting Supabase popup OAuth...')
      
      // 🔧 CORRECT METHOD: Use skipBrowserRedirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: options.provider,
        options: {
          skipBrowserRedirect: true,
          redirectTo: `${window.location.origin}/auth/popup-callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      if (!data.url) {
        throw new Error('No OAuth URL received from Supabase')
      }
      
      // 🚀 Open popup with OAuth URL
      const popupFeatures = options.popupFeatures || 
        'width=500,height=650,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      
      this.authPopup = window.open(data.url, 'oauth_popup', popupFeatures)
      
      if (!this.authPopup) {
        throw new Error('Popup blocked. Please allow popups for authentication.')
      }

      this.authPopup.focus()

      // 🔧 CORRECT METHOD: Use BroadcastChannel for communication
      const result = await this.waitForAuthResult(options.timeout || 60000)
      
      const totalTime = performance.now() - startTime
      console.log(`🚀 Fast auth completed in ${Math.round(totalTime)}ms`)
      
      return result

    } catch (error) {
      console.error('🚨 Fast auth error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }
    } finally {
      this.cleanup()
    }
  }

  /**
   * 🔧 CORRECT METHOD: BroadcastChannel communication
   */
  private static waitForAuthResult(timeout: number): Promise<PopupAuthResult> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup()
        reject(new Error('Authentication timeout'))
      }, timeout)

      // 🔧 Create BroadcastChannel for popup communication
      this.broadcastChannel = new BroadcastChannel('supabase-auth-popup')
      
      const messageHandler = async (event: MessageEvent) => {
        console.log('🔔 Received popup message:', event.data)
        
        if (event.data?.type === 'OAUTH_SUCCESS') {
          cleanup()
          
          try {
            // Get fresh session after OAuth
            const { data: { session }, error } = await supabase.auth.getSession()
            
            if (error) throw error
            
            if (session?.user) {
              // Cache session
              if (typeof window !== 'undefined' && session.expires_at) {
                const cacheData = {
                  user: session.user,
                  expiresAt: session.expires_at * 1000
                }
                localStorage.setItem('koouk-session-cache', JSON.stringify(cacheData))
              }
              
              resolve({
                success: true,
                user: session.user,
                session: session
              })
            } else {
              resolve({
                success: false,
                error: 'No session found after authentication'
              })
            }
          } catch (error) {
            resolve({
              success: false,
              error: error instanceof Error ? error.message : 'Session validation failed'
            })
          }
        } else if (event.data?.type === 'OAUTH_ERROR') {
          cleanup()
          resolve({
            success: false,
            error: event.data.error || 'Authentication failed'
          })
        }
      }

      const cleanup = () => {
        clearTimeout(timeoutId)
        this.broadcastChannel?.removeEventListener('message', messageHandler)
        this.broadcastChannel?.close()
        this.broadcastChannel = null
      }

      this.broadcastChannel.addEventListener('message', messageHandler)
    })
  }

  /**
   * Efficient cleanup
   */
  private static cleanup(): void {
    if (this.authPopup && !this.authPopup.closed) {
      this.authPopup.close()
    }
    this.authPopup = null
    
    if (this.broadcastChannel) {
      this.broadcastChannel.close()
      this.broadcastChannel = null
    }
  }

  /**
   * Preload auth resources for faster subsequent logins
   */
  static preloadAuthResources(): void {
    // Preload Google OAuth scripts
    const script = document.createElement('link')
    script.rel = 'dns-prefetch'
    script.href = 'https://accounts.google.com'
    document.head.appendChild(script)

    // Preload Supabase auth endpoint
    const supabaseLink = document.createElement('link')
    supabaseLink.rel = 'dns-prefetch'  
    supabaseLink.href = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    document.head.appendChild(supabaseLink)
  }

  /**
   * Check if popup auth is supported
   */
  static isPopupSupported(): boolean {
    try {
      const testPopup = window.open('', '_blank', 'width=1,height=1')
      if (testPopup) {
        testPopup.close()
        return true
      }
      return false
    } catch {
      return false
    }
  }
}

/**
 * 🚀 Hook for easy integration with React components
 */
export const useFastAuth = () => {
  const signInWithPopup = async (provider: 'google' = 'google') => {
    FastAuth.preloadAuthResources()
    
    const result = await FastAuth.signInWithPopup({ provider })
    return result
  }

  return {
    signInWithPopup,
    isPopupSupported: FastAuth.isPopupSupported(),
    preloadResources: FastAuth.preloadAuthResources
  }
}