'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database'
import { analytics, setUserId, setUserProperties } from '@/lib/analytics'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']
type UserSettings = Database['public']['Tables']['user_settings']['Row']

interface OptimisticAuthState {
  user: User | null
  userProfile: UserProfile | null
  userSettings: UserSettings | null
  loading: boolean
  isOptimistic: boolean // 낙관적 상태인지 여부
}

const STORAGE_KEY = 'koouk-last-auth-state'

// Netflix 스타일: localStorage에서 마지막 상태를 즉시 가져옴
const getOptimisticState = (): Partial<OptimisticAuthState> => {
  if (typeof window === 'undefined') return { loading: true }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { loading: false, user: null }
    
    const parsed = JSON.parse(stored)
    const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000 // 24시간
    
    if (isRecent && parsed.user) {
      console.log('🎬 Netflix-style: Using optimistic auth state')
      return {
        user: parsed.user,
        userProfile: parsed.userProfile,
        userSettings: parsed.userSettings,
        loading: false,
        isOptimistic: true
      }
    }
  } catch (error) {
    console.warn('Failed to load optimistic auth state:', error)
  }
  
  return { loading: false, user: null }
}

// 상태를 localStorage에 저장
const saveAuthState = (state: Partial<OptimisticAuthState>) => {
  if (typeof window === 'undefined') return
  
  try {
    const toSave = {
      user: state.user,
      userProfile: state.userProfile,
      userSettings: state.userSettings,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (error) {
    console.warn('Failed to save auth state:', error)
  }
}

export function useOptimisticAuth() {
  // 🎬 Netflix Debug
  console.log('🎬 useOptimisticAuth hook called')
  
  // 1단계: 즉시 낙관적 상태로 시작 (Netflix처럼)
  const [state, setState] = useState<OptimisticAuthState>(() => {
    const initialState = {
      user: null,
      userProfile: null,
      userSettings: null,
      loading: true,
      isOptimistic: false,
      ...getOptimisticState()
    }
    console.log('🎬 Initial Netflix Auth State:', initialState)
    return initialState
  })

  // 사용자 데이터 로드
  const loadUserData = useCallback(async (authUser: User) => {
    try {
      // GA4 설정
      setUserId(authUser.id)
      
      // 프로필 확인/생성
      let profile: UserProfile
      try {
        profile = await DatabaseService.getUserProfile(authUser.id)
      } catch {
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

      setUserProperties({
        user_type: profile ? 'registered' : 'new_user',
        provider: 'google',
        created_at: profile?.created_at ? new Date(profile.created_at).toISOString() : new Date().toISOString()
      })

      // 설정 확인/생성
      let settings: UserSettings
      try {
        settings = await DatabaseService.getUserSettings(authUser.id)
      } catch {
        settings = await DatabaseService.createUserSettings(authUser.id)
      }

      // 최종 상태 업데이트
      const finalState = {
        user: authUser,
        userProfile: profile,
        userSettings: settings,
        loading: false,
        isOptimistic: false
      }
      
      setState(finalState)
      saveAuthState(finalState)
      
      console.log('✅ Netflix-style: Real auth state confirmed')
      
    } catch (error) {
      console.error('Failed to load user data:', error)
      setState(prev => ({ ...prev, loading: false, isOptimistic: false }))
    }
  }, [])

  // 🎬 Netflix + 개선된 Gmail 로그인
  const signIn = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      console.log('🎬 Starting Google sign in...')
      
      // 현재 도메인 확인
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('🎬 Redirect URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account' // 계정 선택 강제
          },
          scopes: 'email profile',
          // PKCE 플로우 사용 (더 안전)
          skipBrowserRedirect: false
        }
      })

      if (error) {
        console.error('🎬 OAuth initiation error:', error)
        alert(`로그인 시작 실패: ${error.message}`)
        setState(prev => ({ ...prev, loading: false }))
        return
      }
      
      console.log('🎬 OAuth initiation successful:', data)
      analytics.login('google')
      
    } catch (error) {
      console.error('🎬 Sign in error:', error)
      setState(prev => ({ ...prev, loading: false }))
      alert('로그인 중 오류가 발생했습니다')
    }
  }, [])

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      await supabase.auth.signOut()
      
      // 상태 클리어
      const clearedState = {
        user: null,
        userProfile: null,
        userSettings: null,
        loading: false,
        isOptimistic: false
      }
      
      setState(clearedState)
      saveAuthState(clearedState)
      
      analytics.logout()
      
      // 로컬스토리지 클리어
      localStorage.removeItem('koouk-auth-token')
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth-token')) {
          localStorage.removeItem(key)
        }
      })
      
    } catch (error) {
      console.error('Sign out error:', error)
      // 에러가 있어도 클리어
      setState({
        user: null,
        userProfile: null,
        userSettings: null,
        loading: false,
        isOptimistic: false
      })
    }
  }, [])

  // 2단계: 백그라운드에서 실제 인증 상태 확인 (Netflix처럼)
  useEffect(() => {
    let mounted = true

    const verifyAuthState = async () => {
      try {
        console.log('🔍 Netflix-style: Verifying auth state in background...')
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        const authUser = session?.user ?? null
        
        if (authUser && state.user?.id !== authUser.id) {
          // 새로운 사용자 또는 다른 사용자
          await loadUserData(authUser)
        } else if (!authUser && state.user) {
          // 로그아웃된 상태
          const clearedState = {
            user: null,
            userProfile: null,
            userSettings: null,
            loading: false,
            isOptimistic: false
          }
          setState(clearedState)
          saveAuthState(clearedState)
          console.log('🔍 Netflix-style: Auth state cleared')
        } else if (state.isOptimistic) {
          // 낙관적 상태였는데 실제로도 맞음
          setState(prev => ({ ...prev, isOptimistic: false }))
          console.log('🎯 Netflix-style: Optimistic state was correct!')
        }
        
      } catch (error) {
        console.error('Auth verification failed:', error)
        if (mounted) {
          setState(prev => ({ ...prev, loading: false, isOptimistic: false }))
        }
      }
    }

    // 즉시 확인하지 않고 조금 기다림 (UI가 먼저 표시되도록)
    const timer = setTimeout(verifyAuthState, 100)

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        const authUser = session?.user ?? null
        
        if (authUser) {
          await loadUserData(authUser)
        } else {
          const clearedState = {
            user: null,
            userProfile: null,
            userSettings: null,
            loading: false,
            isOptimistic: false
          }
          setState(clearedState)
          saveAuthState(clearedState)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [loadUserData, state.user?.id, state.isOptimistic])

  // 설정 업데이트
  const updateUserSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!state.user || !state.userSettings) return
    
    try {
      const updatedSettings = await DatabaseService.updateUserSettings(state.user.id, updates)
      setState(prev => ({ ...prev, userSettings: updatedSettings }))
      saveAuthState({ ...state, userSettings: updatedSettings })
    } catch (error) {
      console.error('Failed to update user settings:', error)
      throw error
    }
  }, [state.user, state.userSettings, state])

  return {
    ...state,
    signIn,
    signOut,
    updateUserSettings,
    refreshUserData: useCallback(() => {
      if (state.user) {
        return loadUserData(state.user)
      }
    }, [state.user, loadUserData])
  }
}