'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Settings, LogOut, MessageCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '@/lib/supabase'
import MyFolderContent from '../workspace/MyFolderContent'
import MarketPlace from '../workspace/MarketPlace'
import Bookmarks from '../workspace/Bookmarks'
import { SharedFolder } from '@/types/share'
import { createFolder } from '@/types/folder'
import SearchInterface from '../ui/SearchInterface'
import FeedbackModal from '../modals/FeedbackModal'
import TopNavigation from '../mobile/TopNavigation'
import MobileHeader from '../mobile/MobileHeader'
import { useDevice } from '@/hooks/useDevice'

export default function App() {
  const device = useDevice()
  const [activeTab, setActiveTab] = useState<'my-folder' | 'marketplace' | 'bookmarks'>('my-folder')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  
  // Handle shared content from PWA Web Share Target
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      
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
  const { user } = useAuth()

  const handleSignOut = async () => {
    if (!confirm('Are you sure you want to sign out? All data will be reset.')) {
      return
    }
    
    try {
      console.log('🔐 Starting logout process...')
      
      // 1. Close user menu immediately
      setShowUserMenu(false)
      
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
                    onClick={() => setActiveTab('my-folder')}
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
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('my-folder')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'my-folder'
                          ? 'border-black text-black'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      My Folder
                    </button>
                    <button
                      onClick={() => setActiveTab('bookmarks')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'bookmarks'
                          ? 'border-black text-black'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Bookmarks
                    </button>
                    <button
                      onClick={() => setActiveTab('marketplace')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'marketplace'
                          ? 'border-black text-black'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Market Place
                    </button>
                  </div>
                </div>

                {/* Right side elements */}
                <div className="flex items-center gap-0.5 sm:gap-3">
                  {/* Enhanced Search Interface */}
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
                    className="flex items-center justify-center w-8 h-8 text-gray-700 hover:text-gray-900 transition-colors sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:w-auto sm:h-auto sm:hover:bg-gray-50 sm:rounded-md"
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

                {/* Navigation tabs */}
                <div className="flex justify-center border-t border-gray-100 py-2">
                  <TopNavigation 
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                      console.log('Mobile TopNavigation tab change:', tab)
                      setActiveTab(tab)
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
        {activeTab === 'my-folder' ? (
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
            className="fixed top-20 right-4 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2"
            style={{ zIndex: 10001 }}
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-black">{user?.email?.split('@')[0] || 'User'}</div>
              <div className="text-[10px] text-gray-500">{user?.email}</div>
            </div>
            
            <Link
              href="/settings"
              onClick={() => {
                console.log('🟢 Settings clicked')
                setShowUserMenu(false)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              type="button"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </>
      )}


      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  )
}