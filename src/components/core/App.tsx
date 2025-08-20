'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { FolderItem, StorageItem } from '@/types/folder'
import { DatabaseService } from '@/lib/database'
import Sidebar from '../layout/Sidebar'
import MainContent from '../layout/MainContent'
import LoginModal from '../auth/LoginModal'
import FeedbackModal from '../modals/FeedbackModal'
import { useDevice } from '@/hooks/useDevice'
import { useToast } from '@/hooks/useToast'
import Toast from '../ui/Toast'

type TabType = 'storage' | 'bookmarks' | 'marketplace'

export default function App() {
  const device = useDevice()
  const { user, loading, signIn, signOut } = useAuth()
  const status = loading ? 'loading' : (user ? 'authenticated' : 'idle')
  const { toast, showSuccess, showError, hideToast } = useToast()
  
  const [activeTab, setActiveTab] = useState<TabType>('storage')
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [marketplaceView, setMarketplaceView] = useState<'marketplace' | 'my-shared'>('marketplace')

  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  // 🎯 사이드바 폴더 선택 핸들러 - 뷰 전환 포함
  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    // My Folder 탭에서만 detail 뷰로 전환
    if (activeTab === 'storage') {
      setCurrentView('detail')
    }
  }

  // 🎯 뷰 변경 핸들러
  const handleViewChange = (view: 'grid' | 'detail') => {
    setCurrentView(view)
    if (view === 'grid') {
      setSelectedFolderId(undefined)
    }
  }

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

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

  if (device.width < 768) {
    return (
      <div className="min-h-screen bg-gray-50">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl">
              <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                folders={folders}
                selectedFolderId={selectedFolderId}
                onFolderSelect={handleFolderSelect}
                onCreateFolder={() => setShowCreateFolderModal(true)}
                marketplaceView={marketplaceView}
                onMarketplaceViewChange={setMarketplaceView}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col h-screen">
          {/* 🎯 모바일 헤더 - 독립적인 영역 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              ☰
            </button>
            
            <h1 className="font-bold text-gray-900">
              KOOUK
            </h1>
            
            <button 
              onClick={() => setShowFeedbackModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              💬
            </button>
          </div>

          {/* 🎯 모바일 메인 컨텐츠 - 입력바 포함 */}
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
              onViewChange={handleViewChange}
            />
          </div>

          {/* 🎯 모바일 하단 탭 네비게이션 */}
          <div className="flex bg-white border-t border-gray-200 flex-shrink-0">
            {(['storage', 'bookmarks', 'marketplace'] as TabType[]).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex flex-col items-center py-3 ${
                  activeTab === tab ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <span className="text-lg mb-1">
                  {tab === 'storage' && ''}
                  {tab === 'bookmarks' && ''}
                  {tab === 'marketplace' && ''}
                </span>
                <span className="text-xs capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 🎯 완전 분리된 사이드바 - 독립적인 영역 */}
      <div className="w-80 flex-shrink-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={handleFolderSelect}
          onCreateFolder={() => setShowCreateFolderModal(true)}
          marketplaceView={marketplaceView}
          onMarketplaceViewChange={setMarketplaceView}
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
    </div>
  )
}