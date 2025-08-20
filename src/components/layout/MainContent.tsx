'use client'

import { FolderItem, StorageItem } from '@/types/folder'
import FolderView from '@/components/pages/MyFolder/FolderView'
import MarketPlace from '@/components/pages/Marketplace/MarketPlace'
import Bookmarks from '@/components/pages/Bookmarks/Bookmarks'

interface MainContentProps {
  activeTab: 'storage' | 'bookmarks' | 'marketplace'
  selectedFolder?: FolderItem
  folders?: FolderItem[]
  selectedFolderId?: string
  currentView?: 'grid' | 'detail'
  onAddItem?: (item: StorageItem, folderId: string) => void
  onShareFolder?: (folder: FolderItem) => void
  onImportFolder?: (sharedFolder: any) => void
  onLoginRequired?: () => boolean
  user?: any
  marketplaceView?: 'marketplace' | 'my-shared'
  onMarketplaceViewChange?: (view: 'marketplace' | 'my-shared') => void
  onFolderSelect?: (folderId: string) => void
  onViewChange?: (view: 'grid' | 'detail') => void
}

export default function MainContent({
  activeTab,
  selectedFolder,
  folders = [],
  selectedFolderId,
  currentView,
  onAddItem,
  onShareFolder,
  onImportFolder,
  onLoginRequired,
  user,
  marketplaceView,
  onMarketplaceViewChange,
  onFolderSelect,
  onViewChange
}: MainContentProps) {

  // Handle tab content with login checks  
  const renderTabContent = () => {
    if (activeTab === 'storage') {
      return (
        <FolderView 
          searchQuery=""
          folders={folders}
          selectedFolderId={selectedFolderId}
          currentView={currentView}
          onAddItem={onAddItem}
          onFolderSelect={onFolderSelect}
          onViewChange={onViewChange}
        />
      )
    }
    
    if (activeTab === 'marketplace') {
      return (
        <MarketPlace 
          onImportFolder={onImportFolder}
        />
      )
    }
    
    if (activeTab === 'bookmarks') {
      return <Bookmarks />
    }
    
    return null
  }

  return (
    <div className="flex-1 flex flex-col">
      {renderTabContent()}
    </div>
  )
}