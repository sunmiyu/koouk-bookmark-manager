'use client'

import { motion } from 'framer-motion'
import { FolderItem } from '@/types/folder'

interface FolderGridProps {
  folders: FolderItem[]
  onFolderSelect: (folder: FolderItem) => void
  onCreateFolder: () => void
  searchQuery?: string
}

export default function FolderGrid({
  folders,
  onFolderSelect,
  onCreateFolder,
  searchQuery = ''
}: FolderGridProps) {
  // 검색 필터링
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    folder.children.some(child => 
      child.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  if (filteredFolders.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">📂</div>
        <p className="text-gray-500">No folders found for &quot;{searchQuery}&quot;</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* 헤더 - 통일된 스타일 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredFolders.length} {filteredFolders.length === 1 ? 'folder' : 'folders'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            My Folders
          </p>
        </div>
        
        <button
          onClick={onCreateFolder}
          className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
          title="Create New Folder"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* 폴더 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
        {filteredFolders.map((folder, index) => {
          const itemCount = folder.children.length
          const recentItems = folder.children.slice(0, 3)
          
          return (
            <motion.button
              key={folder.id}
              onClick={() => onFolderSelect(folder)}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-3 sm:p-4 text-left group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* 새로운 레이아웃: flex-col로 구성 */}
              <div className="h-full flex flex-col">
                {/* 상단: 폴더 아이콘과 제목 (나란히 배치) */}
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: folder.color + '20',
                      border: `2px solid ${folder.color}30`
                    }}
                  >
                    <span className="text-lg">{folder.icon || '📁'}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
                      {folder.name || 'Untitled Folder'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* 중앙: 내부 내용 리스트 */}
                <div className="flex-1">
                  {recentItems.length > 0 ? (
                    <div className="space-y-1.5">
                      {recentItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div 
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: folder.color || '#6B7280' }}
                          />
                          <span className="text-xs text-gray-600 truncate">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">
                      Empty folder
                    </div>
                  )}
                </div>

                {/* 하단: 업데이트 시간 (항상 최하단) */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {new Date(folder.updatedAt || folder.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* 빈 상태 */}
      {filteredFolders.length === 0 && !searchQuery && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📁</span>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welcome to KOOUK
          </h3>
          
          <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-md mx-auto">
            Start organizing with your first folder. 
            It&apos;s as simple as giving it a name.
          </p>
          
          <button
            onClick={onCreateFolder}
            className="bg-black text-white py-2 px-6 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Create Your First Folder
          </button>
          
          <p className="text-xs text-gray-500 mt-3">
            No learning curve. Just start organizing.
          </p>
        </div>
      )}
    </div>
  )
}