'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowLeft, MoreVertical, ExternalLink, Trash2, Grid, List, Share2 } from 'lucide-react'
import { FolderItem, StorageItem } from '@/types/folder'
import { isYouTubeUrl, getYouTubeThumbnail } from '@/utils/youtube'
import DocumentModal from './DocumentModal'
import ShareFolderModal, { SharedFolderData } from './ShareFolderModal'

interface FolderDetailProps {
  folder: FolderItem
  onBack: () => void
  onItemDelete?: (itemId: string) => void
  onShareFolder?: (folderData: SharedFolderData, folder: FolderItem) => void
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
  const [shareModalOpen, setShareModalOpen] = useState(false)

  // 검색 필터링 - StorageItem만 필터링
  const filteredItems = folder.children.filter((item): item is StorageItem => {
    // 폴더가 아닌 StorageItem만 필터링
    if ('type' in item && item.type) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ('content' in item && item.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return false
  })

  // 썸네일 생성 함수
  const getThumbnail = (item: StorageItem): string | null => {
    if (item.type === 'video') {
      if (item.metadata?.thumbnail) return String(item.metadata.thumbnail)
      if (isYouTubeUrl(item.content)) {
        return getYouTubeThumbnail(item.content)
      }
      return null
    }
    if (item.type === 'image') {
      return item.content
    }
    if (item.type === 'url') {
      if (item.metadata?.thumbnail) return String(item.metadata.thumbnail)
      if (isYouTubeUrl(item.content)) {
        return getYouTubeThumbnail(item.content)
      }
      try {
        const domain = new URL(item.content).hostname
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      } catch {
        return null
      }
    }
    return null
  }

  // 텍스트 미리보기 함수
  const getTextPreview = (item: StorageItem): string | null => {
    if (item.type === 'document' || item.type === 'memo') {
      return item.content.substring(0, 120) + (item.content.length > 120 ? '...' : '')
    }
    return null
  }


  // 아이템 타입별 아이콘 (썸네일이 없을 때 사용)
  const getItemIcon = (item: StorageItem): string => {
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

  // Share 폴더 핸들러
  const handleShareFolder = (sharedFolderData: SharedFolderData) => {
    if (onShareFolder) {
      onShareFolder(sharedFolderData, folder)
    }
    setShareModalOpen(false)
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
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">{folder.name}</h1>
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
                onClick={() => setShareModalOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share to Market Place"
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
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
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
                    ? 'group cursor-pointer'
                    : 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 p-3 flex items-center gap-3 group cursor-pointer'
                }
                onClick={() => handleItemClick(item)}
              >
                {viewMode === 'grid' ? (
                  // 그리드 뷰 - 모바일 이미지 스타일
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                    {/* 썸네일/미리보기 영역 */}
                    <div className="relative bg-gray-50 aspect-[4/3] overflow-hidden">
                      {getThumbnail(item) ? (
                        <Image 
                          src={getThumbnail(item)!} 
                          alt={item.metadata?.title ? String(item.metadata.title) : item.name}
                          fill
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const fallback = target.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      
                      {/* 텍스트 미리보기 */}
                      {!getThumbnail(item) && getTextPreview(item) && (
                        <div className="absolute inset-0 p-4 flex flex-col justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                          <div className="text-sm text-gray-700 leading-relaxed line-clamp-4 font-medium">
                            {getTextPreview(item)}
                          </div>
                        </div>
                      )}
                      
                      {/* 아이콘 폴백 */}
                      <div 
                        className="w-full h-full absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100" 
                        style={{ display: (getThumbnail(item) || getTextPreview(item)) ? 'none' : 'flex' }}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-gray-400 group-hover:scale-110 transition-all duration-300">
                          <span className="text-2xl">{getItemIcon(item)}</span>
                        </div>
                      </div>

                      {/* 더보기 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedItem(selectedItem === item.id ? null : item.id)
                        }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-black/20 rounded-full bg-black/20 backdrop-blur-sm"
                      >
                        <MoreVertical size={16} className="text-white" />
                      </button>

                      {/* 비디오 지속시간 */}
                      {item.type === 'video' && item.metadata?.duration && (
                        <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2.5 py-1 rounded-md text-xs font-medium">
                          {Math.floor(Number(item.metadata.duration) / 60)}:{(Number(item.metadata.duration) % 60).toString().padStart(2, '0')}
                        </div>
                      )}

                      {/* 타입 뱃지 */}
                      <div className="absolute top-3 left-3">
                        {item.type === 'video' && (
                          <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                            Video
                          </div>
                        )}
                        {item.type === 'url' && (
                          <div className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                            Link
                          </div>
                        )}
                        {item.type === 'image' && (
                          <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                            Image
                          </div>
                        )}
                        {item.type === 'document' && (
                          <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                            Doc
                          </div>
                        )}
                        {item.type === 'memo' && (
                          <div className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                            Memo
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 콘텐츠 정보 영역 */}
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                        {item.metadata?.title ? String(item.metadata.title) : item.name}
                      </h3>
                      
                      {/* 설명 - 임시 비활성화 */}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-400">
                          <span>
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 리스트 뷰
                  <>
                    {/* 썸네일 또는 아이콘 */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
                      {getThumbnail(item) ? (
                        <Image 
                          src={getThumbnail(item)!} 
                          alt={item.metadata?.title ? String(item.metadata.title) : item.name}
                          fill
                          className={`w-full h-full ${
                            item.type === 'url' ? 'object-contain p-1' : 'object-cover'
                          }`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const fallback = target.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      
                      {/* 아이콘 폴백 */}
                      <div 
                        className="w-full h-full absolute inset-0 flex items-center justify-center" 
                        style={{ display: getThumbnail(item) ? 'none' : 'flex' }}
                      >
                        <span className="text-lg">{getItemIcon(item)}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {item.metadata?.title ? String(item.metadata.title) : item.name}
                      </h3>
                      {getTextPreview(item) ? (
                        <p className="text-xs text-gray-500 truncate">
                          {getTextPreview(item)}
                        </p>
                      ) : item.type === 'url' && (
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

      {/* 공유 모달 */}
      <ShareFolderModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        folder={folder}
        onShareFolder={handleShareFolder}
      />
    </div>
  )
}