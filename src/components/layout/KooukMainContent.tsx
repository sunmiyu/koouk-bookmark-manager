'use client'

import { motion } from 'framer-motion'
import { FolderItem, StorageItem } from '@/types/folder'
import ContentInput from '@/components/ui/ContentInput'
import MarketPlace from '@/components/pages/Marketplace/MarketPlace'
import Bookmarks from '@/components/pages/Bookmarks/Bookmarks'

interface KooukMainContentProps {
  activeTab: 'storage' | 'bookmarks' | 'marketplace'
  selectedFolder?: FolderItem
  folders?: FolderItem[]
  onAddItem?: (item: StorageItem, folderId: string) => void
  onShareFolder?: (folder: FolderItem) => void
  onImportFolder?: (sharedFolder: any) => void
}

export default function KooukMainContent({
  activeTab,
  selectedFolder,
  folders = [],
  onAddItem,
  onShareFolder,
  onImportFolder
}: KooukMainContentProps) {

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'url': return ''
      case 'image': return ''
      case 'video': return ''
      case 'document': return ''
      case 'memo': return ''
      default: return ''
    }
  }

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'url': return 'bg-blue-100 text-blue-700'
      case 'image': return 'bg-green-100 text-green-700'
      case 'video': return 'bg-red-100 text-red-700'
      case 'document': return 'bg-purple-100 text-purple-700'
      case 'memo': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const renderStorageContent = () => (
    <div className="flex-1 flex flex-col">
      
      {/* 📖 상단 현재 열린 "책" 헤더 */}
      <div className="flex-shrink-0 px-8 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 현재 폴더 아이콘 */}
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm shadow-sm">
              {selectedFolder?.icon || ''}
            </div>
            
            <div>
              <h1 className="text-base font-bold text-gray-900">
                {selectedFolder?.name || 'Choose Your Collection'}
              </h1>
              <p className="text-gray-600 font-medium mt-1">
                {selectedFolder 
                  ? `${selectedFolder.children.length} treasures inside` 
                  : 'Select a folder from your library'
                }
              </p>
            </div>
          </div>
          
          {/* 액션 버튼들 */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-50 rounded-lg p-1">
              <button className="p-2 rounded-lg bg-white text-gray-600 shadow-sm border border-orange-200">
                <span className="text-sm">⊞</span>
              </button>
              <button className="p-2 rounded-lg text-gray-600 hover:bg-white transition-colors">
                <span className="text-sm">☰</span>
              </button>
            </div>
            
            {selectedFolder && (
              <button 
                onClick={() => onShareFolder?.(selectedFolder)}
                className="p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span className="text-sm">↗</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📑 메인 콘텐츠 "책장 내용" */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {selectedFolder?.children && selectedFolder.children.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedFolder.children.map(item => (
              <motion.div
                key={item.id}
                className="group bg-white/80 backdrop-blur-sm rounded-lg p-5 shadow-sm hover:shadow-xl border border-orange-100 hover:border-orange-200 transition-all duration-200 cursor-pointer"
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* 아이템 아이콘/썸네일 */}
                <div className="w-full h-32 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center text-lg mb-4 group-hover:from-orange-100 group-hover:to-amber-100 transition-colors">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-base">&nbsp;</span>
                  )}
                </div>
                
                {/* 아이템 정보 */}
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {item.description || item.content}
                  </p>
                  
                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${getItemTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    <span className="text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString('ko')}
                    </span>
                  </div>
                  
                  {/* URL 링크 */}
                  {item.url && (
                    <div className="mt-2">
                      <button 
                        onClick={() => window.open(item.url, '_blank')}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <span className="text-xs">↗</span>
                        Open link
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* 빈 상태 - "빈 책장" */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl mb-6">
              <span>&nbsp;</span>
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Your Collection Awaits
            </h2>
            <p className="text-gray-600 text-lg max-w-md">
              {selectedFolder 
                ? 'This folder is empty. Start adding your internet treasures!'
                : 'Choose a folder from your library to see your saved content'
              }
            </p>
          </div>
        )}
      </div>

      {/* ✏️ 하단 "메모 작성대" 입력바 */}
      {selectedFolder && (
        <div className="flex-shrink-0 px-8 py-4 bg-white/60 backdrop-blur-sm border-t border-orange-200/50">
          <div className="bg-white/80 rounded-lg shadow-lg border border-orange-200/50 p-4">
            <ContentInput 
              selectedFolderId={selectedFolder.id}
              folders={folders}
              onAddItem={onAddItem}
              className="border-0 bg-transparent focus:ring-0"
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderBookmarksContent = () => (
    <div className="flex-1 flex flex-col">
      
      {/* 헤더 */}
      <div className="flex-shrink-0 px-8 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm shadow-sm">
              <span>&nbsp;</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">
                Saved Bookmarks
              </h1>
              <p className="text-green-600 font-medium mt-1">
                Your curated web collection
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-50 rounded-lg p-1">
              <button className="p-2 rounded-lg bg-white text-green-600 shadow-sm border border-green-200">
                <span className="text-sm">⊞</span>
              </button>
              <button className="p-2 rounded-lg text-green-600 hover:bg-white transition-colors">
                <span className="text-sm">☰</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 북마크 리스트 */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <motion.div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm hover:shadow-md border border-green-100 hover:border-green-200 transition-all duration-200"
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span>&nbsp;</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Sample Bookmark {index + 1}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    This is a sample bookmark description that shows how your saved links will appear.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>example.com</span>
                    <span>•</span>
                    <span>2 days ago</span>
                  </div>
                </div>
                <button className="text-green-600 hover:text-green-800 transition-colors">
                  <span className="text-sm">↗</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMarketplaceContent = () => (
    <div className="flex-1 flex flex-col">
      
      {/* 헤더 */}
      <div className="flex-shrink-0 px-8 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm shadow-sm">
              <span>&nbsp;</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">
                Market Place
              </h1>
              <p className="text-purple-600 font-medium mt-1">
                Discover amazing collections
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-50 rounded-lg p-1">
              <button className="p-2 rounded-lg bg-white text-purple-600 shadow-sm border border-purple-200">
                <span className="text-sm">⊞</span>
              </button>
              <button className="p-2 rounded-lg text-purple-600 hover:bg-white transition-colors">
                <span className="text-sm">☰</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 공유 폴더 그리드 */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <motion.div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-xl border border-purple-100 hover:border-purple-200 transition-all duration-200 cursor-pointer overflow-hidden"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* 커버 이미지 */}
              <div className="w-full h-32 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center text-sm">
                <span>&nbsp;</span>
              </div>
              
              {/* 컨텐츠 */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    U
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Creator Name</span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                  Design Resources Collection {index + 1}
                </h3>
                
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                  A curated collection of design resources, tools, and inspiration for creative professionals.
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-red-500">
                      ♥ 24
                    </span>
                    <span className="flex items-center gap-1 text-blue-500">
                      ⬇ 12
                    </span>
                  </div>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                    Design
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col">
      {activeTab === 'storage' && renderStorageContent()}
      {activeTab === 'bookmarks' && (
        <Bookmarks searchQuery="" />
      )}
      {activeTab === 'marketplace' && (
        <MarketPlace 
          searchQuery="" 
          onImportFolder={onImportFolder}
        />
      )}
    </div>
  )
}