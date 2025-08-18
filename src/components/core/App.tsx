'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Settings, LogOut, MessageCircle } from 'lucide-react'
import { useAuthCompat } from '../auth/AuthContext'
import OnboardingPage from '../onboarding/OnboardingPage'
import DashboardPage from '../dashboard/DashboardPage'
import MyFolderContent from '../workspace/MyFolderContent'
import MarketPlace from '../workspace/MarketPlace'
import Bookmarks from '../workspace/Bookmarks'
import FeedbackModal from '../modals/FeedbackModal'
import SignoutModal from '../ui/SignoutModal'
import { useDevice } from '@/hooks/useDevice'
import { useRouter } from 'next/navigation'

type TabType = 'dashboard' | 'my-folder' | 'marketplace' | 'bookmarks'

export default function App() {
  const device = useDevice()
  const router = useRouter()
  const { user, signIn, signOut, error, status } = useAuthCompat()
  
  // Main app state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [searchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showSignoutModal, setShowSignoutModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Swipe gesture state for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 50

  // Tab navigation
  const handleTabChange = useCallback((tab: TabType) => {
    // Check if user needs to be logged in for protected tabs
    if (!user?.id && ['my-folder', 'marketplace', 'bookmarks'].includes(tab)) {
      setShowUserMenu(true)
      return
    }
    
    setActiveTab(tab)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('koouk-last-tab', tab)
    }
  }, [user?.id])

  // Authentication handlers
  const handleSignIn = useCallback(async () => {
    setShowUserMenu(false)
    try {
      await signIn()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }, [signIn])

  const handleSignOut = useCallback(() => {
    setShowSignoutModal(true)
    setShowUserMenu(false)
  }, [])

  const handleConfirmSignOut = useCallback(async () => {
    setShowSignoutModal(false)
    
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      router.push('/goodbye')
    }
  }, [signOut, router])

  // Touch/swipe handlers for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if ((isLeftSwipe || isRightSwipe) && activeTab !== 'dashboard' && device.width < 768) {
      const tabs: TabType[] = ['my-folder', 'bookmarks', 'marketplace']
      const currentIndex = tabs.indexOf(activeTab as TabType)
      
      if (isLeftSwipe && currentIndex < tabs.length - 1) {
        handleTabChange(tabs[currentIndex + 1])
      } else if (isRightSwipe && currentIndex > 0) {
        handleTabChange(tabs[currentIndex - 1])
      }
    }
  }, [touchStart, touchEnd, activeTab, device.width, handleTabChange])

  // App initialization
  useEffect(() => {
    if (isInitialized || status === 'loading') return

    const initializeApp = () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const tabParam = params.get('tab')
        
        // Handle URL tab parameter
        if (tabParam && ['dashboard', 'my-folder', 'marketplace', 'bookmarks'].includes(tabParam)) {
          const isProtectedTab = ['my-folder', 'marketplace', 'bookmarks'].includes(tabParam)
          
          if (isProtectedTab && !user?.id) {
            handleTabChange('dashboard')
          } else {
            handleTabChange(tabParam as TabType)
          }
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        } else if (user?.id) {
          // Restore from localStorage for logged in users
          const savedTab = localStorage.getItem('koouk-last-tab')
          if (savedTab && ['dashboard', 'my-folder', 'marketplace', 'bookmarks'].includes(savedTab)) {
            handleTabChange(savedTab as TabType)
          }
        } else {
          // Default to dashboard for non-logged in users
          handleTabChange('dashboard')
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('App initialization error:', error)
        handleTabChange('dashboard')
        setIsInitialized(true)
      }
    }

    if (status === 'idle' || status === 'authenticated' || status === 'error') {
      initializeApp()
    }
  }, [status, user?.id, handleTabChange, isInitialized])

  // 🚀 OPTIMIZATION 11: Progressive loading with skeleton UI
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header Skeleton */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Dashboard Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24 animate-pulse mb-2"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse mb-3"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Skeleton */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
                <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-8 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Loading your workspace...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (status === 'error' && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
          <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen-safe bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button 
                onClick={() => handleTabChange('dashboard')}
                className="hover:opacity-80 transition-opacity"
              >
                <Image 
                  src="/koouk-logo.svg" 
                  alt="KOOUK" 
                  width={100}
                  height={24}
                  className="h-6 w-auto"
                />
              </button>

              {/* Desktop Navigation */}
              {device.width >= 768 && (
                <div className="flex-1 flex justify-center mx-8">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleTabChange('my-folder')}
                      disabled={!user}
                      className={`px-6 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                        activeTab === 'my-folder'
                          ? 'bg-black text-white shadow-lg'
                          : user 
                            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                            : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      My Folder
                    </button>
                    <button
                      onClick={() => handleTabChange('bookmarks')}
                      disabled={!user}
                      className={`px-6 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                        activeTab === 'bookmarks'
                          ? 'bg-black text-white shadow-lg'
                          : user 
                            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                            : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Bookmarks
                    </button>
                    <button
                      onClick={() => handleTabChange('marketplace')}
                      disabled={!user}
                      className={`px-6 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                        activeTab === 'marketplace'
                          ? 'bg-black text-white shadow-lg'
                          : user 
                            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                            : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Market Place
                    </button>
                  </div>
                </div>
              )}

              {/* Right Side Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title="Send feedback"
                >
                  <MessageCircle size={20} />
                </button>

                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {user.user_metadata?.avatar_url ? (
                        <Image 
                          src={user.user_metadata.avatar_url} 
                          alt="Profile" 
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium truncate max-w-24 hidden sm:block">
                        {user.user_metadata?.name || user.email?.split('@')[0]}
                      </span>
                    </button>

                    {/* User Menu Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 border border-gray-200">
                        <div className="py-1">
                          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                            {user.email}
                          </div>
                          <Link
                            href="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings size={16} className="mr-3" />
                            Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <LogOut size={16} className="mr-3" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
) : (
                  <button
                    onClick={signIn}
                    disabled={status === 'loading'}
                    className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? 'Signing in...' : 'Sign in with Google'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Main Content */}
      <main 
        className="pb-safe"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {activeTab === 'dashboard' ? (
          user ? (
            <DashboardPage onNavigate={(tab: string) => handleTabChange(tab as TabType)} />
          ) : (
            <OnboardingPage />
          )
        ) : activeTab === 'my-folder' ? (
          <MyFolderContent searchQuery={searchQuery} />
        ) : activeTab === 'bookmarks' ? (
          <Bookmarks searchQuery={searchQuery} />
        ) : activeTab === 'marketplace' ? (
          <MarketPlace searchQuery={searchQuery} />
        ) : null}
      </main>

      {/* Mobile Navigation */}
      {device.width < 768 && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex">
            <button
              onClick={() => handleTabChange('my-folder')}
              disabled={!user}
              className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
                activeTab === 'my-folder'
                  ? 'text-blue-600'
                  : user
                    ? 'text-gray-600 hover:text-blue-600'
                    : 'text-gray-400'
              }`}
            >
              <div className={`w-6 h-6 mb-1 flex items-center justify-center ${!user ? 'opacity-50' : ''}`}>
                📁
              </div>
              My Folder
            </button>
            <button
              onClick={() => handleTabChange('bookmarks')}
              disabled={!user}
              className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
                activeTab === 'bookmarks'
                  ? 'text-blue-600'
                  : user
                    ? 'text-gray-600 hover:text-blue-600'
                    : 'text-gray-400'
              }`}
            >
              <div className={`w-6 h-6 mb-1 flex items-center justify-center ${!user ? 'opacity-50' : ''}`}>
                🔖
              </div>
              Bookmarks
            </button>
            <button
              onClick={() => handleTabChange('marketplace')}
              disabled={!user}
              className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
                activeTab === 'marketplace'
                  ? 'text-blue-600'
                  : user
                    ? 'text-gray-600 hover:text-blue-600'
                    : 'text-gray-400'
              }`}
            >
              <div className={`w-6 h-6 mb-1 flex items-center justify-center ${!user ? 'opacity-50' : ''}`}>
                🛍️
              </div>
              Market Place
            </button>
          </div>
        </nav>
      )}

      {/* Modals */}
      {showFeedbackModal && (
        <FeedbackModal 
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)} 
        />
      )}

      {showSignoutModal && (
        <SignoutModal 
          isOpen={showSignoutModal}
          onConfirm={handleConfirmSignOut}
          onClose={() => setShowSignoutModal(false)}
        />
      )}
    </div>
  )
}