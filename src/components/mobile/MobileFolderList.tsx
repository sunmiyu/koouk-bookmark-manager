'use client'

import { motion } from 'framer-motion'
import { FolderOpen, ChevronRight, Clock, FileText, Image, Video, Link, StickyNote } from 'lucide-react'
import { FolderItem, StorageItem } from '@/types/folder'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useEffect, useRef } from 'react'

interface MobileFolderListProps {
  folders: FolderItem[]
  onFolderSelect?: (folderId: string, folderName: string) => void
  onItemSelect?: (item: StorageItem) => void
}

export default function MobileFolderList({ folders, onFolderSelect, onItemSelect }: MobileFolderListProps) {
  const { state, updateQuickAccess, updateNavigation, saveScrollPosition } = useCrossPlatformState()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 선택된 폴더 찾기
  const selectedFolder = findFolderById(folders, state.navigation.selectedFolderId)

  // 스크롤 위치 복원
  useEffect(() => {
    if (scrollRef.current && state.navigation.selectedFolderId) {
      const scrollKey = `folder-${state.navigation.selectedFolderId}`
      const savedPosition = state.navigation.scrollPositions[scrollKey] || 0
      scrollRef.current.scrollTop = savedPosition
    }
  }, [state.navigation.selectedFolderId, state.navigation.scrollPositions])

  // 스크롤 위치 저장
  const handleScroll = () => {
    if (scrollRef.current && state.navigation.selectedFolderId) {
      const scrollKey = `folder-${state.navigation.selectedFolderId}`
      saveScrollPosition(scrollKey, scrollRef.current.scrollTop)
    }
  }

  // 폴더 선택 핸들러
  const handleFolderSelect = (folder: FolderItem) => {
    // 햅틱 피드백
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

    // 현재 스크롤 위치 저장
    handleScroll()

    // Quick Access 빈도 업데이트
    updateQuickAccess(folder.id, folder.name)

    // 브레드크럼 생성 (현재 경로 + 새 폴더)
    const newBreadcrumbs = [
      ...state.navigation.breadcrumbs,
      { id: folder.id, name: folder.name, type: 'folder' as const }
    ]

    // 네비게이션 상태 업데이트
    updateNavigation({
      selectedFolderId: folder.id,
      breadcrumbs: newBreadcrumbs,
      folderEntryMethod: 'direct'
    })

    onFolderSelect?.(folder.id, folder.name)
  }

  // 아이템 선택 핸들러
  const handleItemSelect = (item: StorageItem) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5)
    }
    onItemSelect?.(item)
  }

  // 폴더가 선택되지 않았을 때 루트 폴더 목록 표시
  if (!selectedFolder) {
    return (
      <div 
        ref={scrollRef}
        data-folder-content
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="p-4 space-y-3">
          {folders.map((folder) => (
            <FolderCard 
              key={folder.id}
              folder={folder}
              onSelect={() => handleFolderSelect(folder)}
            />
          ))}
        </div>
      </div>
    )
  }

  // 선택된 폴더의 내용 표시
  const subFolders = selectedFolder.children.filter(child => child.type === 'folder') as FolderItem[]
  const items = selectedFolder.children.filter(child => child.type !== 'folder') as StorageItem[]

  return (
    <div 
      ref={scrollRef}
      data-folder-content
      className="flex-1 overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="p-4 space-y-4">
        {/* 하위 폴더들 */}
        {subFolders.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 px-1">폴더</h3>
            {subFolders.map((folder) => (
              <FolderCard 
                key={folder.id}
                folder={folder}
                onSelect={() => handleFolderSelect(folder)}
              />
            ))}
          </div>
        )}

        {/* 아이템들 */}
        {items.length > 0 && (
          <div className="space-y-3">
            {subFolders.length > 0 && <div className="border-t border-gray-100 pt-4" />}
            <h3 className="text-sm font-medium text-gray-700 px-1">콘텐츠</h3>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <ItemCard 
                  key={item.id}
                  item={item}
                  onSelect={() => handleItemSelect(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 빈 폴더 안내 */}
        {subFolders.length === 0 && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <FolderOpen size={48} color="#D1D5DB" className="mb-4" />
            <p className="text-gray-500 text-sm mb-2">이 폴더는 비어있습니다</p>
            <p className="text-gray-400 text-xs">하단 입력창에서 콘텐츠를 추가해보세요</p>
          </div>
        )}
      </div>
    </div>
  )
}

// 폴더 카드 컴포넌트
function FolderCard({ folder, onSelect }: { folder: FolderItem; onSelect: () => void }) {
  const itemCount = folder.children.length
  const folderCount = folder.children.filter(child => child.type === 'folder').length
  const contentCount = folder.children.filter(child => child.type !== 'folder').length

  return (
    <motion.button
      onClick={onSelect}
      className="w-full p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left"
      whileTap={{ scale: 0.98 }}
      style={{ minHeight: '44px' }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: folder.color + '20' }}
        >
          <FolderOpen size={20} style={{ color: folder.color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900 truncate">{folder.name}</h3>
            <ChevronRight size={16} color="#9CA3AF" className="flex-shrink-0" />
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {folderCount > 0 && (
              <span>{folderCount}개 폴더</span>
            )}
            {contentCount > 0 && (
              <span>{contentCount}개 항목</span>
            )}
            {itemCount === 0 && (
              <span>비어있음</span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// 아이템 카드 컴포넌트
function ItemCard({ item, onSelect }: { item: StorageItem; onSelect: () => void }) {
  const getIcon = (type: StorageItem['type']) => {
    switch (type) {
      case 'document': return FileText
      case 'image': return Image
      case 'video': return Video
      case 'url': return Link
      case 'memo': return StickyNote
      default: return FileText
    }
  }

  const getTypeColor = (type: StorageItem['type']) => {
    switch (type) {
      case 'document': return '#3B82F6'
      case 'image': return '#10B981'
      case 'video': return '#F59E0B'
      case 'url': return '#8B5CF6'
      case 'memo': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const Icon = getIcon(item.type)
  const typeColor = getTypeColor(item.type)

  return (
    <motion.button
      onClick={onSelect}
      className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left"
      whileTap={{ scale: 0.98 }}
      style={{ minHeight: '44px' }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: typeColor + '20' }}
          >
            <Icon size={16} style={{ color: typeColor }} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <Clock size={10} color="#9CA3AF" />
              <span className="text-xs text-gray-500">
                {new Date(item.updatedAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// 유틸리티 함수: 폴더 ID로 폴더 찾기
function findFolderById(folders: FolderItem[], folderId: string | undefined): FolderItem | null {
  if (!folderId) return null

  for (const folder of folders) {
    if (folder.id === folderId) return folder
    
    const subFolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
    const found = findFolderById(subFolders, folderId)
    if (found) return found
  }

  return null
}