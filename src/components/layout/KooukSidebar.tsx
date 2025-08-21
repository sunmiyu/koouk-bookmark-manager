'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Plus, Search, LogOut, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { FolderItem } from '@/types/folder'
import { useAuth } from '@/components/auth/AuthProvider'

interface KooukSidebarProps {
  activeTab: 'my-folder' | 'bookmarks' | 'marketplace'
  onTabChange: (tab: 'my-folder' | 'bookmarks' | 'marketplace') => void
  folders?: FolderItem[]
  selectedFolderId?: string
  onFolderSelect?: (folderId: string) => void
  onCreateFolder?: () => void
  onReorderFolders?: (reorderedFolders: FolderItem[]) => void
  onEditFolder?: (folderId: string, newName: string) => void
  onDeleteFolder?: (folderId: string) => void
  sharedFolderIds?: Set<string>
  onAccountClick?: () => void
}

export default function KooukSidebar({
  activeTab,
  onTabChange,
  folders = [],
  selectedFolderId,
  onFolderSelect,
  onCreateFolder,
  onReorderFolders,
  onEditFolder,
  onDeleteFolder,
  sharedFolderIds = new Set(),
  onAccountClick
}: KooukSidebarProps) {
  const { user, signOut } = useAuth()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null)
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>('')

  // 🎨 PERFECTION FIX: Add proper icons for visual clarity
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'storage': return '📁' // Folder icon
      case 'bookmarks': return '🔖' // Bookmark icon  
      case 'marketplace': return '🎆' // Marketplace icon
      default: return '📁'
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'url': return '🔗'
      case 'image': return '🖼️'
      case 'video': return '📺'
      case 'document': return '📄'
      case 'memo': return '📝'
      default: return '📄'
    }
  }

  // 🎯 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newFolders = [...folders]
    const draggedFolder = newFolders[draggedIndex]
    
    // 드래그된 폴더를 제거
    newFolders.splice(draggedIndex, 1)
    
    // 새로운 위치에 삽입
    const actualDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newFolders.splice(actualDropIndex, 0, draggedFolder)
    
    onReorderFolders?.(newFolders)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // 폴더 편집/삭제 핸들러
  const handleEditStart = (folder: FolderItem) => {
    setEditingFolderId(folder.id)
    setEditingName(folder.name)
    setShowDropdownId(null)
  }

  const handleEditSave = () => {
    if (editingFolderId && editingName.trim()) {
      onEditFolder?.(editingFolderId, editingName.trim())
      setEditingFolderId(null)
      setEditingName('')
    }
  }

  const handleEditCancel = () => {
    setEditingFolderId(null)
    setEditingName('')
  }

  const handleDelete = (folderId: string) => {
    if (confirm('Are you sure you want to delete this folder?')) {
      onDeleteFolder?.(folderId)
    }
    setShowDropdownId(null)
  }

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = () => setShowDropdownId(null)
    if (showDropdownId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showDropdownId])

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
      
      {/* 상단 브랜드 헤더 */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <h1 className="text-sm font-semibold text-gray-900">
              KOOUK
            </h1>
          </div>
          <div className="text-xs text-gray-500">
            Personal Hub
          </div>
        </div>
      </div>

      {/* 🎚️ 탭 선택 - 책갈피 스타일 */}
      <div className="px-2 py-4 border-b border-gray-200">
        <div className="flex gap-0.5">
          <button 
            onClick={() => onTabChange('my-folder')}
            className={`flex-1 relative group min-w-0 ${
              activeTab === 'my-folder' ? 'z-10' : ''
            }`}
          >
            <div className={`rounded-t-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 flex items-center justify-center ${
              activeTab === 'my-folder'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}>
              <span className="truncate">My Folder</span>
            </div>
            {activeTab === 'my-folder' && (
              <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-gray-900 rounded-t-lg"></div>
            )}
          </button>
          
          <button 
            onClick={() => onTabChange('bookmarks')}
            className={`flex-1 rounded-t-lg px-3 py-2.5 text-xs font-medium transition-colors flex items-center justify-center min-w-0 ${
              activeTab === 'bookmarks'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="truncate">Bookmarks</span>
          </button>
          
          <button 
            onClick={() => onTabChange('marketplace')}
            className={`flex-1 rounded-t-lg px-3 py-2.5 text-xs font-medium transition-colors flex items-center justify-center min-w-0 ${
              activeTab === 'marketplace'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="truncate">Market Place</span>
          </button>
        </div>
      </div>

      {/* 🗂️ 동적 콘텐츠 영역 */}
      <div className="flex-1 overflow-hidden">
        
        {/* My Folder 서랍 */}
        {activeTab === 'my-folder' && (
          <div className="flex flex-col h-full p-4 space-y-3">
            
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search folders..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors placeholder-gray-400"
              />
            </div>
            
            {/* 새 폴더 만들기 - "새 서랍" */}
            <button 
              onClick={onCreateFolder}
              className="group w-full flex items-center gap-3 p-4 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform text-white font-bold text-sm">
                +
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-gray-900">New Folder</div>
                <div className="text-xs text-gray-600">Create your collection</div>
              </div>
            </button>

            {/* 폴더 리스트 - "서랍장" 스타일 with Drag & Drop */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {folders.map((folder, index) => {
                const isShared = sharedFolderIds.has(folder.id)
                const isDragging = draggedIndex === index
                const isDropTarget = dragOverIndex === index
                
                return (
                  <motion.button
                    key={folder.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onFolderSelect?.(folder.id)}
                    className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                      selectedFolderId === folder.id
                        ? 'bg-gray-900 text-white shadow-lg scale-[1.02]'
                        : isShared
                        ? 'bg-blue-50 hover:bg-blue-100 hover:shadow-md text-blue-900 border border-blue-200'
                        : 'bg-white hover:bg-gray-50 hover:shadow-md text-gray-700 hover:text-gray-900'
                    } ${
                      isDragging ? 'opacity-50 scale-95' : ''
                    } ${
                      isDropTarget ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                    }`}
                    whileHover={{ y: isDragging ? 0 : -1 }}
                    whileTap={{ scale: isDragging ? 0.95 : 0.98 }}
                  >
                    {/* 드래그 핸들 */}
                    <div className="drag-handle opacity-0 group-hover:opacity-60 transition-opacity">
                      <div className="flex flex-col gap-0.5">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* 폴더 아이콘 */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm ${
                      selectedFolderId === folder.id 
                        ? 'bg-white/20 text-white' 
                        : isShared
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isShared ? '👥' : folder.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* 폴더 정보 */}
                    <div className="flex-1 min-w-0 text-left">
                      {editingFolderId === folder.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave()
                              if (e.key === 'Escape') handleEditCancel()
                            }}
                            onBlur={handleEditSave}
                            className="flex-1 text-xs font-medium bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="font-medium text-xs truncate flex items-center gap-1">
                          {folder.name}
                          {isShared && (
                            <span className="text-blue-600 text-xs">
                              📤
                            </span>
                          )}
                        </div>
                      )}
                      <div className={`text-xs opacity-75 ${
                        selectedFolderId === folder.id 
                          ? 'text-white' 
                          : isShared 
                          ? 'text-blue-600' 
                          : 'text-gray-500'
                      }`}>
                        {folder.children.length} items
                        {isShared && (
                          <span className="ml-1 text-blue-500">
                            • shared
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 드롭다운 메뉴 */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDropdownId(showDropdownId === folder.id ? null : folder.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>
                      
                      {showDropdownId === folder.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-32">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditStart(folder)
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <Edit className="w-3 h-3" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(folder.id)
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 상태 표시 */}
                    {selectedFolderId === folder.id && (
                      <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                    )}
                  </motion.button>
                )
              })}
              
              {folders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-sm mb-2 font-medium text-gray-400">Empty</div>
                  <div className="text-xs">No folders yet</div>
                  <div className="text-xs">Create your first collection</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookmarks 서랍 - My Folder와 동일한 폴더 구조 */}
        {activeTab === 'bookmarks' && (
          <div className="flex flex-col h-full p-4 space-y-3">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search bookmark folders..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors placeholder-gray-400"
              />
            </div>
            
            {/* New Bookmark Folder 버튼 - My Folder의 New Folder와 완전히 동일한 스타일 */}
            <button className="group w-full flex items-center gap-3 p-4 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-200">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform text-white font-bold text-sm">
                +
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-gray-900">New Bookmark Folder</div>
                <div className="text-xs text-gray-600">Create collection</div>
              </div>
            </button>

            {/* 북마크 폴더 리스트 - My Folder와 동일한 스타일 */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {[
                { id: '1', name: 'Development', count: 8, icon: '💻', color: '#3B82F6' },
                { id: '2', name: 'Design Resources', count: 12, icon: '🎨', color: '#EF4444' },
                { id: '3', name: 'Learning', count: 5, icon: '📚', color: '#10B981' },
                { id: '4', name: 'Tools & Utilities', count: 15, icon: '🛠️', color: '#F59E0B' },
                { id: '5', name: 'Entertainment', count: 6, icon: '🎬', color: '#8B5CF6' }
              ].map((bookmarkFolder) => (
                <motion.button
                  key={bookmarkFolder.id}
                  className={`group w-full flex items-center gap-3 p-4 bg-white hover:bg-gray-50 border-2 rounded-lg transition-all duration-200 text-left ${
                    selectedFolderId === bookmarkFolder.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:border-gray-200 hover:shadow-md'
                  }`}
                  onClick={() => onFolderSelect?.(bookmarkFolder.id)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* 폴더 아이콘 - My Folder와 동일한 스타일 */}
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                    style={{ backgroundColor: bookmarkFolder.color }}
                  >
                    {bookmarkFolder.icon}
                  </div>
                  
                  {/* 폴더 정보 - My Folder와 동일한 레이아웃 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate text-gray-900">
                      {bookmarkFolder.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {bookmarkFolder.count} {bookmarkFolder.count === 1 ? 'bookmark' : 'bookmarks'}
                    </div>
                  </div>

                  {/* 공유 아이콘 표시 (있는 경우) */}
                  {sharedFolderIds.has(bookmarkFolder.id) && (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </motion.button>
              ))}
              
              {/* 빈 상태 메시지 */}
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm mb-2 font-medium text-gray-400">Empty</div>
                <div className="text-xs">No bookmark folders yet</div>
                <div className="text-xs">Create your first collection</div>
              </div>
            </div>
          </div>
        )}

        {/* Market Place 서랍 */}
        {activeTab === 'marketplace' && (
          <div className="flex flex-col h-full p-4 space-y-3">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search collections..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors placeholder-gray-400"
              />
            </div>

            {/* 탭 선택 */}
            <div className="flex rounded-xl bg-gray-100 p-1">
              <button 
                onClick={() => {/* TODO: Add marketplace tab change handler */}}
                className="flex-1 text-xs py-2 rounded-lg bg-white text-gray-900 shadow-sm font-medium"
              >
                Browse
              </button>
              <button 
                onClick={() => {/* TODO: Add marketplace tab change handler */}}
                className="flex-1 text-xs py-2 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
              >
                My Shared
              </button>
            </div>

            {/* 카테고리 필터 */}
            <div className="flex-1 overflow-y-auto space-y-1">
              <div className="px-2 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categories</h3>
              </div>
              
              {[
                { emoji: '💼', label: 'Business', count: 145 },
                { emoji: '🎨', label: 'Creative', count: 89 },
                { emoji: '💻', label: 'Tech', count: 201 },
                { emoji: '📚', label: 'Education', count: 67 },
                { emoji: '🏠', label: 'Lifestyle', count: 134 },
                { emoji: '🎵', label: 'Entertainment', count: 78 },
                { emoji: '🍽️', label: 'Food & Recipe', count: 156 },
                { emoji: '✈️', label: 'Travel', count: 92 },
                { emoji: '🏃', label: 'Health & Fitness', count: 73 },
                { emoji: '💰', label: 'Finance', count: 84 },
                { emoji: '🛒', label: 'Shopping', count: 118 },
                { emoji: '⚽', label: 'Sports', count: 65 },
                { emoji: '🎮', label: 'Gaming', count: 127 },
                { emoji: '📰', label: 'News', count: 95 },
                { emoji: '🔬', label: 'Science', count: 58 }
              ].map(category => (
                <button 
                  key={category.label}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{category.emoji}</span>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>


          </div>
        )}
      </div>

      {/* 🧑‍💼 하단 사용자 프로필 */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        {user ? (
          <button 
            onClick={onAccountClick}
            className="flex items-center gap-3 w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-sm">
              T
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user.user_metadata?.name || user.email?.split('@')[0]}
              </div>
              <div className="text-xs text-gray-600">
                Personal Library
              </div>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-sm">Please sign in</div>
            <div className="text-xs">to access your library</div>
          </div>
        )}
      </div>

    </div>
  )
}