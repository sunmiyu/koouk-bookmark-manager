'use client'

import { useState, useEffect } from 'react'
import FolderContent from './FolderContent'
import UniversalInputBar from '../ui/UniversalInputBar'
import QuickNoteModal from '../modals/QuickNoteModal'
import BigNoteModal from '../modals/BigNoteModal'
import QuickAddModal from '../modals/QuickAddModal'
import ShareFolderModal from '../modals/ShareFolderModal'
import MobileWorkspace from '../mobile/MobileWorkspace'
import { FolderItem, StorageItem, createFolder, createStorageItem } from '@/types/folder'
import { searchEngine } from '@/lib/search-engine'
import { useDevice } from '@/hooks/useDevice'

export default function WorkspaceContent({ searchQuery = '' }: { searchQuery?: string }) {
  const device = useDevice()
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false)
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showShareFolderModal, setShowShareFolderModal] = useState(false)
  const [folderToShare, setFolderToShare] = useState<FolderItem | null>(null)
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)

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
          
          // 🎯 더미 데이터 자동 감지 및 제거
          const hasDummyData = parsedFolders.some((folder: FolderItem) => 
            folder.name?.includes('Sample') || 
            folder.name?.includes('Folder') ||
            folder.children?.some((item: StorageItem | FolderItem) => 
              item.name?.includes('Sample') || 
              ('content' in item && item.content?.includes('example.com'))
            )
          )
          
          if (hasDummyData) {
            // 더미 데이터가 감지되면 완전히 초기화
            console.log('Dummy data detected, clearing...')
            localStorage.removeItem('koouk-folders')
            localStorage.removeItem('koouk-selected-folder')
            localStorage.removeItem('koouk-expanded-folders')
            setIsFirstTime(true)
            setFolders([])
          } else {
            setFolders(parsedFolders)
            
            if (parsedFolders.length > 0 && !savedSelectedId) {
              setSelectedFolderId(parsedFolders[0].id)
            }
          }
        } else {
          // 🎯 NEW: 완전히 깨끗한 시작 - 더미 데이터 없음
          setIsFirstTime(true)
          setFolders([])
        }

        if (savedSelectedId) {
          setSelectedFolderId(savedSelectedId)
        }

        if (savedExpandedIds) {
          setExpandedFolders(new Set(JSON.parse(savedExpandedIds)))
        }
      } catch (error) {
        console.error('Data loading failed:', error)
        // On error, start clean
        setFolders([])
        setIsFirstTime(true)
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

  // 🎯 NEW: 모던 폴더 생성 - prompt 대신 인라인 생성
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
    
    // Select newly created folder
    handleFolderSelect(newFolder.id)
    
    // Close modal and reset state
    setShowCreateFolderModal(false)
    setNewFolderName('')
    setIsFirstTime(false)
  }

  const handleShareFolder = (folderId: string) => {
    const folder = findFolderById(folders, folderId)
    if (!folder) return
    
    setFolderToShare(folder)
    setShowShareFolderModal(true)
  }

  const handleShareSubmit = (shareData: { title: string; description: string; category: string }) => {
    if (!folderToShare) return

    // Create SharedFolder object
    const sharedFolder = {
      id: Date.now().toString(),
      title: shareData.title,
      description: shareData.description,
      category: shareData.category.toLowerCase(),
      tags: ['user-shared', folderToShare.name.toLowerCase()],
      coverImage: null,
      author: {
        name: 'User',
        verified: false
      },
      stats: {
        likes: 0,
        downloads: 0
      },
      folder: {
        ...folderToShare,
        id: Date.now().toString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to shared folders in localStorage
    try {
      const existingShared = localStorage.getItem('koouk-shared-folders')
      const sharedFolders = existingShared ? JSON.parse(existingShared) : []
      sharedFolders.unshift(sharedFolder)
      
      localStorage.setItem('koouk-shared-folders', JSON.stringify(sharedFolders))
      
      alert(`Folder '${shareData.title}' has been shared successfully!
You can see it in the Market Place.`)
    } catch (error) {
      console.error('Failed to save shared folder:', error)
      alert('Failed to share folder. Please try again.')
    }
  }

  const handleCreateItem = (type?: StorageItem['type'], folderId?: string) => {
    if (folderId) {
      // Direct item creation with specified type and folder
      if (type) {
        // Could open specific type modal here
        setShowQuickAddModal(true)
      } else {
        setShowQuickAddModal(true)
      }
    } else {
      // General quick add modal
      setShowQuickAddModal(true)
    }
  }

  const handleQuickAddSave = (item: StorageItem) => {
    if (!selectedFolderId) return
    
    const updatedFolders = addItemToFolder(folders, selectedFolderId, item)
    handleFoldersChange(updatedFolders)
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

  // 🎯 NEW: 첫 사용자를 위한 깔끔한 온보딩
  if (isFirstTime && folders.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📁</span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Welcome to KOOUK
          </h2>
          
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Start organizing your digital life with your first folder. 
            It&apos;s as simple as giving it a name.
          </p>
          
          <button
            onClick={() => handleCreateFolder()}
            className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Create Your First Folder
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            No learning curve. Just start organizing.
          </p>
        </div>
        
        {/* 폴더 생성 모달 */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Create Your First Folder
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

  // 🎯 UNIFIED: PC uses same layout as mobile (no folder tree sidebar)
  if (device.width >= 768) {
    // 💻 PC 레이아웃 - Mobile과 동일한 구조
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Content Header with actions */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">My Folders</h2>
              <span className="text-sm text-gray-500">{folders.length} folders</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuickNoteModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📝 Note
              </button>
              <button
                onClick={() => setShowBigNoteModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                📄 Memo
              </button>
              <button
                onClick={() => handleCreateFolder()}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                + New Folder
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Same as mobile */}
        <div className="flex-1 overflow-hidden">
          {selectedFolderId ? (
            <>
              <FolderContent
                key={selectedFolderId}
                folderId={selectedFolderId}
                folders={folders}
                editingItem={editingItem}
                onFoldersChange={handleFoldersChange}
                onSaveMemo={handleSaveMemo}
                onSaveNote={handleSaveNote}
                onCreateItem={handleCreateItem}
                onDocumentOpen={handleDocumentOpen}
                searchQuery={searchQuery}
              />
              
              {/* Universal Input Bar at the bottom */}
              <div className="border-t border-gray-200 bg-white">
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
              </div>
            </>
          ) : (
            // Use mobile folder list for PC too
            <MobileWorkspace 
              folders={folders}
              selectedFolderId={selectedFolderId}
              onFoldersChange={handleFoldersChange}
              onFolderSelect={handleFolderSelect}
              onShareFolder={handleShareFolder}
            />
          )}
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
                  placeholder="Folder name"
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

        <QuickAddModal
          isOpen={showQuickAddModal}
          onClose={() => setShowQuickAddModal(false)}
          onSave={handleQuickAddSave}
          folderId={selectedFolderId || ''}
        />

        <ShareFolderModal
          isOpen={showShareFolderModal}
          onClose={() => setShowShareFolderModal(false)}
          onShare={handleShareSubmit}
          folder={folderToShare}
        />
      </div>
    )
  }

  // 📱 모바일 레이아웃 - 기존 MobileWorkspace 사용하되 개선
  return (
    <>
      <MobileWorkspace 
        folders={folders}
        selectedFolderId={selectedFolderId}
        onFoldersChange={handleFoldersChange}
        onFolderSelect={handleFolderSelect}
        onShareFolder={handleShareFolder}
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