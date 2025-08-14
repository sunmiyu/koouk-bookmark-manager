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
import { useAuth } from '@/components/auth/AuthContext'
import { DatabaseService } from '@/lib/database'
import Toast from '@/components/ui/Toast'
import BigNoteModal from '@/components/ui/BigNoteModal'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import SharedContentHandler from '@/components/pwa/SharedContentHandler'
import type { Database } from '@/types/database'

type Json = Database['public']['Tables']['storage_items']['Row']['metadata']

// type DbFolder = Database['public']['Tables']['folders']['Row']
type DbStorageItem = Database['public']['Tables']['storage_items']['Row']

interface MyFolderContentProps {
  searchQuery?: string
}

export default function MyFolderContent({ searchQuery = '' }: MyFolderContentProps) {
  const { user, userSettings, updateUserSettings } = useAuth()
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(true)
  const { toast, showSuccess, hideToast } = useToast()

  // 선택된 폴더
  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  // 데이터베이스에서 데이터 로드
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Supabase에서 폴더와 아이템 데이터 로드
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
        
      } catch (error) {
        console.error('Failed to load folders:', error)
        setFolders([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, userSettings])

  // 폴더 선택 상태 저장
  const saveSelectedFolder = async (folderId: string) => {
    if (!user || !updateUserSettings) return
    
    try {
      await updateUserSettings({ selected_folder_id: folderId })
    } catch (error) {
      console.error('Failed to save selected folder:', error)
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
    if (!user) return
    
    const folderName = newFolderName.trim() || 'New Folder'
    
    try {
      // 데이터베이스에 새 폴더 생성
      const dbFolder = await DatabaseService.createFolder(user.id, {
        name: folderName,
        color: '#3B82F6',
        icon: '📁',
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
      
      // 새 폴더 선택
      handleFolderSelect(newFolder.id)
      
      // 모달 닫기
      setShowCreateFolderModal(false)
      setNewFolderName('')
      
    } catch (error) {
      console.error('Failed to create folder:', error)
      // 에러 메시지 개선
      const errorMessage = error instanceof Error ? error.message : 'Failed to create folder'
      showSuccess(errorMessage) // Toast로 에러 메시지 표시
      // 모달은 닫지 않고 사용자가 다시 시도할 수 있도록 유지
    }
  }

  // 아이템 추가
  const handleAddItem = async (item: StorageItem, folderId: string) => {
    if (!user) return
    
    try {
      // 데이터베이스에 새 아이템 생성
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
      
    } catch (error) {
      console.error('Failed to add item:', error)
      showSuccess('Failed to add item')
    }
  }

  // 아이템 삭제
  const handleItemDelete = async (itemId: string) => {
    if (!selectedFolderId) return
    
    try {
      // 데이터베이스에서 아이템 삭제
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
      
    } catch (error) {
      console.error('Failed to delete item:', error)
      showSuccess('Failed to delete item')
    }
  }

  // 뒤로 가기
  const handleBack = async () => {
    setCurrentView('grid')
    setSelectedFolderId(undefined)
    
    // 사용자 설정에서 선택된 폴더 클리어
    if (user && updateUserSettings) {
      try {
        await updateUserSettings({ selected_folder_id: null })
      } catch (error) {
        console.error('Failed to clear selected folder:', error)
      }
    }
  }

  // 폴더 공유
  const handleShareFolder = async (sharedFolderData: SharedFolderData, folder: FolderItem) => {
    if (!user) return
    
    try {
      // 데이터베이스에 공유 폴더 생성
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
      
      console.log('Folder shared successfully:', dbSharedFolder)
    } catch (error) {
      console.error('Error sharing folder:', error)
      showSuccess('Failed to share folder. Please try again.')
    }
  }

  // 노트 저장 핸들러
  const handleSaveNote = (title: string, content: string, folderId: string) => {
    if (!folderId) {
      alert('Please select a folder first')
      return
    }

    // 콘텐츠 길이에 따라 memo 또는 document 타입 결정
    const type = content.length > 500 ? 'document' : 'memo'
    const noteItem = createStorageItem(title, type, content, folderId)
    handleAddItem(noteItem, folderId)
    showSuccess(`📝 "${title}" saved successfully!`)
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
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
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 메인 콘텐츠 */}
      <div className="flex-1 pb-32">
        {currentView === 'grid' ? (
          <FolderGrid
            folders={folders}
            onFolderSelect={handleFolderSelectFromGrid}
            onCreateFolder={handleCreateFolder}
            searchQuery={searchQuery}
          />
        ) : selectedFolder ? (
          <FolderDetail
            folder={selectedFolder}
            onBack={handleBack}
            onItemDelete={handleItemDelete}
            onShareFolder={handleShareFolder}
            searchQuery={searchQuery}
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