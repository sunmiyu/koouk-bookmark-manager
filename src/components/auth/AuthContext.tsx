'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { analytics, setUserId, setUserProperties } from '@/lib/analytics'

type UserProfile = Database['public']['Tables']['users']['Row']
type UserSettings = Database['public']['Tables']['user_settings']['Row']

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  userSettings: UserSettings | null
  loading: boolean
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Load user profile and settings
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      // Load or create user profile
      let profile: UserProfile | null = (await DatabaseService.getUserProfile(userId)) as UserProfile | null
      
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
      
      setUserProfile(profile)
      
      // Load user settings
      try {
        const settings = await DatabaseService.getUserSettings(userId)
        setUserSettings(settings)
      } catch (settingsError) {
        console.warn('Could not load user settings:', settingsError)
      }

      // Set analytics user
      if (profile) {
        setUserId(userId)
        setUserProperties({
          user_type: 'registered',
          provider: 'google',
          created_at: profile.created_at
        })
      }
      
    } catch (error) {
      console.error('Error loading user profile:', error)
      setError('Failed to load user profile')
    }
  }, [])

  // Authentication state management
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Auth session error:', sessionError)
        if (sessionError.message.includes('refresh_token')) {
          await supabase.auth.signOut()
        }
        setError('Authentication session expired')
        return
      }
      
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setError('Failed to initialize authentication')
    } finally {
      setLoading(false)
    }
  }, [loadUserProfile])



  // Auth state change handler
  useEffect(() => {
    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event)
        
        setError(null)
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              setUser(session.user)
              await loadUserProfile(session.user.id)
              setLoading(false)
            }
            break
            
          case 'SIGNED_OUT':
            setUser(null)
            setUserProfile(null)
            setUserSettings(null)
            setLoading(false)
            break
            
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              setUser(session.user)
            }
            break
            
          default:
            setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [initializeAuth, loadUserProfile])

  // Sign in with Google
  const signIn = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
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
      
      if (error) throw error
      
      analytics.login('google')
      
    } catch (error) {
      console.error('Sign in error:', error)
      setError('Sign in failed. Please try again.')
      setLoading(false)
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear state immediately
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)
      
      await supabase.auth.signOut()
      
      // Clear storage
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('koouk-auth')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      analytics.logout()
      
    } catch (error) {
      console.error('Sign out error:', error)
      setError('Sign out failed')
    } finally {
      setLoading(false)
    }
  }, [])

  // Update user settings
  const updateUserSettings = useCallback(async (updates: Partial<UserSettings>) => {
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
  const refreshUserData = useCallback(async () => {
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
      loading, 
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

export type { UserProfile, UserSettings }