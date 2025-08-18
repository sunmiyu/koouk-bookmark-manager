'use client'

import { useState, useEffect } from 'react'
import { FolderItem, StorageItem, createStorageItem } from '@/types/folder'
import { searchEngine } from '@/lib/search-engine'
import FolderGrid from '@/components/ui/FolderGrid'
import FolderDetail from '@/components/ui/FolderDetail'
import FolderSelector from '@/components/ui/FolderSelector'
import ContentInput from '@/components/ui/ContentInput'
import { SharedFolderData } from '@/components/ui/ShareFolderModal'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '../auth/AuthContext'
import { DatabaseService } from '@/lib/database'
import Toast from '@/components/ui/Toast'
import BigNoteModal from '@/components/ui/BigNoteModal'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import SharedContentHandler from '@/components/pwa/SharedContentHandler'
import type { Database } from '@/types/database'
import { analytics } from '@/lib/analytics'
// 🎨 PERFECTION: Import new components
import ContentCard, { ContentGrid } from '@/components/ui/ContentCard'
import SearchHeader, { FilterPills } from '@/components/ui/SearchHeader'
import { motion } from 'framer-motion'

type Json = Database['public']['Tables']['storage_items']['Row']['metadata']
type DbStorageItem = Database['public']['Tables']['storage_items']['Row']

interface MyFolderContentProps {
  searchQuery?: string
}

// 🎨 PERFECTION: View mode state
type ViewMode = 'grid' | 'list'

export default function MyFolderContent({ searchQuery = '' }: MyFolderContentProps) {
  const { user, userSettings, updateUserSettings } = useAuth() // loading 의존성 제거
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid')
  // 🎨 PERFECTION: Enhanced state management
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeFilter, setActiveFilter] = useState('all')
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(true)
  const { toast, showSuccess, hideToast } = useToast()

  // 선택된 폴더
  const selectedFolder = folders.find(f => f.id === selectedFolderId)
  
  // 🎨 PERFECTION: Filter data
  const filterOptions = [
    { id: 'all', label: 'All Folders', count: folders.length },
    { id: 'recent', label: 'Recent', count: folders.filter(f => {
      const created = new Date(f.created_at || Date.now())
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return created > weekAgo
    }).length },
    { id: 'shared', label: 'Shared', count: folders.filter(f => f.is_shared).length },
    { id: 'large', label: 'Large', count: folders.filter(f => f.children.length >= 5).length }
  ]
  
  // 🎨 PERFECTION: Filtered folders
  const filteredFolders = folders.filter(folder => {
    // Text search
    const matchesSearch = !localSearchQuery || 
      folder.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      folder.description?.toLowerCase().includes(localSearchQuery.toLowerCase())
    
    // Filter criteria
    let matchesFilter = true
    if (activeFilter === 'recent') {
      const created = new Date(folder.created_at || Date.now())
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      matchesFilter = created > weekAgo
    } else if (activeFilter === 'shared') {
      matchesFilter = folder.is_shared
    } else if (activeFilter === 'large') {
      matchesFilter = folder.children.length >= 5
    }
    
    return matchesSearch && matchesFilter
  })

  // 데이터베이스에서 데이터 로드 - 개선된 버전
  useEffect(() => {
    // 🔒 핵심: 사용자 인증 및 로딩 상태 체크
    if (!user) {
      console.log('👤 No user found, skipping folder data load')
      setIsLoading(false)
      return
    }
    
    // 🎨 PERFECTION: Set search from props
    if (searchQuery) {
      setLocalSearchQuery(searchQuery)
    }

    // loading 상태 체크 제거 - user 상태만으로 충분

    const loadData = async () => {
      try {
        setIsLoading(true)
        console.log('Loading folders for user:', user.email)
        
        // ✅ 안전한 데이터베이스 호출
        const dbFolders = await DatabaseService.getUserFolders(user.id) as Array<{
          id: string
          name: string
          created_at: string
          updated_at: string
          color: string
          icon: string
          storage_items?: DbStorageItem[]
        }>
        
        // 데이터베이스 형식을 기존 FolderItem 형식으로 변환
        const convertedFolders: FolderItem[] = dbFolders.map(dbFolder => {
          const storageItems = dbFolder.storage_items || []
          
          const children: StorageItem[] = storageItems.map((item: DbStorageItem) => ({
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
          }))

          return {
            id: dbFolder.id,
            name: dbFolder.name,
            type: 'folder' as const,
            children,
            createdAt: dbFolder.created_at,
            updatedAt: dbFolder.updated_at,
            color: dbFolder.color,
            icon: dbFolder.icon
          }
        })

        setFolders(convertedFolders)

        // 사용자 설정에서 선택된 폴더 복원
        if (userSettings?.selected_folder_id) {
          const selectedFolder = convertedFolders.find(f => f.id === userSettings.selected_folder_id)
          if (selectedFolder) {
            setSelectedFolderId(userSettings.selected_folder_id)
            setCurrentView('detail')
          }
        }

        // 검색 엔진 인덱스 업데이트
        searchEngine.updateIndex(convertedFolders)
        console.log('✅ Folders loaded successfully:', convertedFolders.length)
        
      } catch (error) {
        console.error('❌ Failed to load folders:', error)
        
        // 🚨 토큰 에러 구체적 처리
        if ((error as Error)?.message?.includes('No authorization token') || 
            (error as Error)?.message?.includes('JWT') || 
            (error as Error)?.message?.includes('authorization')) {
          console.error('🚨 Authorization token missing - user may need to re-login')
          // 선택적: 사용자에게 재로그인 안내
        }
        
        setFolders([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id, userSettings, user]) // 🔧 loading 제거하여 무한루프 방지

  // 폴더 선택 상태 저장
  const saveSelectedFolder = async (folderId: string) => {
    if (!user?.id || !updateUserSettings) {
      console.log('👤 No user or updateUserSettings function available')
      return
    }
    
    try {
      await updateUserSettings({ selected_folder_id: folderId })
    } catch (error) {
      console.error('Failed to save selected folder:', error)
      
      // 🚨 토큰 에러 처리
      if ((error as Error)?.message?.includes('No authorization token')) {
        console.error('🚨 Authorization token missing for saving folder selection')
      }
    }
  }

  // 폴더 관련 핸들러
  const handleFoldersChange = (newFolders: FolderItem[]) => {
    setFolders(newFolders)
    // 검색 엔진 인덱스 업데이트
    searchEngine.updateIndex(newFolders)
  }

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    setCurrentView('detail')
    saveSelectedFolder(folderId)
  }

  const handleFolderSelectFromGrid = (folder: FolderItem) => {
    handleFolderSelect(folder.id)
  }

  // 폴더 생성
  const handleCreateFolder = () => {
    setNewFolderName('')
    setShowCreateFolderModal(true)
  }

  const handleConfirmCreateFolder = async () => {
    if (!user?.id) {
      console.error('❌ No user found for folder creation')
      showSuccess('Please sign in to create folders')
      return
    }
    
    const folderName = newFolderName.trim() || 'New Folder'
    
    try {
      console.log('Creating folder for user:', user.email)
      
      // ✅ 안전한 데이터베이스 호출
      const dbFolder = await DatabaseService.createFolder(user.id, {
        name: folderName,
        color: '#3B82F6',
        icon: '',
        sort_order: 0
      })

      // 로컬 상태에 새 폴더 추가
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
      
      const newFolders = [newFolder, ...folders]
      handleFoldersChange(newFolders)
      
      // GA4 이벤트 추적
      analytics.createFolder(folderName)
      
      // 새 폴더 선택
      handleFolderSelect(newFolder.id)
      
      // 모달 닫기
      setShowCreateFolderModal(false)
      setNewFolderName('')
      
      console.log('✅ Folder created successfully:', folderName)
      
    } catch (error) {
      console.error('❌ Failed to create folder:', error)
      
      // 🚨 토큰 에러 처리
      if ((error as Error)?.message?.includes('No authorization token') || 
          (error as Error)?.message?.includes('JWT') || 
          (error as Error)?.message?.includes('authorization')) {
        console.error('🚨 Authorization token missing for folder creation')
        showSuccess('Please sign in again to create folders')
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create folder'
        showSuccess(errorMessage)
      }
      // 에러 시 모달은 닫지 않고 사용자가 다시 시도할 수 있도록 유지
    }
  }

  // 아이템 추가
  const handleAddItem = async (item: StorageItem, folderId: string) => {
    if (!user?.id) {
      console.error('❌ No user found for item creation')
      showSuccess('Please sign in to add items')
      return
    }
    
    try {
      console.log('Adding item for user:', user.email)
      
      // ✅ 안전한 데이터베이스 호출
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

      // 로컬 상태 업데이트
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
      console.log('✅ Item added successfully:', item.name)
      
    } catch (error) {
      console.error('❌ Failed to add item:', error)
      
      // 🚨 토큰 에러 처리
      if ((error as Error)?.message?.includes('No authorization token') || 
          (error as Error)?.message?.includes('JWT') || 
          (error as Error)?.message?.includes('authorization')) {
        console.error('🚨 Authorization token missing for item creation')
        showSuccess('Please sign in again to add items')
      } else {
        showSuccess('Failed to add item')
      }
    }
  }

  // 아이템 삭제
  const handleItemDelete = async (itemId: string) => {
    if (!selectedFolderId || !user?.id) {
      console.error('❌ No user or selected folder for item deletion')
      return
    }
    
    try {
      console.log('🗑️ Deleting item for user:', user.email)
      
      // ✅ 안전한 데이터베이스 호출
      await DatabaseService.deleteStorageItem(itemId)

      // 로컬 상태 업데이트
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
      console.log('✅ Item deleted successfully')
      
    } catch (error) {
      console.error('❌ Failed to delete item:', error)
      
      // 🚨 토큰 에러 처리
      if ((error as Error)?.message?.includes('No authorization token') || 
          (error as Error)?.message?.includes('JWT') || 
          (error as Error)?.message?.includes('authorization')) {
        console.error('🚨 Authorization token missing for item deletion')
        showSuccess('Please sign in again to delete items')
      } else {
        showSuccess('Failed to delete item')
      }
    }
  }

  // 뒤로 가기
  const handleBack = async () => {
    setCurrentView('grid')
    setSelectedFolderId(undefined)
    
    // 사용자 설정에서 선택된 폴더 클리어
    if (user?.id && updateUserSettings) {
      try {
        await updateUserSettings({ selected_folder_id: null })
      } catch (error) {
        console.error('Failed to clear selected folder:', error)
        
        // 🚨 토큰 에러 처리
        if ((error as Error)?.message?.includes('No authorization token')) {
          console.error('🚨 Authorization token missing for clearing folder selection')
        }
      }
    }
  }

  // 폴더 공유
  const handleShareFolder = async (sharedFolderData: SharedFolderData, folder: FolderItem) => {
    if (!user?.id) {
      console.error('❌ No user found for folder sharing')
      showSuccess('Please sign in to share folders')
      return
    }
    
    try {
      console.log('📢 Sharing folder for user:', user.email)
      
      // ✅ 안전한 데이터베이스 호출
      const dbSharedFolder = await DatabaseService.createSharedFolder(user.id, {
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

      showSuccess(`📢 "${sharedFolderData.title}" has been shared to Market Place!`)
      console.log('✅ Folder shared successfully:', dbSharedFolder)
      
    } catch (error) {
      console.error('❌ Error sharing folder:', error)
      
      // 🚨 토큰 에러 처리
      if ((error as Error)?.message?.includes('No authorization token') || 
          (error as Error)?.message?.includes('JWT') || 
          (error as Error)?.message?.includes('authorization')) {
        console.error('🚨 Authorization token missing for folder sharing')
        showSuccess('Please sign in again to share folders')
      } else {
        showSuccess('Failed to share folder. Please try again.')
      }
    }
  }

  // 노트 저장 핸들러
  const handleSaveNote = (title: string, content: string, folderId: string) => {
    if (!folderId) {
      alert('Please select a folder first')
      return
    }

    if (!user?.id) {
      showSuccess('Please sign in to save notes')
      return
    }

    // 콘텐츠 길이에 따라 memo 또는 document 타입 결정
    const type = content.length > 500 ? 'document' : 'memo'
    const noteItem = createStorageItem(title, type, content, folderId)
    handleAddItem(noteItem, folderId)
    showSuccess(`"${title}" saved successfully!`)
  }

  // 🔒 인증되지 않은 사용자 처리
  if (!user) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          {/* AuthContext loading 처리 제거 - 로그인 여부는 user 상태만으로 판단 */}
          {false ? (
            <>
              <div className="space-y-4 max-w-xs mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            </>
          ) : (
            <div className="text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">&nbsp;</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Please sign in</h3>
              <p className="text-xs text-gray-500">Sign in to access your folders</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 🚀 OPTIMIZATION 14: Enhanced progressive loading with folder grid skeleton
  if (isLoading) {
    return (
      <div className="flex-1 p-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-32 animate-pulse"></div>
          <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Folder grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating loading indicator */}
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Loading your folders...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🎨 PERFECTION: Enhanced header */}
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
      
      {/* 🎨 PERFECTION: Filter pills */}
      <FilterPills 
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 pb-32 bg-gray-50">
        {currentView === 'grid' ? (
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredFolders.length === 0 ? (
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
              <ContentGrid>
                {filteredFolders.map((folder, index) => (
                  <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ContentCard
                      type="folder"
                      title={folder.name}
                      description={folder.description || `${folder.children.length} items`}
                      metadata={{
                        tags: folder.tags,
                        fileSize: folder.is_shared ? 'Shared' : 'Private'
                      }}
                      onClick={() => handleFolderSelectFromGrid(folder.id)}
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
            onShareFolder={handleShareFolder}
            searchQuery={localSearchQuery}
          />
        ) : null}
      </div>

      {/* 입력 시스템 - 페이지 최하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-lg z-40">
        <div className="px-3 pt-1.5 pb-2.5 max-w-screen-xl mx-auto">
          {/* 폴더 선택 키워드 - 입력바에 바짝 붙임 */}
          {folders.length > 0 && (
            <FolderSelector
              folders={folders}
              selectedFolderId={selectedFolderId}
              onFolderSelect={handleFolderSelect}
              onCreateFolder={handleCreateFolder}
              onOpenBigNote={() => setShowBigNoteModal(true)}
              className="mb-1"
            />
          )}
          
          {/* 콘텐츠 입력 */}
          {folders.length > 0 && (
            <ContentInput
              folders={folders}
              selectedFolderId={selectedFolderId}
              onAddItem={handleAddItem}
            />
          )}
        </div>
      </div>

      {/* 폴더 생성 모달 */}
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

      {/* Big Note Modal */}
      <BigNoteModal
        isOpen={showBigNoteModal}
        onClose={() => setShowBigNoteModal(false)}
        onSave={handleSaveNote}
        allFolders={folders}
        selectedFolderId={selectedFolderId}
      />

      {/* PWA Components */}
      {showInstallPrompt && (
        <InstallPrompt onDismiss={() => setShowInstallPrompt(false)} />
      )}
      
      <SharedContentHandler
        onAddItem={handleAddItem}
        folders={folders}
        selectedFolderId={selectedFolderId}
      />

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  )
}