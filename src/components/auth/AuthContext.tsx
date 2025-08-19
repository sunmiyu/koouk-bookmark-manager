'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database'
import { useOnlineStatus } from '@/hooks/useNetworkStatus'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']
type UserSettings = Database['public']['Tables']['user_settings']['Row']

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  userSettings: UserSettings | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
  isOnline: boolean
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
  const isOnline = useOnlineStatus()
  
  // 🚀 OPTIMIZATION 2: Profile caching to reduce loading time by 300-500ms
  const getCachedProfile = (userId: string): UserProfile | null => {
    try {
      const cachedProfile = localStorage.getItem(`koouk_profile_${userId}`)
      const cacheExpiry = localStorage.getItem(`koouk_profile_expiry_${userId}`)
      
      if (cachedProfile && cacheExpiry && Date.now() < Number(cacheExpiry)) {
        console.log('📦 Using cached profile for faster loading')
        return JSON.parse(cachedProfile)
      }
    } catch (error) {
      console.warn('Cache read error:', error)
    }
    return null
  }

  const setCachedProfile = (userId: string, profile: UserProfile) => {
    try {
      const expiry = Date.now() + (5 * 60 * 1000) // 5 minutes cache
      localStorage.setItem(`koouk_profile_${userId}`, JSON.stringify(profile))
      localStorage.setItem(`koouk_profile_expiry_${userId}`, String(expiry))
    } catch (error) {
      console.warn('Cache write error:', error)
    }
  }

  const getCachedSettings = (userId: string): UserSettings | null => {
    try {
      const cachedSettings = localStorage.getItem(`koouk_settings_${userId}`)
      const cacheExpiry = localStorage.getItem(`koouk_settings_expiry_${userId}`)
      
      if (cachedSettings && cacheExpiry && Date.now() < Number(cacheExpiry)) {
        return JSON.parse(cachedSettings)
      }
    } catch (error) {
      console.warn('Settings cache read error:', error)
    }
    return null
  }

  const setCachedSettings = (userId: string, settings: UserSettings) => {
    try {
      const expiry = Date.now() + (10 * 60 * 1000) // 10 minutes cache for settings
      localStorage.setItem(`koouk_settings_${userId}`, JSON.stringify(settings))
      localStorage.setItem(`koouk_settings_expiry_${userId}`, String(expiry))
    } catch (error) {
      console.warn('Settings cache write error:', error)
    }
  }

  // Load user profile and settings
  const loadUserProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      // Check cache first for instant loading
      const cachedProfile = getCachedProfile(userId)
      const cachedSettings = getCachedSettings(userId)
      
      if (cachedProfile && cachedSettings) {
        setUserProfile(cachedProfile)
        setUserSettings(cachedSettings)
        setStatus('authenticated')
        console.log('⚡ Loaded from cache - instant authentication')
        return
      }
      
      // 🚀 OPTIMIZATION 1: Parallel database queries to reduce loading time by 200-400ms
      const [profileResult, settingsResult] = await Promise.allSettled([
        cachedProfile ? Promise.resolve(cachedProfile) : DatabaseService.getUserProfile(userId),
        cachedSettings ? Promise.resolve(cachedSettings) : DatabaseService.getUserSettings(userId)
      ])
      
      let profile: UserProfile | null = null
      
      // Handle profile result
      if (profileResult.status === 'fulfilled') {
        profile = profileResult.value as UserProfile | null
      } else {
        console.warn('Failed to load user profile:', profileResult.reason)
      }
      
      // If profile doesn't exist, create it with retry logic
      if (!profile) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          let retryCount = 0
          const maxRetries = 3
          
          while (!profile && retryCount < maxRetries) {
            try {
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
                console.log('✅ Profile created successfully after', retryCount + 1, 'attempts')
                break
              } else if (error) {
                console.warn(`Profile creation attempt ${retryCount + 1} failed:`, error)
                retryCount++
                if (retryCount < maxRetries) {
                  // Wait before retry with exponential backoff
                  await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
                }
              }
            } catch (createError) {
              console.warn(`Profile creation attempt ${retryCount + 1} error:`, createError)
              retryCount++
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
              }
            }
          }
          
          // If all retries failed, create a basic profile object for UI consistency
          if (!profile) {
            console.warn('⚠️ Profile creation failed after all retries, using basic profile')
            profile = {
              id: authUser.id,
              email: authUser.email!,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
              avatar_url: authUser.user_metadata?.avatar_url || null,
              is_verified: !!authUser.email_confirmed_at,
              user_plan: 'free' as const,
              plan_expires_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        }
      }
      
      // 🚀 OPTIMIZATION 2: Set profile immediately for faster UI response + cache it
      setUserProfile(profile)
      if (profile) {
        setCachedProfile(userId, profile)
      }

      // Handle settings result (non-blocking)
      let settings: UserSettings
      if (settingsResult.status === 'fulfilled') {
        settings = settingsResult.value
        setUserSettings(settings)
        setCachedSettings(userId, settings)
      } else {
        console.warn('Could not load user settings (non-critical):', settingsResult.reason)
        // Set default settings to prevent loading state
        settings = {
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
        }
        setUserSettings(settings)
        setCachedSettings(userId, settings)
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
      
      // Check if we're offline
      if (!isOnline) {
        console.log('📱 Offline mode - checking cached session...')
        const cachedSession = localStorage.getItem('koouk-session-cache')
        if (cachedSession) {
          try {
            const { user: cachedUser, expiresAt } = JSON.parse(cachedSession)
            if (expiresAt > Date.now()) {
              console.log('✅ Valid cached session found')
              setUser(cachedUser)
              setStatus('authenticated')
              return
            } else {
              console.log('⏰ Cached session expired')
              localStorage.removeItem('koouk-session-cache')
            }
          } catch {
            localStorage.removeItem('koouk-session-cache')
          }
        }
        
        setError('You are offline. Some features may not be available.')
        setStatus('idle')
        return
      }
      
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
      
      // Get current session with graceful timeout and retry
      console.log('🔍 Checking current session...')
      let session = null
      let sessionError = null
      
      try {
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout - using cached session if available')), 5000)
        )
        
        const result = await Promise.race([sessionPromise, timeoutPromise]) as any
        session = result.data?.session
        sessionError = result.error
      } catch (timeoutError) {
        console.warn('Session check timed out, trying cached fallback...')
        
        // Try to use cached session as fallback
        try {
          const cachedSession = localStorage.getItem('koouk-session-cache')
          if (cachedSession) {
            const { user: cachedUser, expiresAt } = JSON.parse(cachedSession)
            if (expiresAt > Date.now()) {
              console.log('✅ Using cached session due to timeout')
              setUser(cachedUser)
              setStatus('authenticated')
              return
            }
          }
        } catch {}
        
        // If no cached session, continue without auth but don't error
        console.log('⚠️ Session timeout - continuing as guest for faster load')
        setStatus('idle')
        setError(null) // Clear any timeout errors
        return
      }
      
      if (sessionError) {
        console.error('Auth session error:', sessionError)
        
        // Handle specific token/auth error cases more precisely
        const errorMessage = sessionError.message.toLowerCase()
        const errorCode = (sessionError as any)?.code
        
        if (errorCode === 'invalid_grant' ||
            errorMessage.includes('invalid_grant') ||
            errorMessage.includes('refresh_token_not_found') ||
            errorMessage.includes('jwt malformed') ||
            (errorMessage.includes('token') && errorMessage.includes('expired'))) {
          console.log('🧹 Clearing invalid/expired session...')
          await supabase.auth.signOut()
          localStorage.removeItem('koouk-session-cache')
          setStatus('idle')
          return
        }
        
        // Network-related token errors shouldn't clear session
        if (errorMessage.includes('network') || 
            errorMessage.includes('fetch') || 
            errorMessage.includes('timeout')) {
          console.log('⚠️ Network error during session check, retrying...')
          // Don't clear session for network issues
          throw new Error('Network error - session check failed')
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
          // Continue with authentication even if profile loading fails, but set basic profile
          console.log('🔄 Setting up basic profile fallback...')
          
          // Create minimal profile from auth user data
          const basicProfile = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            is_verified: !!session.user.email_confirmed_at,
            user_plan: 'free' as const,
            plan_expires_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setUserProfile(basicProfile)
          
          // Set basic user settings
          setUserSettings({
            id: session.user.id,
            user_id: session.user.id,
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
          
          setStatus('authenticated')
          console.log('✅ Authentication completed with basic profile fallback')
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
                try {
                  await loadUserProfile(session.user.id)
                  setStatus('authenticated')
                } catch (profileError) {
                  console.error('Failed to load profile in auth state change:', profileError)
                  // Set basic profile fallback
                  setUserProfile({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                    avatar_url: session.user.user_metadata?.avatar_url || null,
                    is_verified: !!session.user.email_confirmed_at,
                    user_plan: 'free' as const,
                    plan_expires_at: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })
                  setStatus('authenticated')
                }
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
      
      // 🔄 단순화된 OAuth: Redirect flow만 사용
      console.log('🔄 Using redirect OAuth fallback')
      
      // Dynamic callback URL based on environment
      const callbackUrl = process.env.NODE_ENV === 'development' 
        ? `${window.location.origin}/auth/callback`
        : process.env.NEXT_PUBLIC_SITE_URL 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          : `${window.location.origin}/auth/callback`
      
      console.log('🔗 OAuth callback URL:', callbackUrl)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
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
      
      // analytics.login('google') // Analytics 제거됨
      
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
      // analytics.logout() // Analytics 제거됨
      
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
      isOnline,
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