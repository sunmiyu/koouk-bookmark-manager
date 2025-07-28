'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
      title={`Switch to ${language === 'ko' ? 'English' : '한국어'}`}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span className="font-mono text-xs">
        {language === 'ko' ? 'EN' : '한'}
      </span>
    </button>
  )
}