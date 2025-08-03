'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Language } from '@/lib/translations'

interface LanguageSwitcherProps {
  className?: string
  compact?: boolean
}

export default function LanguageSwitcher({ className = '', compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ko', label: 'KR', flag: '🇰🇷' },
    { code: 'en', label: 'EN', flag: '🇺🇸' }
  ]

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  if (compact) {
    return (
      <div className={`relative inline-block ${className}`}>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
          className="appearance-none bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            language === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <span className="text-base">{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  )
}