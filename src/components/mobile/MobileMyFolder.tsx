'use client'

import { useState } from 'react'
import { FolderItem, StorageItem, createFolder, createStorageItem } from '@/types/folder'
import QuickNoteModal from '@/components/modals/QuickNoteModal'
import BigNoteModal from '@/components/modals/BigNoteModal'
import UniversalInputBar from '@/components/ui/UniversalInputBar'

interface MobileMyFolderProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onFoldersChange: (folders: FolderItem[]) => void
  onFolderSelect: (folderId: string) => void
  onShareFolder?: (folderId: string) => void
}

export default function MobileMyFolder({ 
  folders, 
  onFoldersChange,
  onFolderSelect: parentOnFolderSelect,
  onShareFolder
}: MobileMyFolderProps) {
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false)
  const [showBigNoteModal, setShowBigNoteModal] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null)

  // Now can render on desktop too (unified layout)
  // if (device.isDesktop) return null

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

  // 🎯 NEW: 폴더 선택 시 즉시 내용 보기 (2단계 네비게이션)
  const handleFolderSelect = (folder: FolderItem) => {
    setSelectedFolder(folder)
    parentOnFolderSelect(folder.id)
  }

  // Navigate back to folder list
  const handleBackToList = () => {
    setSelectedFolder(null)
    parentOnFolderSelect('')
  }

  // 🎯 NEW: 모던 폴더 생성 - prompt 대신 모달
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
    
    const updatedFolders = [newFolder, ...folders]
    onFoldersChange(updatedFolders)
    
    // Close modal and reset state
    setShowCreateFolderModal(false)
    setNewFolderName('')
  }

  // Add item to folder
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

  // 🎯 NEW: 빠른 추가 기능
  const handleQuickAdd = (type: 'url' | 'memo' | 'image', content: string, title?: string) => {
    if (!selectedFolder) return

    const newItem = createStorageItem(
      title || `New ${type}`,
      type,
      content,
      selectedFolder.id
    )

    const updatedFolders = addItemToFolder(folders, selectedFolder.id, newItem)
    onFoldersChange(updatedFolders)
    
    // Update selected folder
    const updatedFolder = findFolderById(updatedFolders, selectedFolder.id)
    if (updatedFolder) {
      setSelectedFolder(updatedFolder)
    }
  }

  // Item selection handler
  const handleItemSelect = (item: StorageItem) => {
    if (item.type === 'url') {
      window.open(item.content, '_blank')
      return
    }

    if (item.type === 'memo' || item.type === 'document') {
      if (item.type === 'memo') {
        setShowQuickNoteModal(true)
      } else {
        setShowBigNoteModal(true)
      }
    }
  }

  // 🎯 NEW: 첫 사용자 깔끔한 시작
  if (folders.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📁</span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Welcome to KOOUK
          </h2>
          
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Start organizing your digital life with your first folder.
          </p>
          
          <button
            onClick={handleCreateFolder}
            className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Create Your First Folder
          </button>
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

  // Render content
  if (!selectedFolder) {
    // 📱 폴더 목록 뷰 - Bookmarks/MarketPlace 스타일 적용
    return (
      <div className="flex-1 px-3 py-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600 mt-1">
              {folders.length} folders
            </p>
          </div>
          
          <button
            onClick={handleCreateFolder}
            className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
            title="Create New Folder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* 폴더 그리드 - MarketPlace 카드 스타일 */}
        <div className="grid grid-cols-2 gap-3">
          {folders.map((folder) => {
            const itemCount = folder.children.length
            const recentItems = folder.children.slice(0, 3)
            
            return (
              <button
                key={folder.id}
                onClick={() => handleFolderSelect(folder)}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-4 text-left"
              >
                {/* 폴더 아이콘 */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-xl">{folder.icon || '📁'}</span>
                </div>

                {/* 폴더 정보 */}
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight">
                  {folder.name || 'Untitled Folder'}
                </h3>

                {/* 아이템 카운트 */}
                <p className="text-xs text-gray-500 mb-3">
                  {itemCount} items
                </p>

                {/* 최근 아이템 미리보기 */}
                {recentItems.length > 0 && (
                  <div className="space-y-1">
                    {recentItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <span className="text-xs text-gray-600 truncate">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 업데이트 시간 */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {new Date(folder.updatedAt || folder.createdAt).toLocaleDateString('ko-KR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Universal Input Bar for mobile folder list - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
          <UniversalInputBar
            folders={folders}
            selectedFolderId={folders.length > 0 ? folders[0].id : undefined}
            onAddItem={(item, folderId) => {
              const updatedFolders = addItemToFolder(folders, folderId, item)
              onFoldersChange(updatedFolders)
            }}
            onFolderSelect={() => {}} // Not needed in list view
            onOpenMemo={() => setShowQuickNoteModal(true)}
            onOpenNote={() => setShowBigNoteModal(true)}
          />
        </div>

        {/* Add bottom padding to prevent content overlap */}
        <div className="h-24"></div>

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
      </div>
    )
  }

  // 📂 폴더 내용 뷰 - 단순화된 2단계 네비게이션
  return (
    <div className="flex-1 flex flex-col">
      {/* 헤더 */}
      <div className="px-3 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div>
              <h2 className="font-medium text-gray-900 text-sm">
                {selectedFolder.name || 'Untitled Folder'}
              </h2>
              <p className="text-xs text-gray-500">
                {selectedFolder.children.length} items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Add button - bordered style */}
            <button
              onClick={() => setShowQuickAddModal(true)}
              className="w-8 h-8 border border-gray-300 text-gray-600 rounded-lg flex items-center justify-center hover:border-gray-400 hover:text-gray-800 transition-colors"
              title="Quick Add"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* 공유 버튼 */}
            <button
              onClick={() => onShareFolder?.(selectedFolder.id)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share Folder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        {selectedFolder.children.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Empty folder</h3>
              <p className="text-sm text-gray-500 mb-4">Add your first item to get started</p>
              <button
                onClick={() => setShowQuickAddModal(true)}
                className="bg-black text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedFolder.children
              .filter(item => item.type !== 'folder')
              .map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemSelect(item as StorageItem)}
                className="w-full bg-white rounded-lg border border-gray-200 p-4 text-left hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  {/* 아이템 타입 아이콘 */}
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.type === 'url' && <span className="text-lg">🔗</span>}
                    {item.type === 'memo' && <span className="text-lg">📝</span>}
                    {item.type === 'document' && <span className="text-lg">📄</span>}
                    {item.type === 'image' && <span className="text-lg">🖼️</span>}
                    {item.type === 'video' && <span className="text-lg">🎥</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    
                    {item.content && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {item.type === 'url' ? item.content : item.content.substring(0, 100)}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString('ko-KR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      
                      {item.type === 'url' && (
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Universal Input Bar for folder content view - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
        <UniversalInputBar
          folders={folders}
          selectedFolderId={selectedFolder.id}
          onAddItem={(item, folderId) => {
            const updatedFolders = addItemToFolder(folders, folderId, item)
            onFoldersChange(updatedFolders)
            
            // Update selected folder to reflect new content
            const updatedFolder = findFolderById(updatedFolders, folderId)
            if (updatedFolder) {
              setSelectedFolder(updatedFolder)
            }
          }}
          onFolderSelect={() => {}} // Not needed in content view
          onOpenMemo={() => setShowQuickNoteModal(true)}
          onOpenNote={() => setShowBigNoteModal(true)}
        />
      </div>

      {/* Add bottom padding to prevent content overlap */}
      <div className="h-24"></div>

      {/* 빠른 추가 모달 */}
      {showQuickAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                Quick Add
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const url = prompt('Enter URL:')
                    if (url) {
                      handleQuickAdd('url', url, url)
                      setShowQuickAddModal(false)
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🔗</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Add URL</div>
                    <div className="text-sm text-gray-500">Save a website link</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const memo = prompt('Write your memo:')
                    if (memo) {
                      handleQuickAdd('memo', memo, 'Quick Memo')
                      setShowQuickAddModal(false)
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📝</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Quick Memo</div>
                    <div className="text-sm text-gray-500">Write a quick note</div>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="w-full mt-6 py-3 text-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Components */}
      <QuickNoteModal
        isOpen={showQuickNoteModal}
        onClose={() => setShowQuickNoteModal(false)}
        onSave={(memo) => {
          const newMemo = createStorageItem(memo.name, memo.type, memo.content, selectedFolder.id, memo.metadata)
          const updatedFolders = addItemToFolder(folders, selectedFolder.id, newMemo)
          onFoldersChange(updatedFolders)
          
          // Update selected folder
          const updatedFolder = findFolderById(updatedFolders, selectedFolder.id)
          if (updatedFolder) {
            setSelectedFolder(updatedFolder)
          }
        }}
        folders={folders}
        selectedFolderId={selectedFolder.id}
      />

      <BigNoteModal
        isOpen={showBigNoteModal}
        onClose={() => setShowBigNoteModal(false)}
        onSave={(note) => {
          const newNote = createStorageItem(note.name, note.type, note.content, selectedFolder.id, note.metadata)
          const updatedFolders = addItemToFolder(folders, selectedFolder.id, newNote)
          onFoldersChange(updatedFolders)
          
          // Update selected folder
          const updatedFolder = findFolderById(updatedFolders, selectedFolder.id)
          if (updatedFolder) {
            setSelectedFolder(updatedFolder)
          }
        }}
        folders={folders}
        selectedFolderId={selectedFolder.id}
      />
    </div>
  )
}