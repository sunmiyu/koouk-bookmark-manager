'use client'

import { useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('koouk_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('koouk_user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    // 실제 구현에서는 API 호출
    // 지금은 데모용으로 간단한 로직
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 로딩 시뮬레이션
      
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=2563eb&color=ffffff`
      }
      
      localStorage.setItem('koouk_user', JSON.stringify(mockUser))
      setUser(mockUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 로딩 시뮬레이션
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        avatar: `https://ui-avatars.com/api/?name=${name}&background=2563eb&color=ffffff`
      }
      
      localStorage.setItem('koouk_user', JSON.stringify(mockUser))
      setUser(mockUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Signup failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('koouk_user')
    setUser(null)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout
  }
}