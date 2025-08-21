'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Plus, Search, LogOut } from 'lucide-react'
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
  sharedFolderIds = new Set(),
  onAccountClick
}: KooukSidebarProps) {
  const { user, signOut } = useAuth()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

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
                      <div className="font-medium text-xs truncate flex items-center gap-1">
                        {folder.name}
                        {isShared && (
                          <span className="text-blue-600 text-xs">
                            📤
                          </span>
                        )}
                      </div>
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

        {/* Bookmarks 서랍 */}
        {activeTab === 'bookmarks' && (
          <div className="flex flex-col h-full p-4 space-y-3">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search bookmarks..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors placeholder-gray-400"
              />
            </div>
            
            {/* New Bookmark 버튼 - My Folder의 New Folder와 동일한 스타일 */}
            <button className="w-full group flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform text-white font-bold text-sm">
                +
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-gray-900">New Bookmark</div>
                <div className="text-xs text-gray-600">Save your link</div>
              </div>
            </button>

            {/* 북마크 리스트 */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {[
                { id: '1', title: 'GitHub Repository', url: 'github.com', category: 'Development' },
                { id: '2', title: 'Design Inspiration', url: 'dribbble.com', category: 'Design' },
                { id: '3', title: 'React Documentation', url: 'react.dev', category: 'Learning' },
                { id: '4', title: 'Figma Community', url: 'figma.com', category: 'Design' },
                { id: '5', title: 'Stack Overflow', url: 'stackoverflow.com', category: 'Development' }
              ].map((bookmark) => (
                <button
                  key={bookmark.id}
                  className="w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50 hover:shadow-md text-gray-700 hover:text-gray-900"
                >
                  {/* 북마크 아이콘 */}
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm bg-gray-100 text-gray-800">
                    🔖
                  </div>
                  
                  {/* 북마크 정보 */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium text-xs truncate">
                      {bookmark.title}
                    </div>
                    <div className="text-xs opacity-75 text-gray-500">
                      {bookmark.url}
                    </div>
                  </div>
                </button>
              ))}
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

            {/* 정렬 옵션 */}
            <div className="border-t border-gray-100 pt-3">
              <select className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors">
                <option>Most Popular</option>
                <option>Most Recent</option>
                <option>Most Helpful</option>
              </select>
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