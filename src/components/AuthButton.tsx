'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthButton() {
  const { t } = useLanguage()
  const { user, loading, signOut } = useAuth()
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

  const handleSignIn = async () => {
    try {
      // Use current origin for redirect
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('OAuth redirect URL:', redirectUrl)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('Error signing in:', error.message)
      }
    } catch (error) {
      console.error('Error signing in:', error)
    }
    setIsDropdownOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
  }
  
  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        {t('loading')}
      </div>
    )
  }

  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 flex items-center justify-center cursor-pointer"
          title={user.user_metadata?.full_name || user.email || 'User'}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
            <div className="p-3 border-b border-gray-700">
              <div className="text-sm text-white font-medium">{user.user_metadata?.full_name || user.email}</div>
              <div className="text-xs text-gray-400">{user.email}</div>
            </div>
            <div className="py-1">
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Logout
              </button>
              <a
                href="/account/delete"
                className="block w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setIsDropdownOpen(false)}
              >
                Delete Account
              </a>
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
        className="w-16 py-1 bg-gray-700 text-white text-sm font-medium rounded-full hover:bg-gray-600 transition-all duration-200 h-[24px] flex items-center justify-center cursor-pointer"
      >
        <span>{t('login')}</span>
      </button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
              Sign in to Koouk
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
              Access your personal life hub
            </p>
          </div>
          
          {/* Login Content */}
          <div className="p-6">
            <button
              onClick={handleSignIn}
              className="w-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg px-4 py-3 transition-all duration-200 flex items-center justify-center gap-3 group hover:shadow-md"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white">
                Continue with Google
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}