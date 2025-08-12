'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
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
  const { state } = useCrossPlatformState()
  const device = useDevice()
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null)
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false)
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)
  const [currentFolderPath, setCurrentFolderPath] = useState<string[]>([])

  // Don't render on desktop
  if (device.isDesktop) return null

  // Folder selection handler
  const handleFolderSelect = (folderId: string, folderName?: string) => {
    parentOnFolderSelect(folderId)
    
    // Update breadcrumb path
    if (folderId && folderId !== 'root') {
      setCurrentFolderPath(prev => [...prev, folderId])
    } else {
      setCurrentFolderPath([])
    }
    console.log(`Mobile: Selected folder ${folderId} (${folderName})`)
  }
  
  // Breadcrumb navigation handler
  const handleBreadcrumbNavigate = (folderId: string) => {
    if (folderId === '' || folderId === 'root') {
      // Navigate to root
      setCurrentFolderPath([])
      parentOnFolderSelect('')
    } else {
      // Find folder index
      const index = currentFolderPath.indexOf(folderId)
      if (index !== -1) {
        setCurrentFolderPath(currentFolderPath.slice(0, index + 1))
        parentOnFolderSelect(folderId)
      }
    }
  }

  // Item addition handler (same logic as WorkspaceContent)
  const addItemToFolder = (folders: FolderItem[], folderId: string, item: StorageItem): FolderItem[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          children: [...folder.children, item]
        }
      }
      
      // Recursively search in subfolders
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
  
  // Convert SharedFolder to FolderItem and add
  const handleImportSharedFolder = (sharedFolder: SharedFolder) => {
    const newFolder = createFolder(
      sharedFolder.title,
      undefined,
      {
        color: '#3B82F6', // Default blue color
        icon: '📁'
      }
    )
    
    // Add to root level
    const updatedFolders = [newFolder, ...folders]
    onFoldersChange(updatedFolders)
  }

  // Item selection handler
  const handleItemSelect = (item: StorageItem) => {
    // Open URLs or videos in new window
    if (item.type === 'url' || item.type === 'video') {
      window.open(item.content, '_blank')
      return
    }

    // Open memos/documents in respective modals
    if (item.type === 'memo' || item.type === 'document') {
      setEditingItem(item)
      if (item.type === 'memo') {
        setShowQuickNoteModal(true)
      } else {
        setShowBigNoteModal(true)
      }
    }
  }

  // Render content based on current active tab
  const renderContent = () => {
    switch (state.navigation.activeTab) {
      case 'my-folder':
        return (
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {/* Folder breadcrumb */}
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

            {/* Floating Input Button - Mobile only */}
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
            <div className="flex-1 overflow-hidden">
              <Bookmarks />
            </div>
          </div>
        )

      case 'market-place':
        return (
          <div className="flex-1 overflow-hidden bg-gray-50">
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
      {/* Main content */}
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
                // TODO: Existing item edit logic needed
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
                // TODO: Existing item edit logic needed
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