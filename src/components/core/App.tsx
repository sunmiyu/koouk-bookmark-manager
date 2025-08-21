'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { FolderItem, StorageItem } from '@/types/folder'
import { DatabaseService } from '@/lib/database'
import KooukSidebar from '../layout/KooukSidebar'
import MainContent from '../layout/MainContent'
import LoginModal from '../auth/LoginModal'
import FeedbackModal from '../modals/FeedbackModal'
import SignoutModal from '../ui/SignoutModal'
import { useDevice } from '@/hooks/useDevice'
import { useToast } from '@/hooks/useToast'
import Toast from '../ui/Toast'
import DashboardPage from '../pages/Dashboard/DashboardPage'

type TabType = 'my-folder' | 'bookmarks' | 'marketplace'

export default function App() {
  const device = useDevice()
  const { user, loading, signIn, signOut } = useAuth()
  const status = loading ? 'loading' : (user ? 'authenticated' : 'idle')
  const { toast, showSuccess, showError, hideToast } = useToast()
  
  const [activeTab, setActiveTab] = useState<TabType>('my-folder')
  
  // 🎯 디버깅: activeTab 변경 감지
  useEffect(() => {
    console.log('🎯 App activeTab changed to:', activeTab)
  }, [activeTab])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showMobileDropdown, setShowMobileDropdown] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [marketplaceView, setMarketplaceView] = useState<'marketplace' | 'my-shared'>('marketplace')
  const [sharedFolderIds, setSharedFolderIds] = useState<Set<string>>(new Set())
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showSignoutModal, setShowSignoutModal] = useState(false)

  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  // 🎯 사이드바 폴더 선택 핸들러 - 뷰 전환 포함
  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    setCurrentView('detail')
  }

  // 🎯 뷰 변경 핸들러
  const handleViewChange = (view: 'grid' | 'detail') => {
    setCurrentView(view)
    if (view === 'grid') {
      setSelectedFolderId(undefined)
    }
  }

  // 🎯 폴더 순서 변경 핸들러
  const handleReorderFolders = (reorderedFolders: FolderItem[]) => {
    setFolders(reorderedFolders)
    // TODO: Implement database update for folder ordering
  }

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    // 로그인 후 My Folder 탭으로
    setActiveTab('my-folder')
    loadUserData()
  }, [user])

  // Enhancement: Process queued imports when back online
  useEffect(() => {
    const processQueuedImports = async () => {
      if (!user?.id || !navigator.onLine) return
      
      try {
        const queuedImports = JSON.parse(localStorage.getItem('koouk-queued-imports') || '[]')
        if (queuedImports.length === 0) return
        
        console.log(`📤 Processing ${queuedImports.length} queued imports...`)
        
        for (const queued of queuedImports) {
          if (queued.userId === user.id) {
            await handleImportFolder(queued.sharedFolder)
          }
        }
        
        // Clear processed imports
        localStorage.removeItem('koouk-queued-imports')
        showSuccess(`✅ Processed ${queuedImports.length} queued imports!`)
        
      } catch (error) {
        console.error('Failed to process queued imports:', error)
      }
    }

    // Process when user logs in and is online
    if (user && navigator.onLine) {
      processQueuedImports()
    }

    // Listen for online events
    const handleOnline = () => {
      if (user) processQueuedImports()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [user])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      const dbFolders = await DatabaseService.getUserFolders(user.id)
      
      const convertedFolders: FolderItem[] = dbFolders.map(dbFolder => ({
        id: dbFolder.id,
        name: dbFolder.name,
        type: 'folder' as const,
        children: (dbFolder.storage_items || []).map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as StorageItem['type'],
          content: item.content,
          url: item.url || undefined,
          thumbnail: item.thumbnail || undefined,
          tags: item.tags,
          description: item.description || undefined,
          folderId: item.folder_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          wordCount: item.word_count || undefined,
          metadata: item.metadata as StorageItem['metadata']
        })),
        createdAt: dbFolder.created_at,
        updatedAt: dbFolder.updated_at,
        color: dbFolder.color,
        icon: dbFolder.icon
      }))

      setFolders(convertedFolders)
    } catch (error) {
      console.error('Failed to load folders:', error)
      showError('Failed to load your folders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!user?.id) return
    
    const folderName = newFolderName.trim() || 'New Folder'
    
    try {
      const dbFolder = await DatabaseService.createFolder(user.id, {
        name: folderName,
        color: '#3B82F6',
        icon: '',
        sort_order: 0
      })

      const newFolder: FolderItem = {
        id: dbFolder.id,
        name: dbFolder.name,
        type: 'folder',
        children: [],
        createdAt: dbFolder.created_at,
        updatedAt: dbFolder.updated_at,
        color: dbFolder.color,
        icon: dbFolder.icon
      }
      
      setFolders([newFolder, ...folders])
      setSelectedFolderId(newFolder.id)
      setShowCreateFolderModal(false)
      setNewFolderName('')
      showSuccess(`Folder "${folderName}" created!`)
    } catch (error) {
      console.error('Failed to create folder:', error)
      showError('Failed to create folder')
    }
  }

  const handleAddItem = async (item: StorageItem, folderId: string) => {
    if (!user?.id) return
    
    try {
      const dbItem = await DatabaseService.createStorageItem(user.id, {
        folder_id: folderId,
        name: item.name,
        type: item.type,
        content: item.content,
        url: item.url,
        thumbnail: item.thumbnail,
        tags: item.tags,
        description: item.description,
        word_count: item.wordCount,
        metadata: (item.metadata as any) || {},
        sort_order: 0
      })

      const updatedFolders = folders.map(folder => {
        if (folder.id === folderId) {
          const newStorageItem: StorageItem = {
            id: dbItem.id,
            name: dbItem.name,
            type: dbItem.type as StorageItem['type'],
            content: dbItem.content,
            url: dbItem.url || undefined,
            thumbnail: dbItem.thumbnail || undefined,
            tags: dbItem.tags,
            description: dbItem.description || undefined,
            folderId: dbItem.folder_id,
            createdAt: dbItem.created_at,
            updatedAt: dbItem.updated_at,
            wordCount: dbItem.word_count || undefined,
            metadata: dbItem.metadata as StorageItem['metadata']
          }
          
          return {
            ...folder,
            children: [newStorageItem, ...folder.children],
            updatedAt: new Date().toISOString()
          }
        }
        return folder
      })
      
      setFolders(updatedFolders)
      showSuccess('Item added successfully!')
    } catch (error) {
      console.error('Failed to add item:', error)
      showError('Failed to add item')
    }
  }

  // Enhancement: Batch import multiple folders at once
  const handleBatchImport = async (sharedFolders: any[]) => {
    if (!user?.id) {
      showError('Please sign in to import folders')
      return
    }

    if (sharedFolders.length === 0) return

    try {
      showSuccess(`Importing ${sharedFolders.length} folders...`)
      
      const importResults = await Promise.allSettled(
        sharedFolders.map(folder => handleImportFolder(folder))
      )
      
      const successful = importResults.filter(result => result.status === 'fulfilled').length
      const failed = importResults.length - successful
      
      if (failed === 0) {
        showSuccess(`✅ Successfully imported all ${successful} folders!`)
      } else {
        showSuccess(`✅ Imported ${successful} folders, ${failed} failed`)
      }
    } catch (error) {
      console.error('Batch import error:', error)
      showError('Batch import failed. Please try again.')
    }
  }

  // Fix 1: Add missing import folder handler with optimistic UI + offline sync
  const handleImportFolder = async (sharedFolder: any) => {
    if (!user?.id) {
      showError('Please sign in to import folders')
      return
    }

    // Enhancement: Check if offline and queue for later
    if (!navigator.onLine) {
      try {
        const queuedImports = JSON.parse(localStorage.getItem('koouk-queued-imports') || '[]')
        queuedImports.push({
          sharedFolder,
          userId: user.id,
          timestamp: Date.now()
        })
        localStorage.setItem('koouk-queued-imports', JSON.stringify(queuedImports))
        showSuccess(`"${sharedFolder.title}" queued for import when online`)
        return
      } catch {
        showError('Failed to queue import for offline sync')
        return
      }
    }

    try {
      // Optimistic UI: Show success immediately
      showSuccess(`"${sharedFolder.title}" imported successfully!`)
      
      // Create new folder with conflict resolution
      const baseName = sharedFolder.title
      let folderName = baseName
      let counter = 1
      
      // Check for naming conflicts
      while (folders.some(f => f.name === folderName)) {
        folderName = `${baseName} (${counter})`
        counter++
      }

      // Create folder in database
      const dbFolder = await DatabaseService.createFolder(user.id, {
        name: folderName,
        color: '#3B82F6',
        icon: sharedFolder.folder?.icon || '📁',
        sort_order: 0
      })

      // Copy all storage items from shared folder
      const folderContent = sharedFolder.folder?.children || []
      const copiedItems: StorageItem[] = []
      
      for (const item of folderContent) {
        try {
          const dbItem = await DatabaseService.createStorageItem(user.id, {
            folder_id: dbFolder.id,
            name: item.name,
            type: item.type,
            content: item.content,
            url: item.url,
            thumbnail: item.thumbnail,
            tags: item.tags || [],
            description: item.description,
            word_count: item.wordCount,
            metadata: (item.metadata as any) || {},
            sort_order: 0
          })

          copiedItems.push({
            id: dbItem.id,
            name: dbItem.name,
            type: dbItem.type as StorageItem['type'],
            content: dbItem.content,
            url: dbItem.url || undefined,
            thumbnail: dbItem.thumbnail || undefined,
            tags: dbItem.tags,
            description: dbItem.description || undefined,
            folderId: dbItem.folder_id,
            createdAt: dbItem.created_at,
            updatedAt: dbItem.updated_at,
            wordCount: dbItem.word_count || undefined,
            metadata: dbItem.metadata as StorageItem['metadata']
          })
        } catch (itemError) {
          console.warn('Failed to copy item:', item.name, itemError)
        }
      }

      // Create new folder object
      const newFolder: FolderItem = {
        id: dbFolder.id,
        name: dbFolder.name,
        type: 'folder',
        children: copiedItems,
        createdAt: dbFolder.created_at,
        updatedAt: dbFolder.updated_at,
        color: dbFolder.color,
        icon: dbFolder.icon
      }
      
      // Add to local state
      setFolders([newFolder, ...folders])
      
      // Auto-select the imported folder
      setSelectedFolderId(newFolder.id)
      
      console.log(`✅ Imported "${folderName}" with ${copiedItems.length} items`)
      
    } catch (error) {
      console.error('Failed to import folder:', error)
      showError(`Failed to import "${sharedFolder.title}". Please try again.`)
    }
  }

  // 🚀 OPTIMIZATION 4: Enhanced loading with suspense boundaries
  if (status === 'loading' || isLoading) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      }>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-4 animate-pulse">
              K
            </div>
            <div className="text-gray-600 font-semibold">Loading your library...</div>
          </div>
        </div>
      </Suspense>
    )
  }

  // SUNO-style: Always show the same interface, prompt login when needed
  const handleLoginRequired = () => {
    if (!user) {
      setShowLoginModal(true)
      return true
    }
    return false
  }

  // 로그인 전 모바일: Dashboard만 표시
  if (device.width < 768 && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col h-screen">
          {/* 🎯 모바일 헤더 - 로그인 전 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center text-white font-bold text-xs">
                K
              </div>
              <h1 className="font-bold text-gray-900 text-sm">
                KOOUK
              </h1>
            </div>
            
            <button 
              onClick={() => setShowFeedbackModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              T
            </button>
          </div>

          {/* Dashboard */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardPage 
              onNavigate={(tab: string) => {
                // 로그인 유도 메시지 표시
                showError('Please sign in to access ' + (tab === 'my-folder' ? 'My Folder' : tab === 'bookmarks' ? 'Bookmarks' : 'Marketplace'))
                setShowLoginModal(true)
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // 로그인 후 모바일: 3개 탭 드롭다운
  if (device.width < 768) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col h-screen">
          {/* 🎯 모바일 헤더 - KOOUK 로고 왼쪽 + 드롭다운 */}
          <div className="relative flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            {/* KOOUK 로고 (왼쪽) */}
            <button 
              onClick={() => setShowMobileDropdown(!showMobileDropdown)}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center text-white font-bold text-xs">
                K
              </div>
              <h1 className="font-bold text-gray-900 text-sm">
                KOOUK
              </h1>
              <svg className={`w-4 h-4 text-gray-600 transition-transform ${showMobileDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* 오른쪽 계정 아이콘 */}
            <button
              onClick={() => setShowAccountMenu(true)}
              className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              T
            </button>

            {/* 드롭다운 메뉴 - 3개 탭 */}
            {showMobileDropdown && (
              <div className="absolute top-full left-4 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="p-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setActiveTab('my-folder')
                        setShowMobileDropdown(false)
                      }}
                      className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === 'my-folder' 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      My Folder
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('bookmarks')
                        setShowMobileDropdown(false)
                      }}
                      className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === 'bookmarks' 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Bookmarks
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('marketplace')
                        setShowMobileDropdown(false)
                      }}
                      className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === 'marketplace' 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Market Place
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 🎯 모바일 메인 컨텐츠 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <MainContent
              activeTab={activeTab}
              selectedFolder={selectedFolder}
              folders={folders}
              selectedFolderId={selectedFolderId}
              currentView={currentView}
              onAddItem={handleAddItem}
              onImportFolder={handleImportFolder}
              marketplaceView={marketplaceView}
              onMarketplaceViewChange={setMarketplaceView}
              onFolderSelect={handleFolderSelect}
              onTabChange={setActiveTab}
              onViewChange={handleViewChange}
            />
          </div>
        </div>

        {/* 드롭다운이 열려있을 때 배경 클릭으로 닫기 */}
        {showMobileDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMobileDropdown(false)}
          />
        )}

        {/* 계정 메뉴 모달 */}
        {showAccountMenu && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
              <div className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Account
                </h3>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowAccountMenu(false)
                      setShowFeedbackModal(true)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Send Feedback
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAccountMenu(false)
                      window.open('/privacy', '_blank')
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Privacy Policy
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAccountMenu(false)
                      setShowSignoutModal(true)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-red-600"
                  >
                    Logout
                  </button>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setShowAccountMenu(false)}
                    className="w-full py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 데스크톱 로그인 전: Dashboard만 표시 + 로그인 유도
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardPage 
          onNavigate={(tab: string) => {
            // 로그인 유도 메시지 표시
            showError('Please sign in to access ' + (tab === 'my-folder' ? 'My Folder' : tab === 'bookmarks' ? 'Bookmarks' : 'Marketplace'))
            setShowLoginModal(true)
          }}
        />
        
        {/* 로그인 모달 */}
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
        
        {/* 피드백 모달 */}
        {showFeedbackModal && (
          <FeedbackModal 
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)} 
          />
        )}
        
        {/* 토스트 */}
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      </div>
    )
  }

  // 데스크톱 로그인 후: 사이드바 + 탭
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 🎯 완전 분리된 사이드바 - 독립적인 영역 */}
      <div className="w-80 flex-shrink-0">
        <KooukSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={handleFolderSelect}
          onCreateFolder={() => setShowCreateFolderModal(true)}
          onReorderFolders={handleReorderFolders}
          sharedFolderIds={sharedFolderIds}
          onAccountClick={() => setShowAccountMenu(true)}
        />
      </div>

      {/* 🎯 완전 분리된 메인 컨텐츠 영역 - 입력바 포함 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense fallback={
          <div className="flex-1 p-6 overflow-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        }>
          <MainContent
            activeTab={activeTab}
            selectedFolder={selectedFolder}
            folders={folders}
            selectedFolderId={selectedFolderId}
            currentView={currentView}
            onAddItem={handleAddItem}
            onImportFolder={handleImportFolder}
            onLoginRequired={handleLoginRequired}
            user={user}
            marketplaceView={marketplaceView}
            onTabChange={setActiveTab}
            onMarketplaceViewChange={setMarketplaceView}
            onFolderSelect={handleFolderSelect}
            onViewChange={handleViewChange}
          />
        </Suspense>
      </div>

      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Create New Folder</h3>
            
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <FeedbackModal 
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)} 
        />
      )}

      {/* SUNO-style Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* 계정 메뉴 모달 */}
      {showAccountMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Account
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowAccountMenu(false)
                    setShowFeedbackModal(true)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Send Feedback
                </button>
                
                <button
                  onClick={() => {
                    setShowAccountMenu(false)
                    window.open('/privacy', '_blank')
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Privacy Policy
                </button>
                
                <button
                  onClick={() => {
                    setShowAccountMenu(false)
                    setShowSignoutModal(true)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-red-600"
                >
                  Logout
                </button>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setShowAccountMenu(false)}
                  className="w-full py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 로그아웃 모달 */}
      <SignoutModal
        isOpen={showSignoutModal}
        onClose={() => setShowSignoutModal(false)}
        onConfirm={() => {
          setShowSignoutModal(false)
          signOut()
        }}
      />
    </div>
  )
}