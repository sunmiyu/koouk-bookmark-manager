'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  FileText,
  Image as ImageIcon,
  Video,
  Link,
  StickyNote,
  Grid3X3,
  LayoutList,
  FolderOpen,
  Search,
  Plus,
  Menu
} from 'lucide-react'
import FolderTree from '../ui/FolderTree'
import UniversalInputBar from '../ui/UniversalInputBar'
import PWAInstallPrompt from '../ui/PWAInstallPrompt'
import QuickNoteModal from '../modals/QuickNoteModal'
import BigNoteModal from '../modals/BigNoteModal'
import MobileWorkspace from '../mobile/MobileWorkspace'
import { FolderItem, StorageItem, createFolder, createStorageItem, defaultFolderTemplates, createDummyFolders, createInitialFolders } from '@/types/folder'
import { searchEngine } from '@/lib/search-engine'
import { useDevice } from '@/hooks/useDevice'
import { isYouTubeUrl, getYouTubeThumbnail } from '@/utils/youtube'

export default function WorkspaceContent({ searchQuery = '' }: { searchQuery?: string }) {
  const device = useDevice()
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false)
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null)

  // Load data from localStorage - client-side only
  useEffect(() => {
    // Check browser environment
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const loadData = () => {
      try {
        const savedFolders = localStorage.getItem('koouk-folders')
        const savedSelectedId = localStorage.getItem('koouk-selected-folder')
        const savedExpandedIds = localStorage.getItem('koouk-expanded-folders')

        if (savedFolders) {
          const parsedFolders = JSON.parse(savedFolders)
          setFolders(parsedFolders)
          
          if (parsedFolders.length > 0 && !savedSelectedId) {
            setSelectedFolderId(parsedFolders[0].id)
          }
        } else {
          // Generate dummy data on first visit and set first-time flag
          const initialFolders = createDummyFolders()
          setFolders(initialFolders)
          setIsFirstTime(true)
          if (initialFolders.length > 0) {
            setSelectedFolderId(initialFolders[0].id)
          }
        }

        if (savedSelectedId) {
          setSelectedFolderId(savedSelectedId)
        }

        if (savedExpandedIds) {
          setExpandedFolders(new Set(JSON.parse(savedExpandedIds)))
        }
      } catch (error) {
        console.error('Data loading failed:', error)
        // Create default folders
        const initialFolders = defaultFolderTemplates.general.map(template =>
          createFolder(template.name, undefined, template)
        )
        setFolders(initialFolders)
        if (initialFolders.length > 0) {
          setSelectedFolderId(initialFolders[0].id)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Load with slight delay (prevents hydration issues)
    const timer = setTimeout(() => {
      loadData()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // Save data - added browser environment check
  const saveToStorage = (newFolders: FolderItem[], newSelectedId?: string) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('koouk-folders', JSON.stringify(newFolders))
      
      if (newSelectedId !== undefined) {
        localStorage.setItem('koouk-selected-folder', newSelectedId)
      }
      
      localStorage.setItem('koouk-expanded-folders', JSON.stringify([...expandedFolders]))
    } catch (error) {
      console.error('Data saving failed:', error)
    }
  }

  // Folder-related handlers
  const handleFoldersChange = (newFolders: FolderItem[]) => {
    setFolders(newFolders)
    saveToStorage(newFolders)
    
    // Update search engine index
    searchEngine.updateIndex(newFolders)
  }

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    saveToStorage(folders, folderId)
  }

  const handleFolderToggle = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
    saveToStorage(folders)
  }

  const handleCreateFolder = (parentId?: string) => {
    const folderName = prompt('Enter folder name:', 'New Folder')
    if (!folderName?.trim()) return

    const newFolder = createFolder(folderName.trim(), parentId)
    
    if (parentId) {
      // Add as subfolder of specific folder
      const updatedFolders = addToParentFolder(folders, parentId, newFolder)
      handleFoldersChange(updatedFolders)
      
      // Expand parent folder
      const newExpanded = new Set(expandedFolders)
      newExpanded.add(parentId)
      setExpandedFolders(newExpanded)
    } else {
      // Add at root level
      const newFolders = [...folders, newFolder]
      handleFoldersChange(newFolders)
    }
    
    // Select newly created folder
    handleFolderSelect(newFolder.id)
  }

  const handleRenameFolder = (folderId: string, newName: string) => {
    const updatedFolders = updateFolderInTree(folders, folderId, { name: newName, updatedAt: new Date().toISOString() })
    handleFoldersChange(updatedFolders)
  }

  const handleDeleteFolder = (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder?')) {
      return
    }
    
    const updatedFolders = removeFolderFromTree(folders, folderId)
    handleFoldersChange(updatedFolders)
    
    // If deleted folder was selected, select the first folder
    if (selectedFolderId === folderId && updatedFolders.length > 0) {
      handleFolderSelect(updatedFolders[0].id)
    }
  }

  const handleStartMyFolder = () => {
    if (!confirm('This will clear all sample data and start fresh. Are you sure?')) {
      return
    }
    
    // Set initial empty folders
    const initialFolders = createInitialFolders()
    setFolders(initialFolders)
    setSelectedFolderId(initialFolders[0].id)
    setExpandedFolders(new Set())
    setIsFirstTime(false)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('koouk-folders', JSON.stringify(initialFolders))
      localStorage.setItem('koouk-selected-folder', initialFolders[0].id)
      localStorage.setItem('koouk-expanded-folders', JSON.stringify([]))
    }
    
    // Update search engine
    searchEngine.updateIndex(initialFolders)
  }

  const handleShareFolder = (folderId: string) => {
    const folderToShare = findFolderById(folders, folderId)
    if (!folderToShare) return

    const title = prompt('Enter title for sharing:', folderToShare.name)
    if (!title?.trim()) return

    const description = prompt('Enter description (optional):', '')
    if (description === null) return

    const category = prompt('Enter category:', 'lifestyle')
    if (!category) return

    // Share success notification to Share Place
    alert(`Folder '${title}' has been shared successfully!`)
  }

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
    const updatedFolders = addItemToFolder(folders, folderId, newItem)
    handleFoldersChange(updatedFolders)
  }

  // Get items from currently selected folder
  const getSelectedFolderItems = (): StorageItem[] => {
    if (!selectedFolderId) return []
    
    const findItems = (folders: FolderItem[]): StorageItem[] => {
      for (const folder of folders) {
        if (folder.id === selectedFolderId) {
          return folder.children.filter(child => child.type !== 'folder') as StorageItem[]
        }
        
        const childFolderItems = folder.children
          .filter(child => child.type === 'folder')
          .map(child => child as FolderItem)
        
        const found = findItems(childFolderItems)
        if (found.length > 0) return found
      }
      return []
    }

    return findItems(folders)
  }

  // Modal handlers
  const handleSaveMemo = (memo: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>, folderId: string) => {
    const newMemo = createStorageItem(memo.name, memo.type, memo.content, folderId, memo.metadata)
    const updatedFolders = addItemToFolder(folders, folderId, newMemo)
    handleFoldersChange(updatedFolders)
  }

  const handleSaveNote = (note: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>, folderId: string) => {
    const newNote = createStorageItem(note.name, note.type, note.content, folderId, note.metadata)
    const updatedFolders = addItemToFolder(folders, folderId, newNote)
    handleFoldersChange(updatedFolders)
  }

  const handleDocumentOpen = (item: StorageItem) => {
    setEditingItem(item)
    if (item.type === 'memo') {
      setShowQuickNoteModal(true)
    } else if (item.type === 'document') {
      setShowBigNoteModal(true)
    }
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading folders...</p>
        </div>
      </div>
    )
  }

  // Render MobileWorkspace for mobile environment
  if (device.isMobile) {
    return (
      <>
        <MobileWorkspace 
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFoldersChange={handleFoldersChange}
          onFolderSelect={handleFolderSelect}
        />
        
        {/* Modal Components */}
        <QuickNoteModal
          isOpen={showQuickNoteModal}
          onClose={() => setShowQuickNoteModal(false)}
          onSave={handleSaveMemo}
          folders={folders}
          selectedFolderId={selectedFolderId}
        />

        <BigNoteModal
          isOpen={showBigNoteModal}
          onClose={() => setShowBigNoteModal(false)}
          onSave={handleSaveNote}
          folders={folders}
          selectedFolderId={selectedFolderId}
        />

      </>
    )
  }

  // Render existing layout for desktop environment
  return (
    <div>
      {/* Mobile responsive container */}
      <div className="flex h-full relative">
        {/* Hamburger menu toggle button - Always visible on desktop */}
        <button
          onClick={() => {
            if (device.isMobile || device.isTablet) {
              setSidebarVisible(!sidebarVisible)
            } else {
              setSidebarCollapsed(!sidebarCollapsed)
            }
          }}
          className={`
            fixed top-20 z-50 p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
            ${sidebarCollapsed && !device.isMobile ? 'left-4' : sidebarVisible ? 'left-72' : 'left-4'}
          `}
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>

        {/* Sidebar */}
        <div className={`
          ${device.isMobile || device.isTablet 
            ? `${sidebarVisible ? 'translate-x-0' : '-translate-x-full'} fixed w-64` 
            : `${sidebarCollapsed ? 'w-0 -translate-x-full' : 'w-64 translate-x-0'} relative`
          }
          h-full border-r border-gray-100 bg-white
          transition-all duration-300 ease-in-out
          ${device.isMobile || device.isTablet ? 'z-40' : 'z-auto'}
          overflow-hidden
        `}>
          <div className="w-64 h-full">
          {/* Header section */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-900">My Folder</h2>
              <button 
                onClick={() => handleCreateFolder()}
                className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
                title="Create new folder"
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            {isFirstTime ? (
              <div className="space-y-3">
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs">🎓</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-blue-900 mb-1">Learn with samples!</h3>
                      <p className="text-[10px] text-blue-700 leading-relaxed">
                        The folders you see are sample data to help you learn how to use KOOUK. 
                        Click on each folder to explore different content types.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleStartMyFolder}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 
                             text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 
                             hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200
                             shadow-sm hover:shadow-md"
                >
                  <span>✨</span>
                  <span>Start My Own Folder</span>
                </button>
                
                <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                  Clicking the button will clear sample data and<br/>
                  start fresh with Folder1, Folder2, Folder3
                </p>
              </div>
            ) : (
              <button
                onClick={() => handleCreateFolder()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 
                           text-xs font-medium text-gray-700 hover:text-gray-900 
                           hover:bg-gray-50 rounded-lg transition-all duration-150
                           border border-gray-200 hover:border-gray-300 hover:shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Folder
              </button>
            )}
          </div>

          {/* Folder tree section */}
          <div className="px-3 py-2 overflow-y-auto h-[calc(100%-130px)]">
            <FolderTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              expandedFolders={expandedFolders}
              onFolderSelect={handleFolderSelect}
              onFolderToggle={handleFolderToggle}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onShareFolder={handleShareFolder}
              onCreateItem={handleCreateItem}
            />
          </div>

          {/* PWA Install Prompt - Bottom of sidebar */}
          <PWAInstallPrompt />
          </div>
        </div>

        {/* Mini Sidebar (collapsed state for desktop) */}
        {sidebarCollapsed && !device.isMobile && !device.isTablet && (
          <div className="w-16 h-full border-r border-gray-100 bg-white relative z-auto transition-all duration-300 ease-in-out">
            <div className="px-3 py-4 border-b border-gray-100">
              <button 
                onClick={() => handleCreateFolder()}
                className="w-10 h-10 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                title="Create new folder"
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="px-3 py-2 space-y-1 max-h-[calc(100%-80px)] overflow-y-auto">
              {folders.slice(0, 8).map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleFolderSelect(folder.id)}
                  className={`
                    w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center relative group
                    ${selectedFolderId === folder.id 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'hover:bg-gray-50 text-gray-600'
                    }
                  `}
                  title={folder.name}
                >
                  <span className="text-sm">{folder.style?.icon || '📁'}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {folder.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile overlay */}
        {sidebarVisible && (device.isMobile || device.isTablet) && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarVisible(false)}
          />
        )}

        {/* Main Content Area */}
        <div className={`
          ${device.isMobile || device.isTablet 
            ? 'flex-1' 
            : sidebarCollapsed 
              ? 'flex-1' 
              : 'flex-1'
          }
          bg-white overflow-y-auto transition-all duration-300 ease-in-out
        `}>
          <FolderContent 
            items={getSelectedFolderItems()}
            onCreateItem={(type) => selectedFolderId && handleCreateItem(type, selectedFolderId)}
            onDocumentOpen={handleDocumentOpen}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Universal Input Bar - Fixed bottom input */}
      <UniversalInputBar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onAddItem={(item, folderId) => {
          const updatedFolders = addItemToFolder(folders, folderId, item)
          handleFoldersChange(updatedFolders)
        }}
        onFolderSelect={handleFolderSelect}
        onOpenMemo={() => setShowQuickNoteModal(true)}
        onOpenNote={() => setShowBigNoteModal(true)}
      />

      {/* Modal Components */}
      <QuickNoteModal
        isOpen={showQuickNoteModal}
        onClose={() => {
          setShowQuickNoteModal(false)
          setEditingItem(null)
        }}
        onSave={handleSaveMemo}
        editNote={editingItem}
        folders={folders}
        selectedFolderId={selectedFolderId}
      />

      <BigNoteModal
        isOpen={showBigNoteModal}
        onClose={() => {
          setShowBigNoteModal(false)
          setEditingItem(null)
        }}
        onSave={handleSaveNote}
        editNote={editingItem}
        folders={folders}
        selectedFolderId={selectedFolderId}
      />
    </div>
  )
}

// Folder content component
const FolderContent = ({ 
  items, 
  onCreateItem,
  onDocumentOpen,
  searchQuery = ''
}: { 
  items: StorageItem[]
  onCreateItem: (type: StorageItem['type']) => void
  onDocumentOpen: (item: StorageItem) => void
  searchQuery?: string
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name' | 'type'>('recent')

  // Item click handler
  const handleItemClick = (item: StorageItem) => {
    if (item.type === 'url' || item.type === 'video') {
      // Open URLs and videos in new tab
      window.open(item.content, '_blank', 'noopener,noreferrer')
    } else if (item.type === 'document' || item.type === 'memo') {
      // Open documents and memos in modal
      onDocumentOpen(item)
    } else if (item.type === 'image') {
      // Open images in new tab
      window.open(item.content, '_blank', 'noopener,noreferrer')
    }
  }
  
  // Search filtering
  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    )
  })
  
  // Group items by type (videos > images > links > documents > memos)
  const typeOrder = { video: 0, image: 1, url: 2, document: 3, memo: 4 }
  
  const groupedItems = filteredItems.reduce((groups, item) => {
    const type = item.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(item)
    return groups
  }, {} as Record<string, StorageItem[]>)
  
  // Sort within each group
  const sortedGroups = Object.keys(groupedItems).sort((a, b) => {
    return (typeOrder[a as keyof typeof typeOrder] ?? 5) - (typeOrder[b as keyof typeof typeOrder] ?? 5)
  }).reduce((result, type) => {
    const items = [...groupedItems[type]].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name, 'ko')
        case 'type':
          return 0 // Already grouped by type
        default:
          return 0
      }
    })
    result[type] = items
    return result
  }, {} as Record<string, StorageItem[]>)

  const getSortLabel = () => {
    switch (sortBy) {
      case 'recent': return 'Recently Modified'
      case 'oldest': return 'Oldest First'
      case 'name': return 'By Name'
      case 'type': return 'By Type'
      default: return 'Recently Modified'
    }
  }

  if (items.length === 0) {
    return (
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Empty Folder</h3>
        <p className="text-xs text-gray-500 mb-6 max-w-sm">
          This folder is empty. Add some content to get started.
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {(['memo', 'document', 'url', 'image', 'video'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onCreateItem(type)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              {type === 'memo' && <StickyNote className="w-4 h-4" />}
              {type === 'document' && <FileText className="w-4 h-4" />}
              {type === 'url' && <Link className="w-4 h-4" />}
              {type === 'image' && <ImageIcon className="w-4 h-4" />}
              {type === 'video' && <Video className="w-4 h-4" />}
              Add {type}
            </button>
          ))}
        </div>
      </motion.div>
    )
  }

  if (searchQuery.trim() && filteredItems.length === 0) {
    return (
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500 max-w-sm">
          No items match &quot;{searchQuery}&quot;. Try different keywords or create new content.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="flex-1 px-2 py-3 sm:px-4 lg:px-6 lg:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-medium text-black">
            {filteredItems.length} items
          </h3>
          <p className="text-xs text-gray-500">
            {getSortLabel()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
            <option value="type">Type</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-1 border border-gray-200 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content by type groups */}
      {viewMode === 'grid' ? (
        <div className="space-y-8">
          {Object.entries(sortedGroups).map(([type, items]) => (
            <div key={type}>
              {/* Type header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                  {type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
                  {type === 'image' && <ImageIcon className="w-4 h-4 text-green-600" />}
                  {type === 'url' && <Link className="w-4 h-4 text-purple-600" />}
                  {type === 'document' && <FileText className="w-4 h-4 text-orange-600" />}
                  {type === 'memo' && <StickyNote className="w-4 h-4 text-yellow-600" />}
                  <h4 className="font-medium text-gray-900">
                    {type === 'url' ? 'Links' : type === 'document' ? 'Documents' : type === 'memo' ? 'Memos' : type === 'image' ? 'Images' : 'Videos'}
                  </h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {items.length}
                  </span>
                </div>
              </div>
              
              {/* Grid layout - Mobile 2 cols, Desktop up to 8 cols */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {items.slice(0, 12).map((item) => (
                  <ItemCard key={item.id} item={item} viewMode={viewMode} onItemClick={handleItemClick} />
                ))}
              </div>
              
              {/* Show more button */}
              {items.length > 12 && (
                <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <span>Show More ({items.length - 12} items)</span>
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(sortedGroups).flatMap(([, items]) => 
            items.map((item) => (
              <ItemCard key={item.id} item={item} viewMode={viewMode} onItemClick={handleItemClick} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Item card component
const ItemCard = ({ item, viewMode, onItemClick }: { item: StorageItem; viewMode: 'grid' | 'list'; onItemClick: (item: StorageItem) => void }) => {

  // Extract domain from link
  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  // Grid mode - unified card design
  if (viewMode === 'grid') {
    const getThumbnail = () => {
      if (item.type === 'video') {
        if (item.metadata?.thumbnail) return item.metadata.thumbnail
        if (isYouTubeUrl(item.content)) {
          return getYouTubeThumbnail(item.content)
        }
        return null
      }
      if (item.type === 'image') {
        return item.content
      }
      if (item.type === 'url') {
        // Use user-provided thumbnail if available
        if (item.metadata?.thumbnail) return item.metadata.thumbnail
        
        // Use thumbnail if YouTube URL
        if (isYouTubeUrl(item.content)) {
          return getYouTubeThumbnail(item.content)
        }
        
        // Use favicon if no thumbnail
        try {
          const domain = new URL(item.content).hostname
          return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
        } catch {
          return null
        }
      }
      return null
    }

    const getTextPreview = () => {
      if (item.type === 'document' || item.type === 'memo') {
        return item.content.substring(0, 120) + (item.content.length > 120 ? '...' : '')
      }
      return null
    }

    const thumbnail = getThumbnail()
    
    const getTypeIcon = () => {
      switch(item.type) {
        case 'video': return <Video className="w-4 h-4" />
        case 'image': return <ImageIcon className="w-4 h-4" />
        case 'url': return <Link className="w-4 h-4" />
        case 'document': return <FileText className="w-4 h-4" />
        case 'memo': return <StickyNote className="w-4 h-4" />
        default: return <FileText className="w-4 h-4" />
      }
    }

    return (
      <motion.div
        className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
        whileTap={{ scale: 0.98 }}
        onClick={() => onItemClick(item)}
      >
        {/* Preview area - 4:3 ratio (maintain image area, minimize bottom) */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] overflow-hidden">
          {thumbnail ? (
            <Image 
              src={thumbnail} 
              alt={item.name}
              fill
              className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${
                item.type === 'url' ? 'object-contain p-6' : 'object-cover'
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          
          {/* Text preview for documents/memos */}
          {!thumbnail && getTextPreview() && (
            <div className="absolute inset-0 p-3 flex flex-col justify-center">
              <div className="text-xs text-gray-600 leading-relaxed line-clamp-6">
                {getTextPreview()}
              </div>
            </div>
          )}
          
          {/* Fallback icon when no thumbnail or text preview */}
          <div 
            className="w-full h-full absolute inset-0 flex items-center justify-center" 
            style={{ display: (thumbnail || getTextPreview()) ? 'none' : 'flex' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-500 shadow-sm group-hover:scale-110 transition-all duration-300">
              {getTypeIcon()}
            </div>
          </div>
          

          {/* Duration for videos - improved style */}
          {item.type === 'video' && item.metadata?.duration && (
            <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-medium">
              {Math.floor(item.metadata.duration / 60)}:{(item.metadata.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        
        {/* Content - extremely compressed bottom (1:1 ratio) */}
        <div className="px-3 py-1.5 bg-white border-t border-gray-50">
          <h4 className="font-medium text-gray-800 truncate text-xs leading-none tracking-tight">
            {(item.metadata?.title as string) || item.name}
          </h4>
        </div>
      </motion.div>
    )
  }

  // List mode
  return (
    <div className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-all cursor-pointer" onClick={() => onItemClick(item)}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
          {item.type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
          {item.type === 'image' && <ImageIcon className="w-4 h-4 text-green-600" />}
          {item.type === 'url' && <Link className="w-4 h-4 text-purple-600" />}
          {item.type === 'document' && <FileText className="w-4 h-4 text-orange-600" />}
          {item.type === 'memo' && <StickyNote className="w-4 h-4 text-yellow-600" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate text-sm">
          {(item.metadata?.title as string) || item.name}
        </h4>
        <p className="text-xs text-gray-500 truncate">
          {item.type === 'url' ? getDomain(item.content) : 
           item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content}
        </p>
      </div>
      <div className="text-xs text-gray-400">
        {new Date(item.updatedAt).toLocaleDateString('ko-KR')}
      </div>
    </div>
  )
}

// Utility functions
function findFolderById(folders: FolderItem[], folderId: string): FolderItem | null {
  for (const folder of folders) {
    if (folder.id === folderId) {
      return folder
    }
    
    const childFolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
    const found = findFolderById(childFolders, folderId)
    if (found) return found
  }
  return null
}

function addToParentFolder(folders: FolderItem[], parentId: string, newItem: FolderItem | StorageItem): FolderItem[] {
  return folders.map(folder => {
    if (folder.id === parentId) {
      return {
        ...folder,
        children: [...folder.children, newItem],
        updatedAt: new Date().toISOString()
      }
    }
    
    return {
      ...folder,
      children: folder.children.map(child =>
        child.type === 'folder' 
          ? addToParentFolder([child as FolderItem], parentId, newItem)[0]
          : child
      )
    }
  })
}

function updateFolderInTree(folders: FolderItem[], folderId: string, updates: Partial<FolderItem>): FolderItem[] {
  return folders.map(folder => {
    if (folder.id === folderId) {
      return { ...folder, ...updates }
    }
    
    return {
      ...folder,
      children: folder.children.map(child =>
        child.type === 'folder'
          ? updateFolderInTree([child as FolderItem], folderId, updates)[0]
          : child
      )
    }
  })
}

function removeFolderFromTree(folders: FolderItem[], folderId: string): FolderItem[] {
  return folders
    .filter(folder => folder.id !== folderId)
    .map(folder => ({
      ...folder,
      children: folder.children
        .filter(child => child.id !== folderId)
        .map(child =>
          child.type === 'folder'
            ? removeFolderFromTree([child as FolderItem], folderId)[0]
            : child
        )
    }))
}

function addItemToFolder(folders: FolderItem[], folderId: string, newItem: StorageItem): FolderItem[] {
  return folders.map(folder => {
    if (folder.id === folderId) {
      return {
        ...folder,
        children: [...folder.children, newItem],
        updatedAt: new Date().toISOString()
      }
    }
    
    return {
      ...folder,
      children: folder.children.map(child =>
        child.type === 'folder'
          ? addItemToFolder([child as FolderItem], folderId, newItem)[0]
          : child
      )
    }
  })
}