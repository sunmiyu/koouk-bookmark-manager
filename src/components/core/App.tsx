'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Settings, LogOut, MessageCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
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
  const { user, signIn, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-folder' | 'marketplace' | 'bookmarks'>('my-folder')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showSignoutModal, setShowSignoutModal] = useState(false)
  
  // 무한루프 방지를 위한 초기화 플래그
  const isInitialized = useRef(false)
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  const minSwipeDistance = 50
  const tabOrder: ('my-folder' | 'bookmarks' | 'marketplace')[] = ['my-folder', 'bookmarks', 'marketplace']
  
  // 탭 변경 함수 최적화 (무한루프 방지)
  const handleTabChange = useCallback((
    tab: 'dashboard' | 'my-folder' | 'marketplace' | 'bookmarks', 
    saveToStorage = true
  ) => {
    // 보호된 탭 체크
    if (!user?.id && (tab === 'my-folder' || tab === 'marketplace' || tab === 'bookmarks')) {
      setShowUserMenu(true)
      return
    }
    
    setActiveTab(tab)
    
    // localStorage 저장 (선택적)
    if (saveToStorage && typeof window !== 'undefined') {
      localStorage.setItem('koouk-last-tab', tab)
    }
  }, [user?.id])
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  
  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if ((isLeftSwipe || isRightSwipe) && activeTab !== 'dashboard' && device.width < 768) {
      const currentIndex = tabOrder.indexOf(activeTab as 'my-folder' | 'bookmarks' | 'marketplace')
      
      if (isLeftSwipe && currentIndex < tabOrder.length - 1) {
        const nextTab = tabOrder[currentIndex + 1]
        if ('vibrate' in navigator) {
          navigator.vibrate(10)
        }
        handleTabChange(nextTab)
      } else if (isRightSwipe && currentIndex > 0) {
        const prevTab = tabOrder[currentIndex - 1]
        if ('vibrate' in navigator) {
          navigator.vibrate(10)
        }
        handleTabChange(prevTab)
      }
    }
  }, [touchStart, touchEnd, activeTab, device.width, handleTabChange])

  // URL 파라미터 및 localStorage 처리 (개선된 버전)
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized.current) return
    
    const initializeApp = () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const tabParam = params.get('tab')
        
        // URL 파라미터 처리
        if (tabParam && ['marketplace', 'bookmarks', 'my-folder', 'dashboard'].includes(tabParam)) {
          const isProtectedTab = ['my-folder', 'marketplace', 'bookmarks'].includes(tabParam)
          
          if (isProtectedTab && !user?.id) {
            handleTabChange('dashboard', false)
          } else {
            handleTabChange(tabParam as any, true)
          }
          
          // URL 정리
          window.history.replaceState({}, document.title, window.location.pathname)
        } else {
          // localStorage에서 복원
          const savedTab = localStorage.getItem('koouk-last-tab')
          if (savedTab && ['marketplace', 'bookmarks', 'my-folder', 'dashboard'].includes(savedTab)) {
            const isProtectedTab = ['my-folder', 'marketplace', 'bookmarks'].includes(savedTab)
            
            if (isProtectedTab && !user?.id) {
              handleTabChange('dashboard', false)
            } else {
              handleTabChange(savedTab as any, false)
            }
          }
        }
        
        // 공유 콘텐츠 처리
        if (params.get('shared') === 'true') {
          const title = params.get('title')
          const text = params.get('text')
          const url = params.get('url')
          
          if (title || text || url) {
            const sharedContent = {
              title: title || 'Shared Content',
              text: text || '',
              url: url || ''
            }
            
            sessionStorage.setItem('koouk-shared-content', JSON.stringify(sharedContent))
            window.history.replaceState({}, document.title, window.location.pathname)
            
            if (user?.id) {
              handleTabChange('my-folder', false)
            } else {
              handleTabChange('dashboard', false)
            }
          }
        }
        
        isInitialized.current = true
      } catch (error) {
        console.error('App initialization error:', error)
        handleTabChange('dashboard', false)
        isInitialized.current = true
      }
    }

    // 약간의 지연을 두어 AuthContext가 먼저 초기화되도록 함
    const timeoutId = setTimeout(initializeApp, 100)
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [user?.id, handleTabChange])

  // SharedFolder import functionality
  const handleImportSharedFolder = useCallback((sharedFolder: SharedFolder) => {
    try {
      const savedFolders = localStorage.getItem('koouk-folders')
      let folders = []
      
      if (savedFolders) {
        folders = JSON.parse(savedFolders)
      }
      
      const newFolder = createFolder(
        sharedFolder.title,
        undefined,
        {
          color: '#F97316',
          icon: sharedFolder.folder.icon || '📁'
        }
      )
      
      newFolder.children = [...sharedFolder.folder.children]
      newFolder.updatedAt = new Date().toISOString()
      
      const updatedFolders = [newFolder, ...folders]
      localStorage.setItem('koouk-folders', JSON.stringify(updatedFolders))
      localStorage.setItem('koouk-selected-folder', newFolder.id)
      
      handleTabChange('my-folder')
    } catch (error) {
      console.error('Import folder error:', error)
    }
  }, [handleTabChange])

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
      window.location.reload()
    }
  }, [signOut])

  return (
    <div className="min-h-screen bg-white">
      {/* 기존 JSX 코드는 동일하게 유지 */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 w-full">
        {/* 헤더 내용은 원본과 동일 */}
        <div className="w-full bg-white">
          <div className="w-full px-3 sm:px-8 sm:max-w-6xl sm:mx-auto">
            {device.width >= 768 ? (
              <div className="flex items-center justify-between h-16 min-h-[64px]">
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

                <div className="flex-1 flex justify-center mx-4">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleTabChange('my-folder')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform select-none ${
                        activeTab === 'my-folder'
                          ? 'bg-black text-white shadow-md'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      My Folder
                    </button>
                    <button
                      onClick={() => handleTabChange('bookmarks')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform select-none ${
                        activeTab === 'bookmarks'
                          ? 'bg-black text-white shadow-md'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      Bookmarks
                    </button>
                    <button
                      onClick={() => handleTabChange('marketplace')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform select-none ${
                        activeTab === 'marketplace'
                          ? 'bg-black text-white shadow-md'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      Market Place
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-3">
                  <SearchInterface
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchScope={activeTab === 'my-folder' ? 'my-folder' : activeTab === 'marketplace' ? 'market-place' : 'bookmarks'}
                    placeholder="Search..."
                    language="en"
                  />

                  <button 
                    onClick={() => setShowFeedbackModal(true)}
                    className="flex items-center justify-center w-8 h-8 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-150 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:w-auto sm:h-auto active:scale-95 select-none"
                    title="Feedback"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Feedback</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded-md transition-all duration-150 cursor-pointer active:scale-95 select-none"
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
              <div>
                <MobileHeader
                  activeTab={activeTab}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onShowFeedbackModal={() => setShowFeedbackModal(true)}
                  onShowUserMenu={() => setShowUserMenu(!showUserMenu)}
                  onLogoClick={() => handleTabChange('dashboard')}
                />

                {activeTab !== 'dashboard' && (
                  <div className="flex justify-center border-t border-gray-100 py-1">
                    <TopNavigation 
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main 
        className={`w-full px-2 sm:px-8 sm:max-w-6xl sm:mx-auto pt-2 sm:pt-6 pb-4 sm:pb-8 transition-all duration-300 ease-out ${
          device.width >= 768 ? 'min-h-[calc(100vh-64px)]' : 'min-h-[calc(100vh-100px)]'
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {activeTab === 'dashboard' ? (
          <Dashboard onNavigateToSection={handleTabChange} />
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

      {/* 나머지 모달 및 UI 요소들은 원본과 동일 */}
      {showUserMenu && (
        <>
          <div
            className="fixed inset-0 bg-transparent"
            style={{ zIndex: 10000 }}
            onClick={() => setShowUserMenu(false)}
          />
          
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
                    const currentPageData = {
                      tab: activeTab,
                      query: searchQuery
                    }
                    localStorage.setItem('koouk-previous-page-data', JSON.stringify(currentPageData))
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
                  onClick={handleSignOut}
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
                  className="w-full flex items-center justify-center gap-2.5 px-3 py-2 text-xs bg-black text-white hover:bg-gray-800 rounded-md transition-all duration-150 cursor-pointer active:scale-95 select-none"
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

      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      <SignoutModal
        isOpen={showSignoutModal}
        onClose={() => setShowSignoutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
    </div>
  )
}