'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, getTranslation } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof import('@/lib/translations').translations.ko) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ko')

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('koouk_language') as Language
    if (savedLanguage && ['ko', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('en')) {
        setLanguage('en')
      }
    }
  }, [])

  // Save language preference
  useEffect(() => {
    localStorage.setItem('koouk_language', language)
    // Update document language
    document.documentElement.lang = language
  }, [language])

  const t = (key: keyof typeof import('@/lib/translations').translations.ko) => {
    return getTranslation(key, language)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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