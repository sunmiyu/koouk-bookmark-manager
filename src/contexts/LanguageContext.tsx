'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, translations, getTranslation } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof translations.ko, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ko')

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'ko' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('ko')) {
        setLanguage('ko')
      } else {
        setLanguage('en')
      }
    }
  }, [])

  // Save language preference to localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    
    // Update HTML lang attribute
    document.documentElement.lang = lang
  }

  // Translation function with parameter interpolation
  const t = (key: keyof typeof translations.ko, params?: Record<string, string | number>): string => {
    let translation = getTranslation(key, language)
    
    // Replace parameters in the translation
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, String(value))
      })
    }
    
    return translation
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Helper function for formatting dates with current language
export function formatDateWithLanguage(date: Date | string, language: Language): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (language === 'ko') {
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } else {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

// Helper function for formatting time with current language
export function formatTimeWithLanguage(date: Date | string, language: Language): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (language === 'ko') {
    return dateObj.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// Helper function for relative time formatting
export function formatRelativeTime(date: Date | string, language: Language): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60)
  
  if (language === 'ko') {
    if (diffInHours < 1) {
      return '방금 전'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}일 전`
    } else {
      return formatDateWithLanguage(dateObj, language)
    }
  } else {
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) !== 1 ? 's' : ''} ago`
    } else {
      return formatDateWithLanguage(dateObj, language)
    }
  }
}