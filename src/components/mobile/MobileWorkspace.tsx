'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import TopNavigation from './TopNavigation'
import BreadcrumbNavigation from './BreadcrumbNavigation'
import QuickAccessBar from './QuickAccessBar'
import MobileFolderList from './MobileFolderList'
import { FolderItem, StorageItem } from '@/types/folder'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useDevice } from '@/hooks/useDevice'
import DocumentViewModal from '@/components/modals/DocumentViewModal'
import QuickNoteModal from '@/components/modals/QuickNoteModal'
import BigNoteModal from '@/components/modals/BigNoteModal'
import UniversalInputBar from '@/components/ui/UniversalInputBar'
import Bookmarks from '@/components/workspace/Bookmarks'
import MarketPlace from '@/components/workspace/MarketPlace'

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
  const [selectedDocument, setSelectedDocument] = useState<StorageItem | null>(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false)
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)

  // PC에서는 렌더링하지 않음
  if (device.isDesktop) return null

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'my-folder' | 'bookmarks' | 'market-place') => {
    updateNavigation({
      activeTab: tab
    })
  }

  // 폴더 선택 핸들러
  const handleFolderSelect = (folderId: string) => {
    parentOnFolderSelect(folderId)
    console.log(`Mobile: Selected folder ${folderId}`)
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

  // 아이템 선택 핸들러
  const handleItemSelect = (item: StorageItem) => {
    // URL 타입은 새 창에서 열기
    if (item.type === 'url') {
      window.open(item.content, '_blank')
      return
    }

    // 다른 타입들은 모달에서 열기
    setSelectedDocument(item)
    setShowDocumentModal(true)
  }

  // 문서 모달 닫기
  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false)
    setSelectedDocument(null)
  }

  // 현재 활성 탭에 따른 콘텐츠 렌더링
  const renderContent = () => {
    switch (state.navigation.activeTab) {
      case 'my-folder':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick Access Bar */}
            <QuickAccessBar onFolderSelect={handleFolderSelect} />
            
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation onNavigate={handleFolderSelect} />
            
            {/* Folder Content */}
            <MobileFolderList 
              folders={folders}
              onFolderSelect={handleFolderSelect}
              onItemSelect={handleItemSelect}
            />

            {/* Universal Input Bar - Mobile Only */}
            <UniversalInputBar
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
          <div className="flex-1 overflow-hidden">
            <Bookmarks />
          </div>
        )

      case 'market-place':
        return (
          <div className="flex-1 overflow-hidden">
            <MarketPlace />
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
        {showDocumentModal && selectedDocument && (
          <DocumentViewModal
            isOpen={showDocumentModal}
            onClose={handleCloseDocumentModal}
            item={selectedDocument}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuickNoteModal && (
          <QuickNoteModal
            isOpen={showQuickNoteModal}
            onClose={() => setShowQuickNoteModal(false)}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSave={(note, folderId) => {
              const item: StorageItem = {
                id: Date.now().toString(),
                name: note.name,
                type: note.type,
                content: note.content,
                folderId: folderId,
                tags: note.tags || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              
              handleAddItem(item, folderId)
              setShowQuickNoteModal(false)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBigNoteModal && (
          <BigNoteModal
            isOpen={showBigNoteModal}
            onClose={() => setShowBigNoteModal(false)}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSave={(note, folderId) => {
              const item: StorageItem = {
                id: Date.now().toString(),
                name: note.name,
                type: note.type,
                content: note.content,
                folderId: folderId,
                tags: note.tags || [],
                metadata: note.metadata,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              
              handleAddItem(item, folderId)
              setShowBigNoteModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}