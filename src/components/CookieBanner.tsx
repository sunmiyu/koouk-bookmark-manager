'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CookieBanner() {
  const { t } = useLanguage()
  const [showBanner, setShowBanner] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('koouk_cookie_consent')
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true)
        setTimeout(() => setIsVisible(true), 100) // Smooth animation
      }, 2000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('koouk_cookie_consent', 'accepted')
    localStorage.setItem('koouk_analytics_enabled', 'true')
    setIsVisible(false)
    setTimeout(() => setShowBanner(false), 300)
    
    // Enable analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  }

  const handleDecline = () => {
    localStorage.setItem('koouk_cookie_consent', 'declined')
    localStorage.setItem('koouk_analytics_enabled', 'false')
    setIsVisible(false)
    setTimeout(() => setShowBanner(false), 300)
    
    // Disable analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }

  if (!showBanner) return null

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="container mx-auto max-w-4xl">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Cookie icon and content */}
            <div className="flex items-start gap-3 flex-1">
              <div className="text-2xl">🍪</div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white text-sm sm:text-base">
                  {t('cookie_title')}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  {t('cookie_description')}
                </p>
                <div className="flex gap-4 text-xs">
                  <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                    {t('privacy_policy')}
                  </a>
                  <a href="/cookies" className="text-blue-400 hover:text-blue-300 underline">
                    {t('cookie_policy')}
                  </a>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
{t('essential_only')}
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {t('accept_all')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}