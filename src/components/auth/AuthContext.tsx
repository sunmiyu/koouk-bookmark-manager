'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database'
import { DataMigration } from '@/utils/dataMigration'
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
  
  const isLoadingUserData = useRef(false)
  const lastLoadedUserId = useRef<string | null>(null)

  const loadUserData = async (authUser: User) => {
    if (isLoadingUserData.current || lastLoadedUserId.current === authUser.id) {
      console.log('= Skipping duplicate loadUserData call for:', authUser.email)
      return
    }

    try {
      isLoadingUserData.current = true
      console.log('= Loading user data for:', authUser.email)
      
      let profile: UserProfile | null = null
      try {
        profile = await DatabaseService.getUserProfile(authUser.id)
        setUserProfile(profile)
        console.log(' Profile loaded successfully')
      } catch (profileError) {
        console.warn('  Profile load failed, trying to create:', profileError)
        try {
          const { data, error } = await supabase
            .from('users')
            .upsert({
              id: authUser.id,
              email: authUser.email!,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
              avatar_url: authUser.user_metadata?.avatar_url,
              is_verified: !!authUser.email_confirmed_at
            })
            .select()
            .single()
          
          if (!error && data) {
            profile = data
            setUserProfile(profile)
            console.log(' Profile created successfully')
          } else {
            console.error('L Profile creation failed:', error)
          }
        } catch (createError) {
          console.error('L Profile creation error:', createError)
        }
      }

      setUserId(authUser.id)
      setUserProperties({
        user_type: profile ? 'registered' : 'new_user',
        provider: 'google',
        created_at: profile?.created_at ? new Date(profile.created_at).toISOString() : new Date().toISOString()
      })

      try {
        const settings = await DatabaseService.getUserSettings(authUser.id)
        setUserSettings(settings)
        console.log(' Settings loaded successfully')
      } catch (settingsError) {
        console.warn('  Settings load failed:', settingsError)
      }

      DataMigration.checkMigrationStatus()
        .then(async (migrationStatus) => {
          if (!migrationStatus.migrated) {
            console.log('= Starting background data migration...')
            const migrationResult = await DataMigration.migrateAllData()
            if (migrationResult.success) {
              console.log(' Background migration completed successfully')
              await DataMigration.cleanupLocalStorage()
            } else {
              console.error('L Background migration failed:', migrationResult.error)
            }
          }
        })
        .catch(error => {
          console.error('Background migration error:', error)
        })

      lastLoadedUserId.current = authUser.id
      console.log(' User data loading completed')
    } catch (error) {
      console.error('L Critical error in loadUserData:', error)
    } finally {
      isLoadingUserData.current = false
    }
  }

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        console.log('= Initializing auth...')
        const startTime = performance.now()
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error && error.message.includes('Refresh Token')) {
          console.warn('= Invalid refresh token, clearing auth state')
          await supabase.auth.signOut()
          if (mounted) {
            setUser(null)
            setUserProfile(null)
            setUserSettings(null)
            setLoading(false)
          }
          return
        }
        
        const authUser = session?.user ?? null
        console.log(`¡ Auth check completed in ${Math.round(performance.now() - startTime)}ms`)
        
        if (mounted) {
          if (authUser) {
            console.log('=d User found, loading data...')
            setUser(authUser)
            await loadUserData(authUser)
          } else {
            console.log('=« No user found')
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('= Auth state changed:', event, 'User:', session?.user?.email)
        const authUser = session?.user ?? null
        
        if (event === 'SIGNED_IN' && authUser) {
          console.log(' User signed in, loading data...')
          setUser(authUser)
          await loadUserData(authUser)
        } else if (event === 'SIGNED_OUT' || !authUser) {
          console.log('L User signed out, clearing state...')
          setUser(null)
          setUserProfile(null)
          setUserSettings(null)
          lastLoadedUserId.current = null
        } else if (event === 'TOKEN_REFRESHED' && authUser) {
          console.log('= Token refreshed for:', authUser.email)
          setUser(authUser)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async () => {
    try {
      setLoading(true)
      console.log('= Starting Google OAuth flow...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      })
      
      if (error) {
        console.error('OAuth initiation error:', error)
        throw error
      }
      
      console.log('= OAuth redirect initiated successfully')
      analytics.login('google')
      
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
      
      if (error instanceof Error) {
        alert(`Login failed: ${error.message}. Please try again.`)
      } else {
        alert('Login failed. Please try again.')
      }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      console.log('= Starting sign out process...')
      
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)
      lastLoadedUserId.current = null
      isLoadingUserData.current = false
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Supabase sign out error:', error)
      } else {
        console.log(' Successfully signed out from Supabase')
      }
      
      analytics.logout()
      
      if (typeof window !== 'undefined') {
        try {
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('auth')) {
              localStorage.removeItem(key)
            }
          })
          
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('auth')) {
              sessionStorage.removeItem(key)
            }
          })
          
          console.log(' Browser storage cleared')
        } catch (storageError) {
          console.error('Storage clear error:', storageError)
        }
      }
      
    } catch (error) {
      console.error('Sign out error:', error)
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)
    } finally {
      setLoading(false)
      console.log('= Sign out process completed')
    }
  }

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !userSettings) return
    
    try {
      const updatedSettings = await DatabaseService.updateUserSettings(user.id, updates)
      setUserSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to update user settings:', error)
      throw error
    }
  }

  const refreshUserData = async () => {
    if (!user) return
    
    try {
      lastLoadedUserId.current = null
      await loadUserData(user)
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      userSettings, 
      loading, 
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