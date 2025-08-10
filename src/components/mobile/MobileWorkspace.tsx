'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import BottomTabNavigation from './BottomTabNavigation'
import BreadcrumbNavigation from './BreadcrumbNavigation'
import QuickAccessBar from './QuickAccessBar'
import MobileFolderList from './MobileFolderList'
import { FolderItem, StorageItem } from '@/types/folder'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useDevice } from '@/hooks/useDevice'
import DocumentViewModal from '@/components/modals/DocumentViewModal'
import Bookmarks from '@/components/workspace/Bookmarks'

interface MobileWorkspaceProps {
  folders: FolderItem[]
}

export default function MobileWorkspace({ folders }: MobileWorkspaceProps) {
  const { state, updateNavigation } = useCrossPlatformState()
  const device = useDevice()
  const [selectedDocument, setSelectedDocument] = useState<StorageItem | null>(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)

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
    // 이미 상태는 각 컴포넌트에서 업데이트되므로 추가 작업만 수행
    console.log(`Mobile: Selected folder ${folderId}`)
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
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Market Place</h3>
              <p className="text-gray-500 text-sm">곧 제공될 예정입니다</p>
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
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom Tab Navigation */}
      <BottomTabNavigation onTabChange={handleTabChange} />

      {/* Document View Modal */}
      <AnimatePresence>
        {showDocumentModal && selectedDocument && (
          <DocumentViewModal
            isOpen={showDocumentModal}
            onClose={handleCloseDocumentModal}
            item={selectedDocument}
          />
        )}
      </AnimatePresence>
    </div>
  )
}