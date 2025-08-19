'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 🚀 FIX: Simplified refs for memory safety
  const mountedRef = useRef(true)
  const inititalizedRef = useRef(false)

  // 🚀 FIX: Stable callbacks to prevent re-renders
  const handleSetUser = useCallback((newUser: User | null) => {
    if (!mountedRef.current) return
    setUser(newUser)
  }, [])

  const handleSetLoading = useCallback((loadingState: boolean) => {
    if (!mountedRef.current) return
    setLoading(loadingState)
  }, [])

  useEffect(() => {
    // 🚀 FIX: Prevent double initialization
    if (inititalizedRef.current) return
    inititalizedRef.current = true

    console.log('🔄 Auth initialization started...')

    // 🚀 FIX: Initialize session with proper error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Session check error (ignoring):', error)
        }
        
        console.log('Initial session:', session ? '✅ Logged in' : '❌ Not logged in')
        
        handleSetUser(session?.user ?? null)
        
      } catch (error) {
        console.warn('Auth initialization failed:', error)
        handleSetUser(null)
      } finally {
        handleSetLoading(false)
      }
    }

    // 🚀 FIX: Set up auth state listener with proper cleanup
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mountedRef.current) return
        
        console.log('🔄 Auth state changed:', event)
        
        switch (event) {
          case 'SIGNED_IN':
            handleSetUser(session?.user ?? null)
            handleSetLoading(false)
            console.log('✅ Sign in completed')
            break
            
          case 'SIGNED_OUT':
            handleSetUser(null)
            handleSetLoading(false)
            console.log('✅ Sign out completed')
            break
            
          case 'TOKEN_REFRESHED':
            handleSetUser(session?.user ?? null)
            console.log('🔄 Token refreshed')
            break
            
          case 'INITIAL_SESSION':
            // Handle initial session (avoid double setting)
            if (!inititalizedRef.current) {
              handleSetUser(session?.user ?? null)
              handleSetLoading(false)
            }
            break
            
          default:
            // Ignore other events to prevent unnecessary re-renders
            console.log('🔄 Ignored auth event:', event)
            break
        }
      }
    )

    // Initialize after setting up listener
    initializeAuth()

    // 🚀 FIX: Proper cleanup
    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [handleSetUser, handleSetLoading]) // 🚀 FIX: Include stable callbacks in deps

  // 🚀 FIX: Simplified signIn with better error handling
  const signIn = useCallback(async () => {
    try {
      handleSetLoading(true)
      console.log('🚀 OAuth login started...')
      
      // 🚀 FIX: Correct callback URL for Next.js App Router
      const callbackUrl = process.env.NODE_ENV === 'development' 
        ? `${window.location.origin}/auth/callback`
        : process.env.NEXT_PUBLIC_SITE_URL 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          : `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent', // 🚀 FIX: Use 'consent' instead of 'select_account' for more reliable auth
          }
        }
      })
      
      if (error) {
        console.error('OAuth error:', error)
        handleSetLoading(false)
        throw error
      }
      
      console.log('🔄 OAuth redirect initiated')
      
    } catch (error) {
      console.error('Sign in failed:', error)
      handleSetLoading(false)
      throw error
    }
  }, [handleSetLoading])

  // 🚀 FIX: Simplified signOut with immediate UI update
  const signOut = useCallback(async () => {
    try {
      console.log('🚀 Sign out started...')
      
      // 🚀 FIX: Immediate UI update for better UX
      handleSetUser(null)
      handleSetLoading(false)
      
      // Background cleanup
      await supabase.auth.signOut()
      
      // 🚀 FIX: Clean localStorage more selectively
      if (typeof window !== 'undefined') {
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.startsWith('supabase.') || 
          key.includes('koouk') ||
          key.includes('auth')
        )
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      console.log('✅ Sign out completed')
      
    } catch (error) {
      console.error('Sign out error:', error)
      // UI is already updated, so this is just cleanup
    }
  }, [handleSetUser, handleSetLoading])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}