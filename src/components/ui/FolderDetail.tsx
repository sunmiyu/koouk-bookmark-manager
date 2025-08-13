'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MoreVertical, ExternalLink, Trash2, Grid, List, Share2 } from 'lucide-react'
import { FolderItem, StorageItem } from '@/types/folder'
import DocumentModal from './DocumentModal'

interface FolderDetailProps {
  folder: FolderItem
  onBack: () => void
  onItemDelete?: (itemId: string) => void
  onShareFolder?: (folderId: string) => void
  searchQuery?: string
}

export default function FolderDetail({
  folder,
  onBack,
  onItemDelete,
  onShareFolder,
  searchQuery = ''
}: FolderDetailProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [documentModalOpen, setDocumentModalOpen] = useState(false)
  const [documentModalItem, setDocumentModalItem] = useState<StorageItem | null>(null)

  // 검색 필터링 - StorageItem만 필터링
  const filteredItems = folder.children.filter((item): item is StorageItem => {
    // 폴더가 아닌 StorageItem만 필터링
    if ('type' in item && item.type) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ('content' in item && item.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return false
  })

  // 아이템 타입별 아이콘
  const getItemIcon = (item: StorageItem) => {
    switch (item.type) {
      case 'url':
        return '🔗'
      case 'video':
        return '🎥'
      case 'image':
        return '🖼️'
      case 'document':
        return '📄'
      case 'memo':
        return '📝'
      default:
        return '📎'
    }
  }

  // 아이템 클릭 핸들러
  const handleItemClick = (item: StorageItem) => {
    if (item.type === 'url' && 'content' in item) {
      window.open(item.content, '_blank')
    } else if (item.type === 'video' && 'content' in item) {
      window.open(item.content, '_blank')
    } else if (item.type === 'image' && 'content' in item) {
      // 이미지 미리보기 모달 열기 (추후 구현)
      window.open(item.content, '_blank')
    } else if (item.type === 'document' || item.type === 'memo') {
      // 문서/메모 모달 열기
      setDocumentModalItem(item)
      setDocumentModalOpen(true)
    }
  }

  // 아이템 삭제
  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      onItemDelete?.(itemId)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: folder.color + '20',
                  border: `2px solid ${folder.color}30`
                }}
              >
                <span className="text-lg">{folder.icon || '📁'}</span>
              </div>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{folder.name}</h1>
                <p className="text-sm text-gray-500">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 뷰 모드 토글 */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* 폴더 공유 버튼 */}
            {onShareFolder && (
              <button
                onClick={() => onShareFolder(folder.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share Folder"
              >
                <Share2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📂</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No items found' : 'Folder is empty'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery 
                ? `No items match "${searchQuery}"`
                : 'Start adding content to this folder using the input bar below'
              }
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
          }>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={
                  viewMode === 'grid'
                    ? 'bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 p-4 group cursor-pointer'
                    : 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 p-3 flex items-center gap-3 group cursor-pointer'
                }
                onClick={() => handleItemClick(item)}
              >
                {viewMode === 'grid' ? (
                  // 그리드 뷰
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{getItemIcon(item)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedItem(selectedItem === item.id ? null : item.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    
                    {'content' in item && item.content && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {item.content}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="capitalize">{item.type}</span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </>
                ) : (
                  // 리스트 뷰
                  <>
                    <span className="text-xl">{getItemIcon(item)}</span>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {item.name}
                      </h3>
                      {'content' in item && item.content && (
                        <p className="text-xs text-gray-500 truncate">
                          {item.content}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="capitalize">{item.type}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItem(selectedItem === item.id ? null : item.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </>
                )}

                {/* 아이템 메뉴 */}
                {selectedItem === item.id && (
                  <div className="absolute right-2 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    {(item.type === 'url' || item.type === 'video') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if ('content' in item) window.open(item.content, '_blank')
                          setSelectedItem(null)
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                      >
                        <ExternalLink size={14} />
                        Open
                      </button>
                    )}
                    
                    {onItemDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteItem(item.id)
                          setSelectedItem(null)
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 문서 모달 */}
      <DocumentModal
        isOpen={documentModalOpen}
        onClose={() => {
          setDocumentModalOpen(false)
          setDocumentModalItem(null)
        }}
        item={documentModalItem}
      />
    </div>
  )
}