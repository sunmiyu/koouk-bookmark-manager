'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Settings, LogOut, MessageCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '@/lib/supabase'
import Dashboard from '../workspace/Dashboard'
import MyFolderContent from '../workspace/MyFolderContent'
import MarketPlace from '../workspace/MarketPlace'
import Bookmarks from '../workspace/Bookmarks'
import { SharedFolder } from '@/types/share'
import { createFolder } from '@/types/folder'
import SearchInterface from '../ui/SearchInterface'
import FeedbackModal from '../modals/FeedbackModal'
import SignoutModal from '../ui/SignoutModal'
import TopNavigation from '../mobile/TopNavigation'
import MobileHeader from '../mobile/MobileHeader'
import { useDevice } from '@/hooks/useDevice'

export default function App() {
  const device = useDevice()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-folder' | 'marketplace' | 'bookmarks'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showSignoutModal, setShowSignoutModal] = useState(false)
  
  // Handle URL parameters for tab restoration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      
      // Handle tab parameter from URL
      const tabParam = params.get('tab')
      if (tabParam && (tabParam === 'marketplace' || tabParam === 'bookmarks' || tabParam === 'my-folder')) {
        setActiveTab(tabParam)
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      
      if (params.get('shared') === 'true') {
        const title = params.get('title')
        const text = params.get('text')
        const url = params.get('url')
        
        // Show notification or handle the shared content
        if (title || text || url) {
          const sharedContent = {
            title: title || 'Shared Content',
            text: text || '',
            url: url || ''
          }
          
          // Store shared content for handling by folder
          sessionStorage.setItem('koouk-shared-content', JSON.stringify(sharedContent))
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
          
          // Navigate to my-folder tab to handle the shared content
          setActiveTab('my-folder')
        }
      }
    }
  }, [])

  // SharedFolder import functionality
  const handleImportSharedFolder = (sharedFolder: SharedFolder) => {
    // Get existing folders from localStorage
    const savedFolders = localStorage.getItem('koouk-folders')
    let folders = []
    
    if (savedFolders) {
      folders = JSON.parse(savedFolders)
    }
    
    // Create new folder with same properties as shared folder
    const newFolder = createFolder(
      sharedFolder.title,
      undefined,
      {
        color: '#F97316', // 주황색으로 변경 (Market Place에서 가져온 폴더 구분)
        icon: sharedFolder.folder.icon || '📁'
      }
    )
    
    // Copy all children from shared folder
    newFolder.children = [...sharedFolder.folder.children]
    newFolder.updatedAt = new Date().toISOString()
    
    // Add new folder to the front
    const updatedFolders = [newFolder, ...folders]
    
    // Save to local storage
    localStorage.setItem('koouk-folders', JSON.stringify(updatedFolders))
    
    // Set selected folder to newly added folder
    localStorage.setItem('koouk-selected-folder', newFolder.id)
    
    // Navigate to my-folder tab
    setActiveTab('my-folder')
  }
  const { user, signIn } = useAuth()

  // Redirect to dashboard if user is not authenticated and trying to access protected tabs
  useEffect(() => {
    if (!user && (activeTab === 'my-folder' || activeTab === 'marketplace' || activeTab === 'bookmarks')) {
      setActiveTab('dashboard')
    }
  }, [user, activeTab])

  const handleSignIn = async () => {
    setShowUserMenu(false)
    try {
      await signIn()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleTabChange = (tab: 'dashboard' | 'my-folder' | 'marketplace' | 'bookmarks') => {
    // Check if user is trying to access protected tabs without authentication
    if (!user && (tab === 'my-folder' || tab === 'marketplace' || tab === 'bookmarks')) {
      // Show user menu to prompt login
      setShowUserMenu(true)
      return
    }
    setActiveTab(tab)
  }

  const handleSignOut = () => {
    setShowSignoutModal(true)
    setShowUserMenu(false)
  }

  const handleConfirmSignOut = async () => {
    setShowSignoutModal(false)
    
    try {
      console.log('🔐 Starting logout process...')
      
      // 2. Sign out from Supabase first
      console.log('🔒 Signing out from Supabase...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
      } else {
        console.log('✅ Supabase sign out successful')
      }
      
      // 3. Clear all localStorage
      console.log('💾 Clearing all localStorage...')
      if (typeof window !== 'undefined') {
        localStorage.clear()
        console.log('✅ localStorage completely cleared')
      }
      
      // 4. Clear all sessionStorage
      console.log('📝 Clearing all sessionStorage...')
      if (typeof window !== 'undefined') {
        sessionStorage.clear()
        console.log('✅ sessionStorage completely cleared')
      }
      
      // 5. Reload page for complete reset
      console.log('🔄 Reloading page...')
      window.location.reload()
      
    } catch (error) {
      console.error('💥 Sign out error, doing emergency reload:', error)
      // Emergency reload if complete failure
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header for Mobile/Desktop */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 w-full">
        <div className="w-full bg-white">
          <div className="w-full px-3 sm:px-8 sm:max-w-6xl sm:mx-auto">
            {/* PC: Single row with all elements */}
            {device.width >= 768 ? (
              <div className="flex items-center justify-between h-16 min-h-[64px]">
                {/* Logo */}
                <div className="flex items-center">
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
                </div>

                {/* Center - PC Navigation */}
                <div className="flex-1 flex justify-center mx-4">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleTabChange('my-folder')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform ${
                        activeTab === 'my-folder'
                          ? 'bg-black text-white shadow-md'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95'
                      }`}
                    >
                      My Folder
                    </button>
                    <button
                      onClick={() => handleTabChange('bookmarks')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform ${
                        activeTab === 'bookmarks'
                          ? 'bg-black text-white shadow-md'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95'
                      }`}
                    >
                      Bookmarks
                    </button>
                    <button
                      onClick={() => handleTabChange('marketplace')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform ${
                        activeTab === 'marketplace'
                          ? 'bg-black text-white shadow-md'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95'
                      }`}
                    >
                      Market Place
                    </button>
                  </div>
                </div>

                {/* Right side elements */}
                <div className="flex items-center gap-0.5 sm:gap-3">
                  {/* Enhanced Search Interface - Always show */}
                  <SearchInterface
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchScope={activeTab === 'my-folder' ? 'my-folder' : activeTab === 'marketplace' ? 'market-place' : 'bookmarks'}
                    placeholder="Search..."
                    language="en"
                  />

                  {/* Feedback Button - responsive design */}
                  <button 
                    onClick={() => setShowFeedbackModal(true)}
                    className="flex items-center justify-center w-8 h-8 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:w-auto sm:h-auto"
                    title="Feedback"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Feedback</span>
                  </button>

                  {/* User Account - Completely New Implementation */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        console.log('🔵 User menu button clicked')
                        setShowUserMenu(!showUserMenu)
                      }}
                      className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                      type="button"
                    >
                      <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
) : (
              /* Mobile: New Mobile Header Component + Navigation */
              <div>
                {/* Mobile Header */}
                <MobileHeader
                  activeTab={activeTab}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onShowFeedbackModal={() => setShowFeedbackModal(true)}
                  onShowUserMenu={() => {
                    console.log('🔵 Mobile user menu button clicked')
                    setShowUserMenu(!showUserMenu)
                  }}

                />

                {/* Navigation tabs - Always show */}
                <div className="flex justify-center border-t border-gray-100 py-1">
                  <TopNavigation 
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                      console.log('Mobile TopNavigation tab change:', tab)
                      handleTabChange(tab)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className={`w-full px-2 sm:px-8 sm:max-w-6xl sm:mx-auto pt-2 sm:pt-6 pb-4 sm:pb-8 ${
        device.width >= 768 ? 'min-h-[calc(100vh-64px)]' : 'min-h-[calc(100vh-100px)]'
      }`}>
        {activeTab === 'dashboard' ? (
          <Dashboard onNavigateToSection={(section) => {
            handleTabChange(section)
          }} />
        ) : activeTab === 'my-folder' ? (
          <MyFolderContent searchQuery={searchQuery} />
        ) : activeTab === 'bookmarks' ? (
          <Bookmarks searchQuery={searchQuery} />
        ) : (
          <MarketPlace 
            searchQuery={searchQuery} 
            onImportFolder={handleImportSharedFolder}
          />
        )}
      </main>

      {/* New User Dropdown Menu - Fixed Position */}
      {showUserMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-transparent"
            style={{ zIndex: 10000 }}
            onClick={() => {
              console.log('🔴 Overlay clicked - closing menu')
              setShowUserMenu(false)
            }}
          />
          
          {/* Dropdown Menu */}
          <div
            className="fixed top-20 right-4 w-48 bg-white rounded-lg shadow-2xl border border-gray-200 py-2"
            style={{ zIndex: 10001 }}
          >
            {user ? (
              <>
                <div className="px-3 py-2 border-b border-gray-100 text-center">
                  <div className="text-xs font-medium text-black">{user?.email?.split('@')[0] || 'User'}</div>
                  <div className="text-[10px] text-gray-500">{user?.email}</div>
                </div>
                
                <Link
                  href="/settings"
                  onClick={() => {
                    console.log('🟢 Settings clicked')
                    // Save current page state to localStorage
                    const currentPageData = {
                      tab: activeTab,
                      query: searchQuery
                    }
                    localStorage.setItem('koouk-previous-page-data', JSON.stringify(currentPageData))
                    // Create URL based on current tab
                    let pageUrl = '/'
                    if (activeTab === 'marketplace') pageUrl += '?tab=marketplace'
                    else if (activeTab === 'bookmarks') pageUrl += '?tab=bookmarks'
                    else if (activeTab === 'my-folder') pageUrl += '?tab=my-folder'
                    localStorage.setItem('koouk-previous-page', pageUrl)
                    setShowUserMenu(false)
                  }}
                  className="w-full flex items-center justify-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </Link>
                
                <button
                  onClick={() => {
                    console.log('🔴 NEW Sign out button clicked!')
                    setShowUserMenu(false)
                    handleSignOut()
                  }}
                  className="w-full flex items-center justify-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  type="button"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="px-3 py-2">
                <div className="text-center mb-3">
                  <div className="text-xs font-medium text-black">Welcome to KOOUK</div>
                  <div className="text-[10px] text-gray-500">Sign in to save your data</div>
                </div>
                
                <button
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center gap-2.5 px-3 py-2 text-xs bg-black text-white hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
                  type="button"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            )}
          </div>
        </>
      )}


      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Signout Modal */}
      <SignoutModal
        isOpen={showSignoutModal}
        onClose={() => setShowSignoutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
    </div>
  )
}