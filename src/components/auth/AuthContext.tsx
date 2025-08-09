'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types/core'
import { userStorage, initializeSampleData } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

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

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            avatar: session.user.user_metadata?.avatar_url,
            plan: 'free',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          setUser(userData)
          userStorage.set(userData)
          initializeSampleData(userData.id)
        } else {
          // Check local storage for user
          const localUser = userStorage.get()
          if (localUser) {
            setUser(localUser)
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            avatar: session.user.user_metadata?.avatar_url,
            plan: 'free',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          setUser(userData)
          userStorage.set(userData)
          initializeSampleData(userData.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          userStorage.clear()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    userStorage.clear()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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