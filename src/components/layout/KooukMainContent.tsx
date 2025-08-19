'use client'

import { FolderItem, StorageItem } from '@/types/folder'
import MyFolderContent from '@/components/pages/MyFolder/MyFolderContent'
import MarketPlace from '@/components/pages/Marketplace/MarketPlace'
import Bookmarks from '@/components/pages/Bookmarks/Bookmarks'

interface KooukMainContentProps {
  activeTab: 'storage' | 'bookmarks' | 'marketplace'
  selectedFolder?: FolderItem
  folders?: FolderItem[]
  onAddItem?: (item: StorageItem, folderId: string) => void
  onShareFolder?: (folder: FolderItem) => void
  onImportFolder?: (sharedFolder: any) => void
  onLoginRequired?: () => boolean
  user?: any
  marketplaceView?: 'marketplace' | 'my-shared'
  onMarketplaceViewChange?: (view: 'marketplace' | 'my-shared') => void
}

export default function KooukMainContent({
  activeTab,
  selectedFolder,
  folders = [],
  onAddItem,
  onShareFolder,
  onImportFolder,
  onLoginRequired,
  user,
  marketplaceView,
  onMarketplaceViewChange
}: KooukMainContentProps) {

  // Handle tab content with login checks  
  const renderTabContent = () => {
    if (activeTab === 'storage') {
      return (
        <MyFolderContent 
          searchQuery=""
        />
      )
    }
    
    if (activeTab === 'marketplace') {
      return (
        <MarketPlace 
          onImportFolder={onImportFolder}
          marketplaceView={marketplaceView}
          onMarketplaceViewChange={onMarketplaceViewChange}
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