'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database'
import { FastAuth } from '@/lib/fastAuth'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { analytics, setUserId, setUserProperties } from '@/lib/analytics'

type UserProfile = Database['public']['Tables']['users']['Row']
type UserSettings = Database['public']['Tables']['user_settings']['Row']

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  userSettings: UserSettings | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  updateUserSettings: (updates: Partial<UserSettings>) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'authenticated' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  
  // Load user profile and settings
  const loadUserProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      // 🚀 OPTIMIZATION 1: Parallel database queries to reduce loading time by 200-400ms
      const [profileResult, settingsResult] = await Promise.allSettled([
        DatabaseService.getUserProfile(userId),
        DatabaseService.getUserSettings(userId)
      ])
      
      let profile: UserProfile | null = null
      
      // Handle profile result
      if (profileResult.status === 'fulfilled') {
        profile = profileResult.value as UserProfile | null
      } else {
        console.warn('Failed to load user profile:', profileResult.reason)
      }
      
      // If profile doesn't exist, create it
      if (!profile) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          const { data, error } = await supabase
            .from('users')
            .upsert({
              id: authUser.id,
              email: authUser.email!,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
              avatar_url: authUser.user_metadata?.avatar_url,
              is_verified: !!authUser.email_confirmed_at,
              user_plan: 'free' as const,
              plan_expires_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()
          
          if (!error && data) {
            profile = data as UserProfile
          }
        }
      }
      
      // 🚀 OPTIMIZATION 2: Set profile immediately for faster UI response
      setUserProfile(profile)
      
      if (profile) {
        setUserId(userId)
        setUserProperties({
          user_type: 'registered',
          provider: 'google',
          created_at: profile.created_at
        })
      }

      // Handle settings result (non-blocking)
      if (settingsResult.status === 'fulfilled') {
        setUserSettings(settingsResult.value)
      } else {
        console.warn('Could not load user settings (non-critical):', settingsResult.reason)
        // Set default settings to prevent loading state
        setUserSettings({
          id: userId,
          user_id: userId,
          last_active_tab: 'dashboard',
          selected_folder_id: null,
          view_mode: 'grid',
          sort_by: 'recent',
          theme: 'light',
          language: 'en',
          pwa_install_dismissed_at: null,
          visit_count: 0,
          cross_platform_state: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      
    } catch (error) {
      console.error('Error loading user profile:', error)
      throw error
    }
  }, [])

  // Initialize auth state
  const initializeAuth = useCallback(async (): Promise<void> => {
    try {
      setStatus('loading')
      setError(null)
      
      console.log('🔄 Initializing auth state...')
      
      // Clear any stale cache first
      if (typeof window !== 'undefined') {
        const cachedSession = localStorage.getItem('koouk-session-cache')
        if (cachedSession) {
          try {
            const { expiresAt } = JSON.parse(cachedSession)
            if (expiresAt < Date.now()) {
              console.log('🗑️ Clearing expired session cache')
              localStorage.removeItem('koouk-session-cache')
            }
          } catch {
            localStorage.removeItem('koouk-session-cache')
          }
        }
      }
      
      // Get current session with timeout
      console.log('🔍 Checking current session...')
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 10000)
      )
      
      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any
      
      if (sessionError) {
        console.error('Auth session error:', sessionError)
        
        // Handle specific error cases
        if (sessionError.message.includes('refresh_token') || 
            sessionError.message.includes('invalid_grant') ||
            sessionError.message.includes('token') ||
            sessionError.message.includes('authorization')) {
          console.log('🧹 Clearing invalid session...')
          await supabase.auth.signOut()
          localStorage.removeItem('koouk-session-cache')
          setStatus('idle')
          return
        }
        
        throw sessionError
      }
      
      if (session?.user) {
        console.log('✅ Valid session found, loading user data...')
        setUser(session.user)
        
        try {
          await loadUserProfile(session.user.id)
          setStatus('authenticated')
          
          // Cache valid session
          if (typeof window !== 'undefined' && session.expires_at) {
            const cacheData = {
              user: session.user,
              expiresAt: session.expires_at * 1000
            }
            localStorage.setItem('koouk-session-cache', JSON.stringify(cacheData))
          }
          
          console.log('✅ Authentication initialization complete')
        } catch (profileError) {
          console.error('Failed to load user profile:', profileError)
          // Continue with authentication even if profile loading fails
          setStatus('authenticated')
        }
      } else {
        console.log('ℹ️ No active session found')
        setStatus('idle')
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      
      // Clear any stored session data on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('koouk-session-cache')
      }
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          setError('Connection timeout. Please check your internet connection.')
        } else if (error.message.includes('authorization') || error.message.includes('token')) {
          setError('Session expired. Please sign in again.')
          setStatus('idle')
          return
        } else {
          setError(error.message)
        }
      } else {
        setError('Failed to initialize authentication')
      }
      
      setStatus('error')
      
      // Auto-recover from error after 3 seconds
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          setStatus('idle')
          setError(null)
        }
      }, 3000)
    }
  }, [loadUserProfile])

  // Auth state change handler
  useEffect(() => {
    let mounted = true
    
    const initialize = async () => {
      if (!mounted) return
      await initializeAuth()
    }
    
    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('Auth state change:', event)
        setError(null)
        
        try {
          switch (event) {
            case 'SIGNED_IN':
              if (session?.user && mounted) {
                setUser(session.user)
                await loadUserProfile(session.user.id)
                setStatus('authenticated')
              }
              break
              
            case 'SIGNED_OUT':
              if (mounted) {
                setUser(null)
                setUserProfile(null)
                setUserSettings(null)
                setStatus('idle')
              }
              break
              
            case 'TOKEN_REFRESHED':
              if (session?.user && mounted) {
                setUser(session.user)
                setStatus('authenticated')
              }
              break
              
            default:
              if (!session?.user && mounted) {
                setStatus('idle')
              }
          }
        } catch (error) {
          if (mounted) {
            console.error('Auth state change error:', error)
            setError(error instanceof Error ? error.message : 'Authentication error occurred')
            setStatus('error')
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [initializeAuth, loadUserProfile])

  // Sign in with Google - Fast popup first, redirect fallback
  const signIn = useCallback(async (): Promise<void> => {
    try {
      setStatus('loading')
      setError(null)
      
      console.log('🚀 Starting fast popup OAuth authentication')
      
      // 🚀 PRIMARY: Fast popup OAuth (400-800ms target)
      if (typeof window !== 'undefined' && FastAuth.isPopupSupported()) {
        try {
          const result = await FastAuth.signInWithPopup({ provider: 'google' })
          
          if (result.success && result.user) {
            console.log('✅ Fast popup authentication successful')
            setUser(result.user)
            await loadUserProfile(result.user.id)
            setStatus('authenticated')
            analytics.login('google')
            return
          } else {
            console.warn('Popup auth failed, falling back to redirect:', result.error)
          }
        } catch (popupError) {
          console.warn('Popup authentication failed, falling back to redirect:', popupError)
        }
      }
      
      // 🔄 FALLBACK: Redirect flow for popup-blocked environments
      console.log('🔄 Using redirect OAuth fallback')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      })
      
      if (error) {
        console.error('OAuth error:', error)
        throw error
      }
      
      analytics.login('google')
      
    } catch (error) {
      console.error('Sign in error:', error)
      setError('Sign in failed. Please try again.')
      setStatus('error')
      throw error
    }
  }, [loadUserProfile])

  // Sign out - 즉시 UI 업데이트, 백그라운드 정리
  const signOut = useCallback(async (): Promise<void> => {
    // 🚀 OPTIMIZATION 12: Immediate UI state clear for instant response
    setUser(null)
    setUserProfile(null)
    setUserSettings(null)
    setStatus('idle')
    setError(null)
    
    try {
      // 🚀 OPTIMIZATION 13: Clear session cache immediately
      if (typeof window !== 'undefined') {
        localStorage.removeItem('koouk-session-cache')
        
        // Clear all auth-related storage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('koouk-auth')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      // Background cleanup (non-blocking)
      await supabase.auth.signOut()
      analytics.logout()
      
    } catch (error) {
      console.error('Sign out cleanup error:', error)
      // Error doesn't affect UI since state is already cleared
    }
  }, [])

  // Update user settings
  const updateUserSettings = useCallback(async (updates: Partial<UserSettings>): Promise<void> => {
    if (!user || !userSettings) return
    
    try {
      const updatedSettings = await DatabaseService.updateUserSettings(user.id, updates)
      setUserSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to update user settings:', error)
      throw error
    }
  }, [user, userSettings])

  // Refresh user data
  const refreshUserData = useCallback(async (): Promise<void> => {
    if (!user) return
    
    try {
      await loadUserProfile(user.id)
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      throw error
    }
  }, [user, loadUserProfile])

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      userSettings, 
      status,
      error,
      signIn, 
      signOut, 
      updateUserSettings, 
      refreshUserData 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Legacy loading 호환성
export function useAuthCompat(): AuthContextType & { loading: boolean } {
  const auth = useAuth()
  return {
    ...auth,
    loading: auth.status === 'loading'
  }
}

export type { UserProfile, UserSettings }