'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import MobileFolderList from './MobileFolderList'
import PCStyleFolderView from './PCStyleFolderView'
import FloatingInputButton from './FloatingInputButton'
import { FolderItem, StorageItem, createFolder, createStorageItem } from '@/types/folder'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useDevice } from '@/hooks/useDevice'
import QuickNoteModal from '@/components/modals/QuickNoteModal'
import BigNoteModal from '@/components/modals/BigNoteModal'
import Bookmarks from '@/components/workspace/Bookmarks'
import MarketPlace from '@/components/workspace/MarketPlace'
import { SharedFolder } from '@/types/share'

interface MobileWorkspaceProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onFoldersChange: (folders: FolderItem[]) => void
  onFolderSelect: (folderId: string) => void
  onShareFolder?: (folderId: string) => void
}

export default function MobileWorkspace({ 
  folders, 
  selectedFolderId,
  onFoldersChange,
  onFolderSelect: parentOnFolderSelect,
  onShareFolder
}: MobileWorkspaceProps) {
  const { state } = useCrossPlatformState()
  const device = useDevice()
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null)
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false)
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)
  const [currentFolderPath, setCurrentFolderPath] = useState<{ id: string; name: string }[]>([])
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'folder'>('list') // 'list' = folder list, 'folder' = inside folder

  // Don't render on desktop
  if (device.isDesktop) return null

  // Find folder by ID in nested structure
  const findFolderById = (folders: FolderItem[], id: string): FolderItem | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder
      const subFolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
      const found = findFolderById(subFolders, id)
      if (found) return found
    }
    return null
  }

  // Build folder path for breadcrumb
  const buildFolderPath = (folderId: string): { id: string; name: string }[] => {
    const path: { id: string; name: string }[] = []
    
    const findPath = (folders: FolderItem[], targetId: string, currentPath: { id: string; name: string }[]): boolean => {
      for (const folder of folders) {
        const newPath = [...currentPath, { id: folder.id, name: folder.name }]
        
        if (folder.id === targetId) {
          path.push(...newPath)
          return true
        }
        
        const subFolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
        if (findPath(subFolders, targetId, newPath)) {
          return true
        }
      }
      return false
    }
    
    findPath(folders, folderId, [])
    return path
  }

  // Ensure empty folder exists
  const ensureEmptyFolder = (updatedFolders: FolderItem[]): FolderItem[] => {
    const hasEmptyFolder = updatedFolders.some(folder => 
      folder.children.length === 0 && (folder.name === '' || folder.name === 'No name' || folder.name.trim() === '')
    )
    
    if (!hasEmptyFolder) {
      const emptyFolder = createFolder('', undefined, { color: '#6B7280', icon: '📁' })
      return [...updatedFolders, emptyFolder]
    }
    
    return updatedFolders
  }

  // Folder selection handler
  const handleFolderSelect = (folderId: string) => {
    const folder = findFolderById(folders, folderId)
    if (folder) {
      setCurrentFolder(folder)
      setCurrentFolderPath(buildFolderPath(folderId))
      setViewMode('folder')
      parentOnFolderSelect(folderId)
    }
  }

  // Navigate back to folder list
  const handleBackToList = () => {
    setCurrentFolder(null)
    setCurrentFolderPath([])
    setViewMode('list')
    parentOnFolderSelect('')
  }

  // Navigate to specific folder in breadcrumb
  const handleNavigateToFolder = (folderId: string) => {
    if (folderId === '') {
      handleBackToList()
    } else {
      const folder = findFolderById(folders, folderId)
      if (folder) {
        setCurrentFolder(folder)
        setCurrentFolderPath(buildFolderPath(folderId))
        setViewMode('folder')
        parentOnFolderSelect(folderId)
      }
    }
  }

  // Create new folder
  const handleCreateFolder = (parentId?: string) => {
    const folderName = prompt('폴더 이름을 입력하세요:', 'New Folder')
    if (!folderName?.trim()) return

    const newFolder = createFolder(folderName.trim(), parentId)
    
    if (parentId) {
      // Add as subfolder
      const updatedFolders = addFolderToParent(folders, parentId, newFolder)
      onFoldersChange(ensureEmptyFolder(updatedFolders))
    } else {
      // Add at root level and ensure empty folder
      const updatedFolders = [newFolder, ...folders]
      onFoldersChange(ensureEmptyFolder(updatedFolders))
    }

    // Update empty folder name if it was unnamed
    if (folders.some(f => f.id === parentId && (f.name === '' || f.name === 'No name'))) {
      const updatedFolders = folders.map(f => 
        f.id === parentId ? { ...f, name: folderName.trim(), updatedAt: new Date().toISOString() } : f
      )
      onFoldersChange(ensureEmptyFolder(updatedFolders))
      return
    }
  }

  // Add folder to parent
  const addFolderToParent = (folders: FolderItem[], parentId: string, newFolder: FolderItem): FolderItem[] => {
    return folders.map(folder => {
      if (folder.id === parentId) {
        return {
          ...folder,
          children: [...folder.children, newFolder],
          updatedAt: new Date().toISOString()
        }
      }
      
      const updatedChildren = folder.children.map(child => {
        if (child.type === 'folder') {
          const updatedSubfolders = addFolderToParent([child as FolderItem], parentId, newFolder)
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

  // Item addition handler
  const addItemToFolder = (folders: FolderItem[], folderId: string, item: StorageItem): FolderItem[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          children: [...folder.children, item],
          updatedAt: new Date().toISOString()
        }
      }
      
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

  // Create item
  const handleCreateItem = (type: StorageItem['type'], folderId: string) => {
    const typeLabels = {
      document: 'Document',
      memo: 'Memo', 
      image: 'Image',
      video: 'Video',
      url: 'URL'
    }
    
    const itemName = prompt(`Enter ${typeLabels[type].toLowerCase()} name:`, `New ${typeLabels[type]}`)
    if (!itemName?.trim()) return

    let content = ''
    if (type === 'url') {
      content = prompt('Enter URL:', 'https://') || ''
    } else {
      content = prompt('Enter content:', '') || ''
    }

    const newItem = createStorageItem(itemName.trim(), type, content, folderId)
    handleAddItem(newItem, folderId)
  }

  // Convert SharedFolder to FolderItem and add
  const handleImportSharedFolder = (sharedFolder: SharedFolder) => {
    const newFolder = createFolder(
      sharedFolder.title,
      undefined,
      {
        color: sharedFolder.folder.color || '#3B82F6',
        icon: sharedFolder.folder.icon || '📁'
      }
    )
    
    newFolder.children = [...sharedFolder.folder.children]
    newFolder.updatedAt = new Date().toISOString()
    
    const updatedFolders = [newFolder, ...folders]
    onFoldersChange(ensureEmptyFolder(updatedFolders))
    
    console.log('Imported folder:', newFolder.name, 'with', newFolder.children.length, 'items')
  }

  // Item selection handler
  const handleItemSelect = (item: StorageItem) => {
    if (item.type === 'url' || item.type === 'video') {
      window.open(item.content, '_blank')
      return
    }

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
          <div className="flex-1 flex flex-col overflow-hidden">
            {viewMode === 'list' ? (
              // 🎨 Emotional Folder List View - 감성적이고 따뜻한 디자인
              <div className="flex-1 overflow-hidden relative">
                {/* Welcome Section - 처음 보는 사람도 3초 안에 이해할 수 있게 */}
                <div className="px-4 py-6 bg-gradient-to-r from-white/90 to-amber-50/90 backdrop-blur-sm">
                  <div className="text-center">
                    <h1 className="text-lg font-medium text-gray-800 mb-2 leading-relaxed">
                      내 폴더
                    </h1>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      소중한 정보를 쉽고 직관적으로 정리해보세요
                    </p>
                  </div>
                </div>

                {/* Redesigned Folder List */}
                <div className="flex-1 px-4 pt-4 pb-20">
                  <MobileFolderList 
                    folders={folders}
                    onFolderSelect={handleFolderSelect}
                    onItemSelect={handleItemSelect}
                    onShareFolder={onShareFolder}
                  />
                </div>
              </div>
            ) : (
              // PC-Style Folder Internal View with warm styling
              <div className="flex-1 bg-white/50 backdrop-blur-sm">
                <PCStyleFolderView
                  currentFolder={currentFolder}
                  folderPath={currentFolderPath}
                  onBack={handleBackToList}
                  onNavigateToFolder={handleNavigateToFolder}
                  onFolderSelect={handleFolderSelect}
                  onItemSelect={handleItemSelect}
                  onCreateFolder={handleCreateFolder}
                  onCreateItem={handleCreateItem}
                />
              </div>
            )}

            {/* 🎨 Emotional Floating Input Button - 부드럽고 감성적인 디자인 */}
            {viewMode === 'list' && (
              <div className="absolute bottom-4 right-4 z-10">
                <FloatingInputButton
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                  onAddItem={handleAddItem}
                  onFolderSelect={handleFolderSelect}
                  onOpenMemo={() => setShowQuickNoteModal(true)}
                  onOpenNote={() => setShowBigNoteModal(true)}
                />
              </div>
            )}
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Main content with warm, emotional background */}
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