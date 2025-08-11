'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, FileText, Image, Video, Link, StickyNote, Folder } from 'lucide-react'
import { FolderItem, StorageItem } from '@/types/folder'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useState, useRef } from 'react'

interface MobileFolderListProps {
  folders: FolderItem[]
  onFolderSelect?: (folderId: string) => void
  onItemSelect?: (item: StorageItem) => void
}

export default function MobileFolderList({ folders, onFolderSelect, onItemSelect }: MobileFolderListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const { updateQuickAccess } = useCrossPlatformState()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 폴더 확장/축소 토글
  const toggleFolder = (folderId: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
    
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  // 폴더 선택 핸들러 (Quick Access 업데이트용)
  const handleFolderSelect = (folderId: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5)
    }
    
    // Quick Access 빈도 업데이트 - 폴더를 찾아서 이름 가져오기
    const findFolder = (folders: FolderItem[], id: string): FolderItem | null => {
      for (const folder of folders) {
        if (folder.id === id) return folder
        const subFolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
        const found = findFolder(subFolders, id)
        if (found) return found
      }
      return null
    }
    
    const folder = findFolder(folders, folderId)
    if (folder) {
      updateQuickAccess(folder.id, folder.name)
    }
    
    onFolderSelect?.(folderId)
  }

  // 아이템 선택 핸들러
  const handleItemSelect = (item: StorageItem) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5)
    }
    onItemSelect?.(item)
  }

  return (
    <div 
      ref={scrollRef}
      data-folder-content
      className="flex-1 overflow-y-auto bg-gray-50"
    >
      <div className="p-4 space-y-2">
        {folders.map((folder) => (
          <FolderTreeNode
            key={folder.id}
            folder={folder}
            level={0}
            expandedFolders={expandedFolders}
            onToggle={toggleFolder}
            onFolderSelect={handleFolderSelect}
            onItemSelect={handleItemSelect}
          />
        ))}
        
        {folders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
              <Folder size={32} color="#9CA3AF" />
            </div>
            <h3 className="text-base font-medium text-gray-600 mb-2">폴더가 없습니다</h3>
            <p className="text-sm text-gray-500">하단 입력창에서 새 폴더를 만들어보세요</p>
          </div>
        )}
      </div>
    </div>
  )
}

// 폴더 트리 노드 컴포넌트 - 확장/축소 가능한 트리 구조
function FolderTreeNode({
  folder,
  level,
  expandedFolders,
  onToggle,
  onFolderSelect,
  onItemSelect
}: {
  folder: FolderItem
  level: number
  expandedFolders: Set<string>
  onToggle: (folderId: string) => void
  onFolderSelect: (folderId: string) => void
  onItemSelect: (item: StorageItem) => void
}) {
  const isExpanded = expandedFolders.has(folder.id)
  const hasChildren = folder.children.length > 0
  const subFolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
  const items = folder.children.filter(child => child.type !== 'folder') as StorageItem[]

  return (
    <div className="relative">
      {/* 폴더 헤더 */}
      <motion.div
        className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        whileTap={{ scale: 0.98 }}
      >
        {/* 들여쓰기 */}
        {level > 0 && (
          <div 
            className="flex-shrink-0 bg-gray-50 border-r border-gray-200"
            style={{ width: `${level * 24}px` }}
          />
        )}
        
        {/* 확장/축소 버튼 */}
        <button
          onClick={() => onToggle(folder.id)}
          className="flex-shrink-0 w-12 h-16 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={20} color="#6B7280" />
            ) : (
              <ChevronRight size={20} color="#6B7280" />
            )
          ) : (
            <div className="w-5 h-5" />
          )}
        </button>

        {/* 폴더 정보 - 클릭 가능한 영역 */}
        <button
          onClick={() => onFolderSelect?.(folder.id)}
          className="flex-1 flex items-center gap-3 p-4 pl-2 hover:bg-gray-50 transition-colors text-left min-h-16"
        >
          {/* 폴더 아이콘 */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: folder.color }}
          >
            <Folder size={20} color="white" />
          </div>
          
          {/* 폴더 이름과 정보 */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-base truncate">
              {folder.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {folder.children.length === 0 ? '비어있음' : `항목 ${folder.children.length}개`}
            </p>
          </div>
        </button>
      </motion.div>

      {/* 확장된 하위 항목들 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2"
          >
            <div className="space-y-2 ml-6">
              {/* 하위 폴더들 */}
              {subFolders.map((subFolder) => (
                <FolderTreeNode
                  key={subFolder.id}
                  folder={subFolder}
                  level={level + 1}
                  expandedFolders={expandedFolders}
                  onToggle={onToggle}
                  onFolderSelect={onFolderSelect}
                  onItemSelect={onItemSelect}
                />
              ))}
              
              {/* 항목들 */}
              {items.map((item) => (
                <ItemNode
                  key={item.id}
                  item={item}
                  level={level + 1}
                  onSelect={onItemSelect}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 아이템 노드 컴포넌트 - 심플한 아이템 표시
function ItemNode({
  item,
  level,
  onSelect
}: {
  item: StorageItem
  level: number
  onSelect: (item: StorageItem) => void
}) {
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
      onClick={() => onSelect(item)}
      className="w-full flex items-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:bg-gray-50 transition-colors"
      whileTap={{ scale: 0.98 }}
    >
      {/* 들여쓰기 */}
      {level > 0 && (
        <div 
          className="flex-shrink-0 bg-gray-50 border-r border-gray-200"
          style={{ width: `${level * 24}px` }}
        />
      )}
      
      {/* 빈 공간 (확장 버튼 자리) */}
      <div className="w-12 flex items-center justify-center">
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* 아이템 정보 */}
      <div className="flex-1 flex items-center gap-3 p-3 pl-2 text-left min-h-14">
        {/* 아이템 아이콘 */}
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: typeColor + '20' }}
        >
          <Icon size={16} style={{ color: typeColor }} />
        </div>
        
        {/* 아이템 이름 */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">
            {item.name}
          </p>
        </div>
        
        {/* 타입 라벨 */}
        <div 
          className="px-2 py-1 rounded-md text-xs font-medium flex-shrink-0"
          style={{ 
            backgroundColor: typeColor + '20', 
            color: typeColor 
          }}
        >
          {item.type}
        </div>
      </div>
    </motion.button>
  )
}

