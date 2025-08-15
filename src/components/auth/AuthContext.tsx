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
  console.log('🎯 AuthProvider rendering... timestamp:', new Date().toISOString())
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  
  console.log('🎯 AuthProvider initial state - user:', user?.email, 'loading:', loading)

  // 사용자 데이터 로드 함수 - setTimeout 제거하고 즉시 실행
  const loadUserData = async (authUser: User) => {
    try {
      console.log('🔄 Loading user data for:', authUser.email)
      
      // 1. 사용자 프로필 확인/생성 (에러에 강함)
      let profile: UserProfile | null = null
      try {
        profile = await DatabaseService.getUserProfile(authUser.id)
        setUserProfile(profile)
        console.log('✅ Profile loaded successfully')
      } catch (profileError) {
        console.warn('⚠️ Profile load failed, trying to create:', profileError)
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
            console.log('✅ Profile created successfully')
          } else {
            console.error('❌ Profile creation failed:', error)
            // 프로필이 없어도 인증은 유지
          }
        } catch (createError) {
          console.error('❌ Profile creation error:', createError)
          // 프로필이 없어도 인증은 유지
        }
      }

      // GA4 사용자 정보 설정 (프로필이 없어도 설정)
      setUserId(authUser.id)
      setUserProperties({
        user_type: profile ? 'registered' : 'new_user',
        provider: 'google',
        created_at: profile?.created_at ? new Date(profile.created_at).toISOString() : new Date().toISOString()
      })

      // 2. 사용자 설정 확인/생성 (에러에 강함)
      try {
        const settings = await DatabaseService.getUserSettings(authUser.id)
        setUserSettings(settings)
        console.log('✅ Settings loaded successfully')
      } catch (settingsError) {
        console.warn('⚠️ Settings load failed:', settingsError)
        // 설정이 없어도 인증은 유지
      }

      // 3. 데이터 마이그레이션 체크 및 실행 (백그라운드에서 즉시 실행)
      DataMigration.checkMigrationStatus()
        .then(async (migrationStatus) => {
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
        })
        .catch(error => {
          console.error('Background migration error:', error)
        })

      console.log('✅ User data loading completed')
    } catch (error) {
      console.error('❌ Critical error in loadUserData:', error)
      // 치명적 에러가 있어도 사용자 인증 상태는 유지
    }
  }

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect starting...')
    
    // Initialize auth state - 단순화된 초기화
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...')
        const startTime = performance.now()
        
        // 세션 체크 - refresh token 에러 핸들링 추가
        console.log('🔍 Checking Supabase session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('🔍 Supabase session result - session:', !!session, 'user:', session?.user?.email, 'error:', error?.message)
        
        // Refresh token 에러 처리
        if (error && error.message.includes('Refresh Token')) {
          console.warn('🔄 Invalid refresh token, clearing auth state')
          await supabase.auth.signOut()
          setUser(null)
          setUserProfile(null)
          setUserSettings(null)
          setLoading(false)
          return
        }
        
        const authUser = session?.user ?? null
        
        console.log(`⚡ Auth check completed in ${Math.round(performance.now() - startTime)}ms`)
        
        if (authUser) {
          console.log('👤 User found, loading data...')
          setUser(authUser)
          
          // 즉시 사용자 데이터 로드 (setTimeout 제거)
          await loadUserData(authUser)
        } else {
          console.log('🚫 No user found')
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, 'User:', session?.user?.email)
        const authUser = session?.user ?? null
        setUser(authUser)
        
        // 사용자가 있으면 데이터 로드 (이벤트 타입에 관계없이)
        if (authUser) {
          console.log('✅ User detected, loading data...')
          await loadUserData(authUser)
        } else {
          console.log('❌ No user, clearing state...')
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
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}` 
            : 'https://www.koouk.im',
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
            include_granted_scopes: 'true'
          }
        }
      })
      
      if (error) {
        console.error('OAuth initiation error:', error)
        throw error
      }
      
      console.log('🔐 OAuth redirect initiated successfully')
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
      console.log('🔄 Starting sign out process...')
      
      // 상태를 먼저 클리어 (즉시 UI 반영)
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)
      
      // Supabase 로그아웃 - scope 명시적 지정  
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      
      // Google OAuth 세션도 완전히 정리하기 위한 추가 처리
      if (typeof window !== 'undefined') {
        // Google OAuth 관련 쿠키 정리
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      }
      if (error) {
        console.error('Supabase sign out error:', error)
        // 에러가 있어도 로컬 상태는 이미 클리어됨
      } else {
        console.log('✅ Successfully signed out from Supabase')
      }
      
      analytics.logout()
      
      // 완전한 브라우저 데이터 정리
      if (typeof window !== 'undefined') {
        try {
          // localStorage 정리
          localStorage.removeItem('koouk-auth-token')
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('auth-token')) {
              localStorage.removeItem(key)
            }
          })
          
          // sessionStorage 정리
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('auth-token')) {
              sessionStorage.removeItem(key)
            }
          })
          
          // Google OAuth iframe 정리 (숨겨진 Google 세션 방지)
          const iframes = document.querySelectorAll('iframe[src*="accounts.google.com"]')
          iframes.forEach(iframe => iframe.remove())
          
          console.log('✅ All browser storage and Google sessions cleared')
        } catch (storageError) {
          console.error('Storage clear error:', storageError)
        }
      }
      
    } catch (error) {
      console.error('Sign out error:', error)
      // 에러가 있어도 로컬 상태는 클리어
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)
    } finally {
      setLoading(false)
      console.log('🔄 Sign out process completed')
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