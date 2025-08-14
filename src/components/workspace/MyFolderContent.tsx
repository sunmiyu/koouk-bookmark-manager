'use client'

import { useState, useEffect } from 'react'
import { FolderItem, StorageItem, createFolder, createStorageItem } from '@/types/folder'
import { searchEngine } from '@/lib/search-engine'
import FolderGrid from '@/components/ui/FolderGrid'
import FolderDetail from '@/components/ui/FolderDetail'
import FolderSelector from '@/components/ui/FolderSelector'
import ContentInput from '@/components/ui/ContentInput'
import { SharedFolderData } from '@/components/ui/ShareFolderModal'
import { SharedFolder, ShareCategory } from '@/types/share'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/ui/Toast'
import BigNoteModal from '@/components/ui/BigNoteModal'

interface MyFolderContentProps {
  searchQuery?: string
}

export default function MyFolderContent({ searchQuery = '' }: MyFolderContentProps) {
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)
  const { toast, showSuccess, hideToast } = useToast()

  // 선택된 폴더
  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const loadData = () => {
      try {
        const savedFolders = localStorage.getItem('koouk-folders')
        const savedSelectedId = localStorage.getItem('koouk-selected-folder')

        if (savedFolders) {
          const parsedFolders = JSON.parse(savedFolders)
          
          // 더미 데이터 감지 및 제거 (완전 강화된 로직)
          const dummyKeywords = [
            'Sample', 'Example', 'Work', 'Personal', 'Ideas', 'Test', 'Demo',
            'React', '개발자', '필수', '가이드', '재택근무', '패션', '뷰티', 
            '육아', '음식', '레시피', '맛집', '타일별', '샘플', '모음',
            'Template', 'Dummy', 'Placeholder'
          ]
          
          const hasDummyData = parsedFolders.some((folder: FolderItem) => 
            dummyKeywords.some(keyword => folder.name?.includes(keyword)) ||
            folder.children?.some((item) => 
              dummyKeywords.some(keyword => 
                item.name?.includes(keyword) ||
                ('content' in item && item.content?.includes(keyword.toLowerCase()))
              )
            )
          )
          
          if (hasDummyData) {
            console.log('Dummy data detected, clearing...')
            localStorage.removeItem('koouk-folders')
            localStorage.removeItem('koouk-selected-folder')
            localStorage.removeItem('koouk-shared-folders') // 공유 폴더도 클리어
            setFolders([])
            
            // 확실히 클리어하기 위해 한번 더 체크
            setTimeout(() => {
              localStorage.removeItem('koouk-folders')
              localStorage.removeItem('koouk-selected-folder')
            }, 100)
          } else {
            setFolders(parsedFolders)
            
            if (savedSelectedId && parsedFolders.find((f: FolderItem) => f.id === savedSelectedId)) {
              setSelectedFolderId(savedSelectedId)
              setCurrentView('detail')
            }
          }
        }
      } catch (error) {
        console.error('Data loading failed:', error)
        setFolders([])
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(loadData, 0)
    return () => clearTimeout(timer)
  }, [])

  // 데이터 저장
  const saveToStorage = (newFolders: FolderItem[], newSelectedId?: string) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('koouk-folders', JSON.stringify(newFolders))
      
      if (newSelectedId !== undefined) {
        localStorage.setItem('koouk-selected-folder', newSelectedId)
      }
      
      // 검색 엔진 인덱스 업데이트
      searchEngine.updateIndex(newFolders)
    } catch (error) {
      console.error('Data saving failed:', error)
    }
  }

  // 폴더 관련 핸들러
  const handleFoldersChange = (newFolders: FolderItem[]) => {
    setFolders(newFolders)
    saveToStorage(newFolders)
  }

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    setCurrentView('detail')
    saveToStorage(folders, folderId)
  }

  const handleFolderSelectFromGrid = (folder: FolderItem) => {
    handleFolderSelect(folder.id)
  }

  // 폴더 생성
  const handleCreateFolder = () => {
    setNewFolderName('')
    setShowCreateFolderModal(true)
  }

  const handleConfirmCreateFolder = () => {
    const folderName = newFolderName.trim() || 'New Folder'
    
    const newFolder = createFolder(folderName, undefined, {
      color: '#3B82F6',
      icon: '📁'
    })
    
    const newFolders = [newFolder, ...folders]
    handleFoldersChange(newFolders)
    
    // 새 폴더 선택
    handleFolderSelect(newFolder.id)
    
    // 모달 닫기
    setShowCreateFolderModal(false)
    setNewFolderName('')
  }

  // 아이템 추가
  const handleAddItem = (item: StorageItem, folderId: string) => {
    const updatedFolders = folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          children: [item, ...folder.children],
          updatedAt: new Date().toISOString()
        }
      }
      return folder
    })
    
    handleFoldersChange(updatedFolders)
  }

  // 아이템 삭제
  const handleItemDelete = (itemId: string) => {
    if (!selectedFolderId) return
    
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
  }

  // 뒤로 가기
  const handleBack = () => {
    setCurrentView('grid')
    setSelectedFolderId(undefined)
    saveToStorage(folders, '')
  }

  // 폴더 공유
  const handleShareFolder = (sharedFolderData: SharedFolderData, folder: FolderItem) => {
    try {
      // SharedFolder 객체 생성
      const sharedFolder: SharedFolder = {
        id: `shared-${Date.now()}`,
        title: sharedFolderData.title,
        description: sharedFolderData.description,
        author: {
          id: 'current-user',
          name: 'You',
          avatar: '👤',
          verified: false
        },
        category: sharedFolderData.category as ShareCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: true,
        tags: sharedFolderData.tags,
        coverImage: sharedFolderData.coverImage,
        stats: {
          views: 0,
          likes: 0,
          helpful: 0,
          notHelpful: 0,
          shares: 0,
          downloads: 0
        },
        folder: folder
      }

      // 로컬스토리지에 공유 폴더 저장
      const existingSharedFolders = JSON.parse(localStorage.getItem('koouk-shared-folders') || '[]')
      const updatedSharedFolders = [sharedFolder, ...existingSharedFolders]
      localStorage.setItem('koouk-shared-folders', JSON.stringify(updatedSharedFolders))

      showSuccess(`📢 "${sharedFolderData.title}" has been shared to Market Place!`)
      
      console.log('Folder shared successfully:', sharedFolder)
    } catch (error) {
      console.error('Error sharing folder:', error)
      alert('Failed to share folder. Please try again.')
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