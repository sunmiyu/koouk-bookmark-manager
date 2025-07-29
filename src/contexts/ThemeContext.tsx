'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // 컴포넌트가 마운트된 후에 로컬스토리지에서 테마 불러오기
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('koouk-theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // 기본값은 다크모드
      setTheme('dark')
    }
  }, [])

  // 테마 변경시 DOM과 로컬스토리지 업데이트
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    localStorage.setItem('koouk-theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // 마운트 전에는 기본값으로 렌더링 (하이드레이션 에러 방지)
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}