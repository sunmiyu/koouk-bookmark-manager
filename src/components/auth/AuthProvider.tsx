'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
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
  
  // 🚀 React Strict Mode 대응 중복 실행 방지
  const initializingRef = useRef(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    // 이미 초기화 중이거나 mount되었으면 스킵
    if (initializingRef.current) return
    
    initializingRef.current = true
    mountedRef.current = true

    console.log('🔄 Simple Auth 초기화 시작...')

    // 현재 세션 확인
    const initSession = async () => {
      try {
        // unmount 체크
        if (!mountedRef.current) return
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('세션 확인 에러 (무시):', error)
        }
        
        console.log('초기 세션:', session ? '✅ 로그인됨' : '❌ 로그인 안됨')
        
        // unmount된 후면 상태 업데이트 하지 않음
        if (mountedRef.current) {
          setUser(session?.user ?? null)
        }
        
      } catch (error) {
        console.warn('세션 초기화 실패:', error)
        if (mountedRef.current) {
          setUser(null)
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
        initializingRef.current = false
      }
    }

    initSession()

    // Auth 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Simple Auth state changed:', event)
        
        // unmount된 후면 상태 업데이트 하지 않음
        if (!mountedRef.current) return
        
        // 특정 이벤트만 처리
        switch (event) {
          case 'SIGNED_IN':
            setUser(session?.user ?? null)
            setLoading(false)
            console.log('✅ 로그인 완료')
            break
            
          case 'SIGNED_OUT':
            setUser(null)
            setLoading(false)
            console.log('✅ 로그아웃 완료')
            break
            
          case 'TOKEN_REFRESHED':
            setUser(session?.user ?? null)
            console.log('🔄 토큰 갱신 완료')
            break
            
          default:
            // 다른 이벤트는 무시
            break
        }
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  // 로그인 - 단순화된 버전
  const signIn = async () => {
    try {
      setLoading(true)
      console.log('🚀 Simple OAuth 로그인 시작...')
      
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
            prompt: 'select_account',
          }
        }
      })
      
      if (error) {
        console.error('OAuth 에러:', error)
        throw error
      }
      
      console.log('🔄 OAuth redirect 시작됨')
      
    } catch (error) {
      console.error('로그인 실패:', error)
      setLoading(false)
      throw error
    }
  }

  // 로그아웃 - 단순화된 버전
  const signOut = async () => {
    try {
      console.log('🚀 Simple 로그아웃 시작...')
      
      // 즉시 UI 업데이트
      setUser(null)
      setLoading(false)
      
      // 백그라운드에서 실제 로그아웃
      await supabase.auth.signOut()
      
      // 캐시 정리
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('koouk')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      console.log('✅ 로그아웃 완료')
      
    } catch (error) {
      console.error('로그아웃 에러:', error)
      // 에러가 있어도 UI는 이미 업데이트됨
    }
  }

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