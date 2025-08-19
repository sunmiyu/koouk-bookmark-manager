'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { FolderItem, StorageItem, createStorageItem } from '@/types/folder'
// import { searchEngine } from '@/lib/search-engine'
import FolderGrid from '@/components/ui/FolderGrid'
import FolderDetail from '@/components/ui/FolderDetail'
import FolderSelector from '@/components/ui/FolderSelector'
import ContentInput from '@/components/ui/ContentInput'
import { SharedFolderData } from '@/components/ui/ShareFolderModal'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUserSettings } from '@/hooks/useUserSettings'
import { DatabaseService } from '@/lib/database'
import Toast from '@/components/ui/Toast'
import BigNoteModal from '@/components/ui/BigNoteModal'
// import InstallPrompt from '@/components/pwa/InstallPrompt'
// import SharedContentHandler from '@/components/pwa/SharedContentHandler'
import type { Database } from '@/types/database'
import { analytics } from '@/lib/analytics'
import EnhancedContentCard, { ContentGrid } from '@/components/ui/EnhancedContentCard'
// SearchHeader and FilterPills removed
import NotepadEdgeTab from '@/components/ui/NotepadEdgeTab'
import { motion } from 'framer-motion'

type Json = Database['public']['Tables']['storage_items']['Row']['metadata']
type DbStorageItem = Database['public']['Tables']['storage_items']['Row']
type ViewMode = 'grid' | 'list'

interface MyFolderContentProps {
  searchQuery?: string
}

export default function MyFolderContent({ searchQuery = '' }: MyFolderContentProps) {
  const { user, loading: authLoading } = useAuth()
  const { settings: userSettings, updateSettings: updateUserSettings } = useUserSettings(user?.id)
  
  // State 그룹화
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // View 관련 state
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid')
  // 🎨 MOBILE-FIRST: Default to list view on mobile, grid on desktop
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'list' : 'grid'
    }
    return 'grid'
  })
  
  // Search & Filter 관련 state
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [activeFilter, setActiveFilter] = useState('all')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  
  // Modal 관련 state
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(true)
  
  const { toast, showSuccess, hideToast } = useToast()
  
  // 🚀 FIX 2: 메모리 누수 방지를 위한 refs
  const loadingRef = useRef(false)
  const mountedRef = useRef(false)

  // 🚀 FIX 3: 컴포넌트 mount 상태 관리
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // 메모이제이션
  const selectedFolder = useMemo(() => 
    folders.find(f => f.id === selectedFolderId), 
    [folders, selectedFolderId]
  )
  
  const filterOptions = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    
    return [
      { id: 'all', label: 'All Folders', count: folders.length },
      { 
        id: 'recent', 
        label: 'Recent', 
        count: folders.filter(f => new Date(f.createdAt || now).getTime() > weekAgo).length 
      },
      { id: 'shared', label: 'Shared', count: folders.filter(f => f.is_shared).length },
      { id: 'large', label: 'Large', count: folders.filter(f => f.children.length >= 5).length }
    ]
  }, [folders])
  
  const filteredFolders = useMemo(() => {
    return folders.filter(folder => {
      // Text search
      if (localSearchQuery) {
        const query = localSearchQuery.toLowerCase()
        const matchesName = folder.name.toLowerCase().includes(query)
        const matchesDescription = folder.description?.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription) return false
      }
      
      // Filter criteria
      if (activeFilter === 'recent') {
        const created = new Date(folder.createdAt || Date.now()).getTime()
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        return created > weekAgo
      } else if (activeFilter === 'shared') {
        return folder.is_shared
      } else if (activeFilter === 'large') {
        return folder.children.length >= 5
      }
      
      return true
    })
  }, [folders, localSearchQuery, activeFilter])

  // 🚀 FIX 4: 공통 함수들 - DRY 원칙 적용
  const handleFoldersChange = useCallback((newFolders: FolderItem[]) => {
    if (!mountedRef.current) return
    setFolders(newFolders)
    // searchEngine.updateIndex(newFolders)
  }, [])

  const saveSelectedFolder = useCallback(async (folderId: string) => {
    if (!user?.id || !updateUserSettings || !mountedRef.current) return
    
    try {
      await updateUserSettings({ selected_folder_id: folderId })
    } catch (error) {
      console.error('Failed to save selected folder:', error)
    }
  }, [user?.id, updateUserSettings])

  const handleFolderSelect = useCallback((folderId: string) => {
    if (!mountedRef.current) return
    setSelectedFolderId(folderId)
    setCurrentView('detail')
    saveSelectedFolder(folderId)
  }, [saveSelectedFolder])

  // 🚀 FIX 5: 공통 아이템 추가 함수 (중복 제거)
  const handleAddItem = useCallback(async (item: StorageItem, folderId: string) => {
    if (!user?.id || !mountedRef.current) {
      showSuccess('Please sign in to add items')
      return
    }
    
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
        metadata: (item.metadata as Json) || {},
        sort_order: 0
      })

      if (!mountedRef.current) return // async 작업 후 mount 체크

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
      
      handleFoldersChange(updatedFolders)
    } catch (error) {
      console.error('Failed to add item:', error)
      if (mountedRef.current) {
        showSuccess('Failed to add item')
      }
    }
  }, [user?.id, folders, handleFoldersChange, showSuccess])

  // 🚀 FIX 6: 메모리 안전한 아이템 삭제
  const handleItemDelete = useCallback(async (itemId: string) => {
    if (!selectedFolderId || !user?.id || !mountedRef.current) return
    
    try {
      await DatabaseService.deleteStorageItem(itemId)
      
      if (!mountedRef.current) return // async 작업 후 mount 체크
      
      const updatedFolders = folders.map(folder => {
        if (folder.id === selectedFolderId) {
          return {
            ...folder,
            children: folder.children.filter(item => item.id !== itemId),
            updatedAt: new Date().toISOString()
          }
        }
        return folder
      })
      handleFoldersChange(updatedFolders)
    } catch (error) {
      console.error('Failed to delete item:', error)
      if (mountedRef.current) {
        showSuccess('Failed to delete item')
      }
    }
  }, [selectedFolderId, user?.id, folders, handleFoldersChange, showSuccess])

  // 데이터 로딩
  useEffect(() => {
    if (!user || loadingRef.current) {
      if (!user && mountedRef.current) setIsLoading(false)
      return
    }
    
    loadingRef.current = true
    
    // props에서 받은 searchQuery 설정
    if (searchQuery !== localSearchQuery && mountedRef.current) {
      setLocalSearchQuery(searchQuery)
    }

    const loadData = async () => {
      try {
        if (mountedRef.current) setIsLoading(true)
        
        const dbFolders = await DatabaseService.getUserFolders(user.id) as Array<{
          id: string
          name: string
          created_at: string
          updated_at: string
          color: string
          icon: string
          storage_items?: DbStorageItem[]
        }>
        
        if (!mountedRef.current) return // async 작업 후 mount 체크
        
        const convertedFolders: FolderItem[] = dbFolders.map(dbFolder => ({
          id: dbFolder.id,
          name: dbFolder.name,
          type: 'folder' as const,
          children: (dbFolder.storage_items || []).map((item: DbStorageItem) => ({
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

        if (!mountedRef.current) return
        
        setFolders(convertedFolders)

        // 사용자 설정 복원
        if (userSettings?.selected_folder_id && mountedRef.current) {
          const selectedFolder = convertedFolders.find(f => f.id === userSettings.selected_folder_id)
          if (selectedFolder) {
            setSelectedFolderId(userSettings.selected_folder_id)
            setCurrentView('detail')
          }
        }

        // searchEngine.updateIndex(convertedFolders)
        
      } catch (error) {
        console.error('❌ Failed to load folders:', error)
        
        if ((error as Error)?.message?.includes('authorization')) {
          console.error('🚨 Authorization error - user may need to re-login')
        }
        
        if (mountedRef.current) {
          setFolders([])
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
        loadingRef.current = false
      }
    }

    loadData()
  }, [user?.id, userSettings?.selected_folder_id, searchQuery])

  // 폴더 생성
  const handleConfirmCreateFolder = useCallback(async () => {
    if (!user?.id || !mountedRef.current) {
      showSuccess('Please sign in to create folders')
      return
    }
    
    const folderName = newFolderName.trim() || 'New Folder'
    
    try {
      const dbFolder = await DatabaseService.createFolder(user.id, {
        name: folderName,
        color: '#3B82F6',
        icon: '',
        sort_order: 0
      })

      if (!mountedRef.current) return

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
      
      handleFoldersChange([newFolder, ...folders])
      analytics.createFolder(folderName)
      handleFolderSelect(newFolder.id)
      
      setShowCreateFolderModal(false)
      setNewFolderName('')
      
    } catch (error) {
      console.error('❌ Failed to create folder:', error)
      
      if (mountedRef.current) {
        if ((error as Error)?.message?.includes('authorization')) {
          showSuccess('Please sign in again to create folders')
        } else {
          showSuccess('Failed to create folder')
        }
      }
    }
  }, [user?.id, newFolderName, folders, handleFoldersChange, handleFolderSelect, showSuccess])

  // 🚀 FIX 7: 백 핸들러 최적화
  const handleBack = useCallback(() => {
    if (!mountedRef.current) return
    
    setCurrentView('grid')
    setSelectedFolderId(undefined)
    
    if (user?.id && updateUserSettings) {
      updateUserSettings({ selected_folder_id: null }).catch(console.error)
    }
  }, [user?.id, updateUserSettings])

  // 🚀 FIX 8: 노트 저장 핸들러 최적화
  const handleSaveNote = useCallback((title: string, content: string, folderId: string) => {
    if (!folderId || !user?.id || !mountedRef.current) {
      showSuccess('Please select a folder and sign in')
      return
    }
    
    const type = content.length > 500 ? 'document' : 'memo'
    const noteItem = createStorageItem(title, type, content, folderId)
    
    handleAddItem(noteItem, folderId).then(() => {
      if (mountedRef.current) {
        showSuccess(`"${title}" saved successfully!`)
      }
    }).catch(() => {
      if (mountedRef.current) {
        showSuccess('Failed to save note')
      }
    })
  }, [user?.id, handleAddItem, showSuccess])

  // Early returns
  if (authLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-lg md:text-xl">👤</span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Please sign in</h3>
          <p className="text-xs text-gray-500">Sign in to access your folders</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 📱 MOBILE-OPTIMIZED Header with search */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900">My Folders</h1>
            
            {/* 📱 Mobile search toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* 📱 Mobile memo button */}
            <button
              onClick={() => setShowBigNoteModal(true)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={folders.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          
          {/* View mode toggle - smaller on mobile */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 📱 Mobile search bar - shows when active */}
        {showMobileSearch && (
          <div className="mt-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                placeholder="Search folders..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                onClick={() => {
                  setLocalSearchQuery('')
                  setShowMobileSearch(false)
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      
      <div className="flex-1 pb-20 bg-gray-50">
        {currentView === 'grid' ? (
          <div className="p-6">
            {filteredFolders.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-2xl md:text-3xl mb-4">📁</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {folders.length === 0 ? 'No folders yet' : 'No folders match your search'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {folders.length === 0 
                    ? 'Create your first folder to start organizing'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {folders.length === 0 && (
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <span>📁</span>
                    <span>Create First Folder</span>
                  </button>
                )}
              </motion.div>
            ) : (
              <ContentGrid layout={viewMode}>
                {filteredFolders.map((folder, index) => (
                  <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <EnhancedContentCard
                      type="folder"
                      title={folder.name}
                      description={folder.description || `${folder.children.length} items`}
                      metadata={{
                        tags: folder.tags,
                        fileSize: folder.is_shared ? 'Shared' : 'Private',
                        children: folder.children // Pass folder children for automatic thumbnail generation
                      }}
                      onClick={() => handleFolderSelect(folder.id)}
                      size={viewMode === 'list' ? 'small' : 'medium'}
                      layout={viewMode}
                    />
                  </motion.div>
                ))}
              </ContentGrid>
            )}
          </div>
        ) : selectedFolder ? (
          <FolderDetail
            folder={selectedFolder}
            onBack={handleBack}
            onItemDelete={handleItemDelete}
            onShareFolder={async (sharedFolderData: SharedFolderData, folder: FolderItem) => {
              if (!user?.id || !mountedRef.current) return
              
              try {
                await DatabaseService.createSharedFolder(user.id, {
                  folder_id: folder.id,
                  title: sharedFolderData.title,
                  description: sharedFolderData.description,
                  cover_image: sharedFolderData.coverImage,
                  category: sharedFolderData.category,
                  tags: sharedFolderData.tags,
                  is_public: true,
                  stats: {
                    views: 0,
                    likes: 0,
                    helpful: 0,
                    notHelpful: 0,
                    shares: 0,
                    downloads: 0,
                    urls: sharedFolderData.stats.urls,
                    videos: sharedFolderData.stats.videos,
                    documents: sharedFolderData.stats.documents,
                    images: sharedFolderData.stats.images,
                    total: sharedFolderData.stats.total
                  }
                })
                if (mountedRef.current) {
                  showSuccess(`📢 "${sharedFolderData.title}" has been shared to Market Place!`)
                }
              } catch (error) {
                console.error('Error sharing folder:', error)
                if (mountedRef.current) {
                  showSuccess('Failed to share folder. Please try again.')
                }
              }
            }}
            searchQuery={localSearchQuery}
          />
        ) : null}
      </div>

      {/* 📱 MOBILE-OPTIMIZED Input System - Compact bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="px-4 py-3 max-w-screen-xl mx-auto">
          {folders.length > 0 ? (
            <div className="flex items-center gap-3">
              {/* Selected folder indicator */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {selectedFolder ? selectedFolder.name.charAt(0).toUpperCase() : '+'}
                </div>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {selectedFolder ? selectedFolder.name : 'Select folder'}
                </span>
              </div>
              
              {/* Quick actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Add content button */}
                <button 
                  onClick={() => setShowBigNoteModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  disabled={!selectedFolderId}
                >
                  <span className="text-xs">+</span>
                  <span className="hidden sm:inline">Add</span>
                </button>
                
                {/* New folder button */}
                <button 
                  onClick={() => setShowCreateFolderModal(true)}
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <span className="text-sm">📁</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <button 
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <span>📁</span>
                <span>Create First Folder</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Create New Folder
              </h3>
              
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g., Work, Personal, Ideas...)"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmCreateFolder()}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreateFolder}
                  className="flex-1 py-2.5 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BigNoteModal
        isOpen={showBigNoteModal}
        onClose={() => setShowBigNoteModal(false)}
        onSave={handleSaveNote}
        allFolders={folders}
        selectedFolderId={selectedFolderId}
      />

      {/* Disabled for SUNO-style approach
      {showInstallPrompt && (
        <InstallPrompt onDismiss={() => setShowInstallPrompt(false)} />
      )}
      
      <SharedContentHandler
        onAddItem={handleAddItem}
        folders={folders}
        selectedFolderId={selectedFolderId}
      />
      */}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* Notepad Edge Tab - Only shows on wide screens (desktop only) */}
      <div className="hidden xl:block">
        <NotepadEdgeTab
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSave={handleSaveNote}
        />
      </div>
    </div>
  )
}