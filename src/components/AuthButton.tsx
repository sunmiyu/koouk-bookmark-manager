'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthButton() {
  const { t } = useLanguage()
  const { user, loading, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignIn = () => {
    // Close dropdown and let parent handle auth (will show landing page)
    setIsDropdownOpen(false)
  }

  const handleSignOut = async () => {
    signOut()
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
      <div className="relative z-10" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="transition-all duration-200 flex items-center justify-center cursor-pointer"
          style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--bg-card)',
            borderRadius: '50%',
            border: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333333'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--text-primary)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title={user.user_metadata?.full_name || user.email || 'User'}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </button>
        
        {isDropdownOpen && (
          <div 
            className="absolute right-0 mt-2 z-20"
            style={{
              width: '12rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-elevated)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div 
              className="p-3 text-center"
              style={{ 
                borderBottom: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <div style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--text-primary)', 
                fontWeight: '500' 
              }}>
                {user.user_metadata?.full_name || user.email}
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--text-secondary)' 
              }}>
                {user.email}
              </div>
            </div>
            <div className="py-1">
              <button
                onClick={handleSignOut}
                className="w-full text-center px-3 py-2 transition-colors cursor-pointer"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Logout
              </button>
              <a
                href="/account/delete"
                className="block w-full text-center px-3 py-2 transition-colors cursor-pointer"
                onClick={() => setIsDropdownOpen(false)}
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-muted)',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
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
    <div className="relative z-10" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="transition-all duration-200 flex items-center justify-center cursor-pointer"
        style={{
          width: '2rem',
          height: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          borderRadius: '50%',
          border: '1px solid var(--border-light)',
          fontSize: 'var(--text-xs)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--text-primary)'
          e.currentTarget.style.color = 'var(--bg-card)'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isDropdownOpen && (
        <div 
          className="absolute right-0 mt-2 z-20 overflow-hidden"
          style={{
            width: '20rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-elevated)',
            border: '1px solid var(--border-light)'
          }}
        >
          {/* Header */}
          <div 
            className="px-6 py-4 text-center"
            style={{ 
              borderBottom: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '500',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-1)',
              letterSpacing: '-0.01em'
            }}>
              Sign in to Koouk
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              fontWeight: '400'
            }}>
              Access your personal life hub
            </p>
          </div>
          
          {/* Login Content */}
          <div className="p-6">
            <button
              onClick={handleSignIn}
              className="w-full transition-all duration-200 flex items-center justify-center gap-3 group"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3) var(--space-4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-secondary)'
                e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span style={{
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500'
              }}>
                Continue with Google
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}