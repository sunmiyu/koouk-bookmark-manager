'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Settings, LogOut, MessageCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '@/lib/supabase'
import WorkspaceContent from '../workspace/WorkspaceContent'
import MarketPlace from '../workspace/MarketPlace'
import Bookmarks from '../workspace/Bookmarks'
import { SharedFolder } from '@/types/share'
import { createFolder } from '@/types/folder'
import SearchInterface from '../ui/SearchInterface'
import FeedbackModal from '../modals/FeedbackModal'
import TopNavigation from '../mobile/TopNavigation'
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
        color: sharedFolder.folder.color || '#3B82F6',
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
    if (!confirm('로그아웃 하시겠습니까? 모든 데이터가 초기화됩니다.')) {
      return
    }
    
    try {
      console.log('🔥 Emergency sign out process starting...')
      
      // 1. 즉시 사용자 메뉴 닫기
      setShowUserMenu(false)
      
      // 2. 모든 localStorage 완전 삭제
      console.log('💾 Clearing all localStorage...')
      if (typeof window !== 'undefined') {
        localStorage.clear() // 모든 키 삭제
        console.log('✅ localStorage completely cleared')
      }
      
      // 3. 모든 sessionStorage 삭제
      console.log('📝 Clearing all sessionStorage...')
      if (typeof window !== 'undefined') {
        sessionStorage.clear()
        console.log('✅ sessionStorage completely cleared')
      }
      
      // 4. Supabase 강제 로그아웃 (에러 무시)
      console.log('🔐 Force signing out from Supabase...')
      try {
        await supabase.auth.signOut({ scope: 'global' })
        console.log('✅ Supabase sign out successful')
      } catch (authError) {
        console.warn('⚠️ Supabase sign out failed, but continuing...', authError)
      }
      
      // 5. 페이지 강제 새로고침 (즉시)
      console.log('🔄 Force reloading page...')
      window.location.href = window.location.origin // 루트로 이동 후 새로고침
      
    } catch (error) {
      console.error('💥 Sign out error, doing emergency reload:', error)
      // 완전 실패 시 강제 새로고침
      window.location.href = window.location.origin
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header for Mobile/Desktop */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 w-full">
        <div className="w-full bg-white">
          <div className="w-full px-4 sm:px-8 sm:max-w-6xl sm:mx-auto">
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

              {/* Center - Navigation Tabs (Mobile & Desktop) */}
              <div className="flex-1 flex justify-center mx-2 sm:mx-4">
                {/* Debug: Show device type */}
                <div className="fixed top-20 left-2 bg-red-500 text-white p-1 text-xs z-50 rounded">
                  {device.type} - {device.width}px
                </div>
                {device.width < 768 ? (
                  <TopNavigation 
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                      console.log('TopNavigation tab change:', tab)
                      setActiveTab(tab)
                    }}
                  />
                ) : (
                  // PC Desktop Navigation (768px 이상)
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
                )}
              </div>

              {/* Right side elements */}
              <div className="flex items-center gap-0.5 sm:gap-3">
                {/* Enhanced Search Interface */}
                <SearchInterface
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchScope={activeTab === 'my-folder' ? 'my-folder' : activeTab === 'marketplace' ? 'market-place' : 'bookmarks'}
                  placeholder="Search..."
                  language="ko"
                />

                {/* Feedback Button - mobile shows icon only */}
                <button 
                  onClick={() => setShowFeedbackModal(true)}
                  className="flex items-center justify-center w-8 h-8 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:w-auto sm:h-auto"
                  title="Feedback"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Feedback</span>
                </button>

                {/* User Account */}
                <div className="relative z-[60]">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-medium">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[999]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="text-xs font-medium text-black">{user?.email?.split('@')[0] || 'User'}</div>
                        <div className="text-[10px] text-gray-500">{user?.email}</div>
                      </div>
                      
                      <Link
                        href="/settings"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowUserMenu(false)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSignOut()
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="w-full px-2 sm:px-8 sm:max-w-6xl sm:mx-auto pt-2 sm:pt-6 pb-4 sm:pb-8 min-h-[calc(100vh-64px)]">
        {activeTab === 'my-folder' ? (
          <WorkspaceContent searchQuery={searchQuery} />
        ) : activeTab === 'bookmarks' ? (
          <Bookmarks searchQuery={searchQuery} />
        ) : (
          <MarketPlace 
            searchQuery={searchQuery} 
            onImportFolder={handleImportSharedFolder}
          />
        )}
      </main>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-[998]"
          onClick={() => setShowUserMenu(false)}
        />
      )}



      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  )
}