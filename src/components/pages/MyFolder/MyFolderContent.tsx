'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { FolderItem, StorageItem, createStorageItem } from '@/types/folder'
import { searchEngine } from '@/lib/search-engine'
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
import InstallPrompt from '@/components/pwa/InstallPrompt'
import SharedContentHandler from '@/components/pwa/SharedContentHandler'
import type { Database } from '@/types/database'
import { analytics } from '@/lib/analytics'
import EnhancedContentCard, { ContentGrid } from '@/components/ui/EnhancedContentCard'
import SearchHeader, { FilterPills } from '@/components/ui/SearchHeader'
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
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  
  // Search & Filter 관련 state
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [activeFilter, setActiveFilter] = useState('all')
  
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
    searchEngine.updateIndex(newFolders)
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

        searchEngine.updateIndex(convertedFolders)
        
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
            <span className="text-2xl">👤</span>
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
      <SearchHeader 
        title="My Folders"
        searchPlaceholder="Search folders and content..."
        onSearch={setLocalSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actionButton={{
          label: "New Folder",
          onClick: () => setShowCreateFolderModal(true),
          icon: "📁"
        }}
      />
      
      <FilterPills 
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      
      <div className="flex-1 pb-32 bg-gray-50">
        {currentView === 'grid' ? (
          <div className="p-6">
            {filteredFolders.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
              <div className={viewMode === 'grid' ? '' : 'space-y-2 p-6'}>
                {viewMode === 'grid' ? (
                  <ContentGrid>
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
                          size="medium"
                          layout="grid"
                        />
                      </motion.div>
                    ))}
                  </ContentGrid>
                ) : (
                  // List view
                  <div className="space-y-2">
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
                          size="small"
                          layout="list"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
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

      {/* Input System */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40">
        <div className="px-3 pt-1.5 pb-2.5 max-w-screen-xl mx-auto">
          {folders.length > 0 && (
            <>
              <FolderSelector
                folders={folders}
                selectedFolderId={selectedFolderId}
                onFolderSelect={handleFolderSelect}
                onCreateFolder={() => setShowCreateFolderModal(true)}
                onOpenBigNote={() => setShowBigNoteModal(true)}
                className="mb-1"
              />
              
              <ContentInput
                folders={folders}
                selectedFolderId={selectedFolderId}
                onAddItem={handleAddItem}
              />
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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

      {showInstallPrompt && (
        <InstallPrompt onDismiss={() => setShowInstallPrompt(false)} />
      )}
      
      <SharedContentHandler
        onAddItem={handleAddItem}
        folders={folders}
        selectedFolderId={selectedFolderId}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* Notepad Edge Tab - Only shows on wide screens */}
      <NotepadEdgeTab
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSave={handleSaveNote}
      />
    </div>
  )
}