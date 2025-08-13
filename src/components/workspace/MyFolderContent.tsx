'use client'

import { useState, useEffect } from 'react'
import { FolderItem, StorageItem, createFolder } from '@/types/folder'
import { searchEngine } from '@/lib/search-engine'
import FolderGrid from '@/components/ui/FolderGrid'
import FolderDetail from '@/components/ui/FolderDetail'
import FolderSelector from '@/components/ui/FolderSelector'
import ContentInput from '@/components/ui/ContentInput'

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
          
          // 더미 데이터 감지 및 제거
          const hasDummyData = parsedFolders.some((folder: FolderItem) => 
            folder.name?.includes('Sample') || 
            folder.name?.includes('Example') ||
            folder.children?.some((item) => 
              item.name?.includes('Sample') || 
              ('content' in item && item.content?.includes('example.com'))
            )
          )
          
          if (hasDummyData) {
            console.log('Dummy data detected, clearing...')
            localStorage.removeItem('koouk-folders')
            localStorage.removeItem('koouk-selected-folder')
            setFolders([])
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

  // 폴더 공유 (추후 구현)
  const handleShareFolder = (folderId: string) => {
    console.log('Share folder:', folderId)
    // TODO: 폴더 공유 모달 구현
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
    <div className="flex flex-col h-full">
      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-hidden">
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

      {/* 입력 시스템 */}
      <div className="border-t border-gray-200 bg-white">
        <div className="p-4 space-y-4">
          {/* 폴더 선택 키워드 */}
          {folders.length > 0 && (
            <FolderSelector
              folders={folders}
              selectedFolderId={selectedFolderId}
              onFolderSelect={handleFolderSelect}
              onCreateFolder={handleCreateFolder}
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
    </div>
  )
}