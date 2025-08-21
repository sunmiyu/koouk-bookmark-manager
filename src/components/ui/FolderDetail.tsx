'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Grid, List, Share2 } from 'lucide-react'
import { FolderItem, StorageItem } from '@/types/folder'

// 메타데이터 타입 정의
interface ItemMetadata {
  title?: string
  description?: string
  domain?: string
  thumbnail?: string
  duration?: number
  platform?: string
  [key: string]: unknown
}
import DocumentModal from './DocumentModal'
import ShareFolderModal, { SharedFolderData } from './ShareFolderModal'
import EnhancedContentCard, { ContentGrid } from './EnhancedContentCard'

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
      <div className="bg-white border-b border-gray-200 p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-gray-900">{folder.name}</h1>
            <p className="text-xs text-gray-500">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-auto px-4 py-2">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-lg md:text-xl">📂</span>
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
          <ContentGrid>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EnhancedContentCard
                  type={item.type}
                  title={item.name}
                  description={item.description || (item.type === 'memo' || item.type === 'document' ? item.content?.substring(0, 100) + '...' : item.content)}
                  thumbnail={item.thumbnail || (item.metadata as ItemMetadata)?.thumbnail as string}
                  url={item.url || (item.type === 'url' ? item.content : undefined)}
                  metadata={{
                    domain: item.type === 'url' ? (() => {
                      try {
                        return new URL(item.content).hostname;
                      } catch {
                        return undefined;
                      }
                    })() : undefined,
                    fileSize: item.type,
                    tags: item.tags,
                    // Add full metadata for better title and thumbnail extraction
                    title: (item.metadata as ItemMetadata)?.title, // 🎯 YouTube 제목 확보
                    ...(item.metadata as ItemMetadata || {})
                  }}
                  onClick={() => handleItemClick(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                  size="medium"
                  layout={viewMode}
                />
              </motion.div>
            ))}
          </ContentGrid>
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