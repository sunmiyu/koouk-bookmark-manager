'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
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

  // 사용자 데이터 로드 함수
  const loadUserData = async (authUser: User) => {
    try {
      // 1. 사용자 프로필 확인/생성
      let profile: UserProfile
      try {
        profile = await DatabaseService.getUserProfile(authUser.id)
      } catch {
        // 프로필이 없으면 생성
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
        
        if (error) throw error
        profile = data
      }
      setUserProfile(profile)

      // GA4 사용자 정보 설정
      setUserId(authUser.id)
      setUserProperties({
        user_type: profile ? 'registered' : 'new_user',
        provider: 'google',
        created_at: profile?.created_at ? new Date(profile.created_at).toISOString() : new Date().toISOString()
      })

      // 2. 사용자 설정 확인/생성
      let settings: UserSettings
      try {
        settings = await DatabaseService.getUserSettings(authUser.id)
      } catch {
        settings = await DatabaseService.createUserSettings(authUser.id)
      }
      setUserSettings(settings)

      // 3. 데이터 마이그레이션 체크 및 실행 (필요한 경우만)
      setTimeout(async () => {
        try {
          const migrationStatus = await DataMigration.checkMigrationStatus()
          if (!migrationStatus.migrated) {
            console.log('🔄 Starting background data migration...')
            const migrationResult = await DataMigration.migrateAllData()
            if (migrationResult.success) {
              console.log('✅ Background migration completed successfully')
              await DataMigration.cleanupLocalStorage()
            } else {
              console.error('❌ Background migration failed:', migrationResult.error)
            }
          }
        } catch (error) {
          console.error('Background migration error:', error)
        }
      }, 2000) // 2초 후에 실행

    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...')
        const startTime = performance.now()
        
        // 빠른 세션 체크를 위해 타임아웃 설정
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise(resolve => 
          setTimeout(() => resolve({ data: { session: null }, error: new Error('Timeout') }), 2000)
        )
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
        const authUser = session?.user ?? null
        setUser(authUser)
        
        console.log(`⚡ Auth check completed in ${Math.round(performance.now() - startTime)}ms`)
        
        if (authUser) {
          console.log('👤 User found, setting up minimal state...')
          
          // 즉시 기본 사용자 정보만 설정 (UI 표시용)
          setUser(authUser)
          setLoading(false)
          
          // 나머지는 백그라운드에서 천천히 로드
          setTimeout(() => {
            loadUserData(authUser).catch(console.error)
          }, 100)
        } else {
          console.log('🚫 No user, skipping data load')
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authUser = session?.user ?? null
        setUser(authUser)
        
        if (authUser) {
          await loadUserData(authUser)
        } else {
          // 로그아웃 시 상태 클리어
          setUserProfile(null)
          setUserSettings(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    try {
      setLoading(true)
      console.log('🔐 Starting Google OAuth flow...')
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('OAuth initiation error:', error)
        throw error
      }
      
      console.log('🔐 OAuth redirect initiated successfully')
      
      // GA4 로그인 시작 추적
      analytics.login('google')
      
      // OAuth 리디렉션이 시작되면 로딩 상태를 유지하지 않음
      // (페이지가 이동하기 때문)
      
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false) // 에러가 있을 때만 로딩 해제
      
      // 사용자에게 에러 알림
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
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
      }
      
      // Always clear user state regardless of Supabase response
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)
      
      // GA4 로그아웃 추적
      analytics.logout()
      
      // Clear auth-related localStorage items
      if (typeof window !== 'undefined') {
        localStorage.removeItem('koouk-auth-token')
        // Clear all possible auth keys
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth-token')) {
            localStorage.removeItem(key)
          }
        })
      }
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if error occurs, clear user state
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)
    } finally {
      setLoading(false)
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