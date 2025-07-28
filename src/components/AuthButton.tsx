'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AuthButton() {
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // TEMPORARY: Debug info for OAuth troubleshooting (client-side only)
  useEffect(() => {
    console.log('Auth Debug:', { status, session: !!session, url: window.location.href })
  }, [status, session])
  
  if (status === 'loading') {
    return (
      <div className="text-sm text-gray-400">
        {t('loading')}
      </div>
    )
  }

  if (session) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-16 py-1 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-all duration-200 h-[24px] flex items-center justify-center"
        >
          <span>{session.user?.name?.split(' ')[0] || 'User'}</span>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
            <div className="p-3 border-b border-gray-700">
              <div className="text-sm text-white font-medium">{session.user?.name}</div>
              <div className="text-xs text-gray-400">{session.user?.email}</div>
            </div>
            <div className="py-1">
              <a
                href="/settings/mini-functions"
                className="block w-full text-left px-3 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-700 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                Mini Functions
              </a>
              <a
                href="/account/delete"
                className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
{t('account_delete')}
              </a>
              <button
                onClick={() => {
                  signOut()
                  setIsDropdownOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
{t('logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-16 py-1 bg-gray-700 text-white text-sm font-medium rounded-full hover:bg-gray-600 transition-all duration-200 h-[24px] flex items-center justify-center"
      >
        <span>{t('login')}</span>
      </button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
          <button
            onClick={() => {
              signIn('google')
              setIsDropdownOpen(false)
            }}
            className="w-full text-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
{t('gmail_login')}
          </button>
        </div>
      )}
    </div>
  )
}