'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import TopNavigation from './TopNavigation'
import MobileFolderList from './MobileFolderList'
import FolderBreadcrumb from './FolderBreadcrumb'
import FloatingInputButton from './FloatingInputButton'
import { FolderItem, StorageItem } from '@/types/folder'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useDevice } from '@/hooks/useDevice'
import QuickNoteModal from '@/components/modals/QuickNoteModal'
import BigNoteModal from '@/components/modals/BigNoteModal'
import Bookmarks from '@/components/workspace/Bookmarks'
import MarketPlace from '@/components/workspace/MarketPlace'
import { SharedFolder } from '@/types/share'
import { createFolder } from '@/types/folder'

interface MobileWorkspaceProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onFoldersChange: (folders: FolderItem[]) => void
  onFolderSelect: (folderId: string) => void
}

export default function MobileWorkspace({ 
  folders, 
  selectedFolderId,
  onFoldersChange,
  onFolderSelect: parentOnFolderSelect
}: MobileWorkspaceProps) {
  const { state, updateNavigation } = useCrossPlatformState()
  const device = useDevice()
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null)
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false)
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)
  const [currentFolderPath, setCurrentFolderPath] = useState<string[]>([])

  // PC에서는 렌더링하지 않음
  if (device.isDesktop) return null

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'my-folder' | 'bookmarks' | 'market-place') => {
    updateNavigation({
      activeTab: tab
    })
  }

  // 폴더 선택 핸들러
  const handleFolderSelect = (folderId: string, folderName?: string) => {
    parentOnFolderSelect(folderId)
    
    // 브레드크럼 경로 업데이트
    if (folderId && folderId !== 'root') {
      setCurrentFolderPath(prev => [...prev, folderId])
    } else {
      setCurrentFolderPath([])
    }
    console.log(`Mobile: Selected folder ${folderId} (${folderName})`)
  }
  
  // 브레드크럼 네비게이션 핸들러
  const handleBreadcrumbNavigate = (folderId: string) => {
    if (folderId === '' || folderId === 'root') {
      // 루트로 이동
      setCurrentFolderPath([])
      parentOnFolderSelect('')
    } else {
      // 해당 폴더의 인덱스 찾기
      const index = currentFolderPath.indexOf(folderId)
      if (index !== -1) {
        setCurrentFolderPath(currentFolderPath.slice(0, index + 1))
        parentOnFolderSelect(folderId)
      }
    }
  }

  // 아이템 추가 핸들러 (WorkspaceContent와 동일한 로직)
  const addItemToFolder = (folders: FolderItem[], folderId: string, item: StorageItem): FolderItem[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          children: [...folder.children, item]
        }
      }
      
      // 하위 폴더에서 재귀적으로 검색
      const updatedChildren = folder.children.map(child => {
        if (child.type === 'folder') {
          const updatedSubfolders = addItemToFolder([child as FolderItem], folderId, item)
          return updatedSubfolders[0]
        }
        return child
      })
      
      return {
        ...folder,
        children: updatedChildren
      }
    })
  }

  const handleAddItem = (item: StorageItem, folderId: string) => {
    const updatedFolders = addItemToFolder(folders, folderId, item)
    onFoldersChange(updatedFolders)
  }
  
  // SharedFolder를 FolderItem으로 변환하여 추가
  const handleImportSharedFolder = (sharedFolder: SharedFolder) => {
    const newFolder = createFolder(
      sharedFolder.title,
      undefined,
      {
        color: '#3B82F6', // 기본 블루 색상
        icon: '📁'
      }
    )
    
    // 루트 레벨에 추가
    const updatedFolders = [newFolder, ...folders]
    onFoldersChange(updatedFolders)
  }

  // 아이템 선택 핸들러
  const handleItemSelect = (item: StorageItem) => {
    // URL이나 비디오는 새 창에서 열기
    if (item.type === 'url' || item.type === 'video') {
      window.open(item.content, '_blank')
      return
    }

    // 메모/문서는 해당 모달에서 열기
    if (item.type === 'memo' || item.type === 'document') {
      setEditingItem(item)
      if (item.type === 'memo') {
        setShowQuickNoteModal(true)
      } else {
        setShowBigNoteModal(true)
      }
    }
  }

  // 현재 활성 탭에 따른 콘텐츠 렌더링
  const renderContent = () => {
    switch (state.navigation.activeTab) {
      case 'my-folder':
        return (
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {/* 통일된 헤더 스타일 */}
            <div className="bg-white border-b border-gray-100 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">내 폴더</h2>
              <p className="text-sm text-gray-500 mt-1">개인 콘텐츠를 정리하고 관리하세요</p>
            </div>

            {/* 폴더 브레드크럼 */}
            {currentFolderPath.length > 0 && (
              <FolderBreadcrumb
                folders={folders}
                currentPath={currentFolderPath}
                onNavigate={handleBreadcrumbNavigate}
              />
            )}
            
            {/* Quick Access Bar - Removed for better folder visibility */}
            {/* <QuickAccessBar onFolderSelect={handleFolderSelect} /> */}
            
            {/* Folder Content */}
            <div className="flex-1 overflow-hidden">
              <MobileFolderList 
                folders={folders}
                onFolderSelect={handleFolderSelect}
                onItemSelect={handleItemSelect}
              />
            </div>

            {/* Floating Input Button - 모바일 전용 */}
            <FloatingInputButton
              folders={folders}
              selectedFolderId={selectedFolderId}
              onAddItem={handleAddItem}
              onFolderSelect={handleFolderSelect}
              onOpenMemo={() => setShowQuickNoteModal(true)}
              onOpenNote={() => setShowBigNoteModal(true)}
            />
          </div>
        )

      case 'bookmarks':
        return (
          <div className="flex-1 overflow-hidden bg-gray-50">
            {/* 통일된 헤더 스타일 */}
            <div className="bg-white border-b border-gray-100 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">북마크</h2>
              <p className="text-sm text-gray-500 mt-1">저장된 링크와 자료를 찾아보세요</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <Bookmarks />
            </div>
          </div>
        )

      case 'market-place':
        return (
          <div className="flex-1 overflow-hidden bg-gray-50">
            {/* 통일된 헤더 스타일 */}
            <div className="bg-white border-b border-gray-100 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">마켓플레이스</h2>
              <p className="text-sm text-gray-500 mt-1">다른 사용자들이 공유한 콘텐츠</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <MarketPlace onImportFolder={handleImportSharedFolder} />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 상태 바 영역 (iOS) */}
      <div className="h-safe-area-top bg-white" />
      
      {/* Top Navigation */}
      <TopNavigation onTabChange={handleTabChange} />
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showQuickNoteModal && (
          <QuickNoteModal
            isOpen={showQuickNoteModal}
            onClose={() => {
              setShowQuickNoteModal(false)
              setEditingItem(null)
            }}
            editNote={editingItem}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSave={(note, folderId) => {
              const item: StorageItem = {
                id: editingItem?.id || Date.now().toString(),
                name: note.name,
                type: note.type,
                content: note.content,
                folderId: folderId,
                tags: note.tags || [],
                createdAt: editingItem?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              
              if (editingItem) {
                // 기존 아이템 수정 로직 필요
                console.log('Edit existing item:', item)
              } else {
                handleAddItem(item, folderId)
              }
              setShowQuickNoteModal(false)
              setEditingItem(null)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBigNoteModal && (
          <BigNoteModal
            isOpen={showBigNoteModal}
            onClose={() => {
              setShowBigNoteModal(false)
              setEditingItem(null)
            }}
            editNote={editingItem}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSave={(note, folderId) => {
              const item: StorageItem = {
                id: editingItem?.id || Date.now().toString(),
                name: note.name,
                type: note.type,
                content: note.content,
                folderId: folderId,
                tags: note.tags || [],
                metadata: note.metadata,
                createdAt: editingItem?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              
              if (editingItem) {
                // 기존 아이템 수정 로직 필요
                console.log('Edit existing item:', item)
              } else {
                handleAddItem(item, folderId)
              }
              setShowBigNoteModal(false)
              setEditingItem(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}