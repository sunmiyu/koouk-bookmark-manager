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
import NotepadEdgeTab from '@/components/ui-pc/NotepadEdgeTab'
import { motion } from 'framer-motion'

type Json = Database['public']['Tables']['storage_items']['Row']['metadata']
type DbStorageItem = Database['public']['Tables']['storage_items']['Row']
type ViewMode = 'grid' | 'list'

interface FolderViewProps {
  searchQuery?: string
  folders?: FolderItem[]
  selectedFolderId?: string
  currentView?: 'grid' | 'detail'
  onAddItem?: (item: StorageItem, folderId: string) => void
  onFolderSelect?: (folderId: string) => void
  onViewChange?: (view: 'grid' | 'detail') => void
}

export default function FolderView({ 
  searchQuery = '', 
  folders: propFolders,
  selectedFolderId: propSelectedFolderId,
  currentView: propCurrentView,
  onAddItem: propOnAddItem,
  onFolderSelect: propOnFolderSelect,
  onViewChange: propOnViewChange
}: FolderViewProps) {
  const { user, loading: authLoading, signIn } = useAuth()
  const { settings: userSettings, updateSettings: updateUserSettings } = useUserSettings(user?.id)
  
  // State 그룹화 - prop이 있으면 prop 사용, 없으면 내부 state 사용
  const [internalFolders, setInternalFolders] = useState<FolderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sharedFolderIds, setSharedFolderIds] = useState<Set<string>>(new Set())
  
  // View 관련 state
  const [internalSelectedFolderId, setInternalSelectedFolderId] = useState<string>()
  const [internalCurrentView, setInternalCurrentView] = useState<'grid' | 'detail'>('grid')
  
  // Props vs Internal state 결정
  const folders = propFolders ?? internalFolders
  const selectedFolderId = propSelectedFolderId ?? internalSelectedFolderId
  const currentView = propCurrentView ?? internalCurrentView
  const setFolders = propFolders ? (() => {}) : setInternalFolders // prop으로 관리되면 내부 setState 비활성화
  const setSelectedFolderId = propOnFolderSelect ?? setInternalSelectedFolderId
  const setCurrentView = propOnViewChange ?? setInternalCurrentView
  // 🎨 MOBILE-FIRST: Default to list view on mobile, grid on desktop
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'list' : 'grid'
    }
    return 'grid'
  })
  
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
  }, [setSelectedFolderId, setCurrentView, saveSelectedFolder])

  // 🚀 FIX 5: 공통 아이템 추가 함수 (중복 제거) - prop 함수 우선 사용
  const handleAddItem = useCallback(async (item: StorageItem, folderId: string) => {
    // prop으로 받은 함수가 있으면 그것을 사용
    if (propOnAddItem) {
      propOnAddItem(item, folderId)
      return
    }
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

  // 공유된 폴더 ID들을 로드하는 함수
  const loadSharedFolderIds = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const sharedIds = await DatabaseService.getUserSharedFolderIds(user.id)
      setSharedFolderIds(new Set(sharedIds))
    } catch (error) {
      console.error('Failed to load shared folder IDs:', error)
    }
  }, [user?.id])

  // 데이터 로딩
  useEffect(() => {
    if (!user || loadingRef.current) {
      if (!user && mountedRef.current) setIsLoading(false)
      return
    }
    
    loadingRef.current = true

    const loadData = async () => {
      try {
        if (mountedRef.current) setIsLoading(true)
        
        // 폴더 데이터와 공유 정보를 병렬로 로드
        const [dbFolders] = await Promise.all([
          DatabaseService.getUserFolders(user.id) as Promise<Array<{
            id: string
            name: string
            created_at: string
            updated_at: string
            color: string
            icon: string
            storage_items?: DbStorageItem[]
          }>>,
          loadSharedFolderIds()
        ])
        
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
  }, [user?.id, userSettings?.selected_folder_id])

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
  }, [setCurrentView, setSelectedFolderId, user?.id, updateUserSettings])

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
            <span className="text-lg md:text-xl">📁</span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Sign in to manage folders</h3>
          <p className="text-xs text-gray-500 mb-4">Create, organize, and manage your personal content collections</p>
          <button
            onClick={signIn}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
          >
            <span>🚀</span>
            <span>Sign in</span>
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 px-4 py-3">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
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
    <div className="flex flex-col h-full">
      {/* 🎯 메인 컨텐츠 영역 - 타이트한 레이아웃 */}
      <div className="flex-1 overflow-auto">
        {selectedFolder ? (
          <FolderDetail
            folder={selectedFolder}
            onBack={handleBack}
            onItemDelete={handleItemDelete}
            onShareFolder={async (sharedFolderData: SharedFolderData, folder: FolderItem) => {
              if (!user?.id || !mountedRef.current) return
              
              try {
                // 🎯 먼저 기존 공유 확인
                const existingShare = await DatabaseService.getSharedFolderByFolderId(user.id, folder.id)
                const wasUpdate = existingShare !== null
                
                // 공유 또는 업데이트 실행
                const result = await DatabaseService.shareOrUpdateFolder(user.id, folder.id, {
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
                  const message = wasUpdate 
                    ? `🔄 "${sharedFolderData.title}" updated in Market Place!`
                    : `📢 "${sharedFolderData.title}" shared to Market Place!`
                  
                  showSuccess(message)
                  
                  // 공유된 폴더 목록 새로고침
                  await loadSharedFolderIds()
                }
              } catch (error) {
                console.error('Error sharing/updating folder:', error)
                if (mountedRef.current) {
                  showSuccess('Failed to share folder. Please try again.')
                }
              }
            }}
          />
        ) : (
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            {/* 빈 상태 - 폴더를 선택하라는 메시지 */}
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-2xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a folder to view contents
              </h3>
              <p className="text-sm text-gray-500">
                Choose a folder from the sidebar to see your stored items
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* 🎯 메인 컨텐츠 영역 하단 입력바 - fixed 제거 */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        {folders.length > 0 ? (
          <ContentInput
            folders={folders}
            selectedFolderId={selectedFolderId}
            onAddItem={handleAddItem}
            className="border-0 rounded-none"
          />
        ) : (
          <div className="px-4 py-3">
            <div className="text-center py-2">
              <button 
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <span>📁</span>
                <span>Create First Folder</span>
              </button>
            </div>
          </div>
        )}
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
                  className="flex-1 py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
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