'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { FolderItem } from '@/types/folder'
import { useAuth } from '@/components/auth/AuthProvider'

interface KooukSidebarProps {
  activeTab: 'storage' | 'bookmarks' | 'marketplace'
  onTabChange: (tab: 'storage' | 'bookmarks' | 'marketplace') => void
  folders?: FolderItem[]
  selectedFolderId?: string
  onFolderSelect?: (folderId: string) => void
  onCreateFolder?: () => void
}

export default function KooukSidebar({
  activeTab,
  onTabChange,
  folders = [],
  selectedFolderId,
  onFolderSelect,
  onCreateFolder
}: KooukSidebarProps) {
  const { user } = useAuth()

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

  return (
    <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-orange-200/50 flex flex-col shadow-xl">
      
      {/* 🌅 상단 브랜드 헤더 */}
      <div className="px-6 py-5 border-b border-orange-100 bg-gradient-to-r from-orange-100 to-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              KOOUK
            </h1>
          </div>
          <div className="text-xs text-orange-600/70 font-medium">
            Personal Hub
          </div>
        </div>
      </div>

      {/* 🎚️ 탭 선택 - 책갈피 스타일 */}
      <div className="px-4 py-4 border-b border-orange-100">
        <div className="flex gap-1">
          <button 
            onClick={() => onTabChange('storage')}
            className={`flex-1 relative group ${
              activeTab === 'storage' ? 'z-10' : ''
            }`}
          >
            <div className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'storage'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
            }`}>
              <span className="text-base">{getTabIcon('storage')}</span>
              <span>My Storage</span>
            </div>
            {activeTab === 'storage' && (
              <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg"></div>
            )}
          </button>
          
          <button 
            onClick={() => onTabChange('bookmarks')}
            className={`flex-1 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'bookmarks'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
            }`}
          >
            <span className="text-base">{getTabIcon('bookmarks')}</span>
            <span>Saved</span>
          </button>
          
          <button 
            onClick={() => onTabChange('marketplace')}
            className={`flex-1 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'marketplace'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
            }`}
          >
            <span className="text-base">{getTabIcon('marketplace')}</span>
            <span>Discover</span>
          </button>
        </div>
      </div>

      {/* 🗂️ 동적 콘텐츠 영역 */}
      <div className="flex-1 overflow-hidden">
        
        {/* My Storage 서랍 */}
        {activeTab === 'storage' && (
          <div className="flex flex-col h-full p-4 space-y-3">
            
            {/* 새 폴더 만들기 - "새 서랍" */}
            <button 
              onClick={onCreateFolder}
              className="group w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-2 border-dashed border-orange-300 hover:border-orange-400 rounded-xl transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform text-white font-bold text-lg">
                +
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-orange-800">New Folder</div>
                <div className="text-xs text-orange-600">Create your collection</div>
              </div>
            </button>

            {/* 폴더 리스트 - "서랍장" 스타일 */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {folders.map((folder, index) => (
                <motion.button
                  key={folder.id}
                  onClick={() => onFolderSelect?.(folder.id)}
                  className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    selectedFolderId === folder.id
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-[1.02]'
                      : 'bg-white/70 hover:bg-white hover:shadow-md text-gray-700 hover:text-gray-900'
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* 폴더 아이콘 */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                    selectedFolderId === folder.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-800'
                  }`}>
                    {folder.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* 폴더 정보 */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-semibold text-sm truncate">
                      {folder.name}
                    </div>
                    <div className={`text-xs opacity-75 ${
                      selectedFolderId === folder.id ? 'text-white' : 'text-gray-500'
                    }`}>
                      {folder.children.length} items
                    </div>
                  </div>

                  {/* 상태 표시 */}
                  {selectedFolderId === folder.id && (
                    <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                  )}
                </motion.button>
              ))}
              
              {folders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2 font-bold text-gray-400">Empty</div>
                  <div className="text-sm">No folders yet</div>
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
              <input 
                type="text"
                placeholder="Search bookmarks..."
                className="w-full px-4 py-2 text-sm border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80"
              />
            </div>
            
            {/* 즐겨찾기 */}
            <button className="w-full flex items-center gap-3 p-3 text-sm text-gray-700 hover:bg-white/70 hover:shadow-sm rounded-xl transition-all duration-200">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center font-bold text-yellow-800">
                F
              </div>
              <span className="flex-1 text-left font-medium">Favorites</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">12</span>
            </button>

            {/* 카테고리 */}
            <div className="flex-1 overflow-y-auto space-y-1">
              <div className="px-2 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categories</h3>
              </div>
              
              {[
                { emoji: '💼', label: 'Work', count: 24 },
                { emoji: '🎨', label: 'Design', count: 18 },
                { emoji: '💻', label: 'Development', count: 32 },
                { emoji: '📚', label: 'Learning', count: 15 },
                { emoji: '🎵', label: 'Entertainment', count: 8 }
              ].map(category => (
                <button 
                  key={category.label}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-white/70 hover:shadow-sm rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{category.emoji}</span>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>

            {/* 빠른 추가 */}
            <button className="w-full flex items-center gap-3 p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/70 hover:shadow-sm rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 transition-all duration-200">
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium">Add Bookmark</span>
            </button>
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
                className="w-full pl-10 pr-4 py-2 text-sm border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80"
              />
            </div>

            {/* 탭 선택 */}
            <div className="flex rounded-xl bg-gray-100 p-1">
              <button className="flex-1 text-xs py-2 rounded-lg bg-white text-gray-900 shadow-sm font-medium">
                Browse
              </button>
              <button className="flex-1 text-xs py-2 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
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
                { emoji: '🎵', label: 'Entertainment', count: 78 }
              ].map(category => (
                <button 
                  key={category.label}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{category.emoji}</span>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>

            {/* 정렬 옵션 */}
            <div className="border-t border-gray-100 pt-3">
              <select className="w-full px-3 py-2 text-sm border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80">
                <option>Most Popular</option>
                <option>Most Recent</option>
                <option>Most Helpful</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 🧑‍💼 하단 사용자 프로필 */}
      <div className="flex-shrink-0 p-4 border-t border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-semibold text-sm">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-orange-900 truncate">
                {user.user_metadata?.name || user.email?.split('@')[0]}
              </div>
              <div className="text-xs text-orange-600">
                Personal Library
              </div>
            </div>
            <button className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
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