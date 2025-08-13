'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, Folder, Share2, FileText, Image, Video, Link, StickyNote } from 'lucide-react'
import { FolderItem, StorageItem } from '@/types/folder'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'

interface MobileFolderListProps {
  folders: FolderItem[]
  onFolderSelect?: (folderId: string) => void
  onItemSelect?: (item: StorageItem) => void
  onShareFolder?: (folderId: string) => void
}

export default function MobileFolderList({ folders, onFolderSelect, onItemSelect, onShareFolder }: MobileFolderListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const { updateQuickAccess } = useCrossPlatformState()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Folder expand/collapse toggle
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

  // Folder selection handler (for Quick Access updates)
  const handleFolderSelect = (folderId: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5)
    }
    
    // Update Quick Access frequency - find folder and get name
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

  // Item selection handler
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
      className="flex-1 overflow-y-auto bg-gradient-to-br from-orange-50/30 via-amber-50/30 to-yellow-50/30"
    >
      <div className="p-4 space-y-4">
        {folders.map((folder) => (
          <FolderTreeNode
            key={folder.id}
            folder={folder}
            level={0}
            expandedFolders={expandedFolders}
            onToggle={toggleFolder}
            onFolderSelect={handleFolderSelect}
            onItemSelect={handleItemSelect}
            onShareFolder={onShareFolder}
          />
        ))}
        
        {folders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {/* 🎨 Emotional Empty State - 따뜻하고 친근한 느낌 */}
            <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm"
                 style={{
                   boxShadow: '0 8px 32px rgba(251, 191, 36, 0.15), 0 4px 16px rgba(0, 0, 0, 0.04)'
                 }}>
              <Folder size={36} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-3 leading-relaxed">No folders yet</h3>
            <p className="text-base text-amber-600/80 max-w-xs font-medium leading-relaxed">
              Create your first folder to organize your information
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Folder tree node component - Expandable/collapsible tree structure
function FolderTreeNode({
  folder,
  level,
  expandedFolders,
  onToggle,
  onFolderSelect,
  onItemSelect,
  onShareFolder
}: {
  folder: FolderItem
  level: number
  expandedFolders: Set<string>
  onToggle: (folderId: string) => void
  onFolderSelect: (folderId: string) => void
  onItemSelect: (item: StorageItem) => void
  onShareFolder?: (folderId: string) => void
}) {
  const isExpanded = expandedFolders.has(folder.id)
  const hasChildren = folder.children.length > 0
  const subFolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
  const items = folder.children.filter(child => child.type !== 'folder') as StorageItem[]

  return (
    <div className="relative">
      {/* 🎨 Emotional Folder Card - 차분하고 따뜻한 감성 */}
      <motion.div
        className="relative bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 rounded-2xl border-0 shadow-lg overflow-hidden mb-4"
        style={{
          marginLeft: level * 20,
          boxShadow: '0 8px 32px rgba(251, 191, 36, 0.15), 0 4px 16px rgba(0, 0, 0, 0.04)'
        }}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* 🎨 Saint Laurent 스타일 절제된 accent bar */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-2 rounded-r-full opacity-70"
          style={{ 
            background: `linear-gradient(135deg, ${folder.color || '#F59E0B'}, ${folder.color || '#F59E0B'}40)`,
            filter: 'blur(0.5px)'
          }}
        />
        
        <div className="flex items-center">
          {/* 🎨 Emotional Expand/collapse button - 부드럽고 자연스러운 */}
          <button
            onClick={() => onToggle(folder.id)}
            className="flex-shrink-0 w-16 h-16 flex items-center justify-center hover:bg-amber-50/50 transition-all duration-300 ease-out rounded-2xl"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown size={18} className="text-amber-600/70" />
              ) : (
                <ChevronRight size={18} className="text-amber-600/70" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {/* 🎨 Emotional Main folder content - 넉넉한 여백과 공간감 */}
          <button
            onClick={() => onFolderSelect?.(folder.id)}
            className="flex-1 flex items-center gap-4 px-4 py-4 hover:bg-white/60 transition-all duration-300 ease-out text-left rounded-2xl"
          >
            {/* 🎨 Emotional Folder icon - 부드럽고 따뜻한 배경 */}
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg backdrop-blur-sm"
              style={{ 
                backgroundColor: `${folder.color || '#F59E0B'}20`,
                border: `2px solid ${folder.color || '#F59E0B'}40`,
                boxShadow: `0 4px 12px ${folder.color || '#F59E0B'}20`
              }}
            >
              <span className="filter drop-shadow-md transition-transform duration-300 hover:scale-110">
                {folder.icon || '📁'}
              </span>
            </div>
            
            {/* 🎨 Emotional Folder info - 카카오톡 기반 텍스트 사이즈와 따뜻한 색조 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 text-base truncate mb-1 leading-relaxed">
                {folder.name}
              </h3>
              {folder.children.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600/80 font-medium">
                  <span>{folder.children.length} items</span>
                  {items.length > 0 && (
                    <>
                      <span className="text-amber-500/60">•</span>
                      <span>{items.length} files</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 🎨 Emotional Share button - 부드럽고 감성적인 디자인 */}
            {onShareFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShareFolder(folder.id)
                }}
                className="mr-3 w-10 h-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 ease-out flex-shrink-0 shadow-md hover:shadow-lg"
                style={{
                  border: '1px solid rgba(251, 191, 36, 0.2)'
                }}
                title="Share folder"
              >
                <Share2 size={16} className="text-amber-600" />
              </button>
            )}

            {/* 🎨 Emotional Arrow indicator - 부드러운 그라데이션 */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
              <ChevronRight size={14} className="text-amber-600/70" />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Expanded sub-items with emotional styling */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-3"
          >
            <div className="space-y-3 ml-6 pl-4 border-l-2 border-amber-100/60">
              {/* Sub-folders */}
              {subFolders.map((subFolder) => (
                <FolderTreeNode
                  key={subFolder.id}
                  folder={subFolder}
                  level={level + 1}
                  expandedFolders={expandedFolders}
                  onToggle={onToggle}
                  onFolderSelect={onFolderSelect}
                  onItemSelect={onItemSelect}
                  onShareFolder={onShareFolder}
                />
              ))}
              
              {/* Items */}
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

// Item node component - Simple item display
function ItemNode({
  item,
  level,
  onSelect
}: {
  item: StorageItem
  level: number
  onSelect: (item: StorageItem) => void
}) {
  const getIconAndColor = (type: StorageItem['type']) => {
    switch (type) {
      case 'document': return { Icon: FileText, color: '#3B82F6', bg: '#EFF6FF' }
      case 'image': return { Icon: Image, color: '#10B981', bg: '#ECFDF5' }
      case 'video': return { Icon: Video, color: '#F59E0B', bg: '#FEF3C7' }
      case 'url': return { Icon: Link, color: '#8B5CF6', bg: '#F3E8FF' }
      case 'memo': return { Icon: StickyNote, color: '#EF4444', bg: '#FEF2F2' }
      default: return { Icon: FileText, color: '#6B7280', bg: '#F9FAFB' }
    }
  }

  const { Icon, color, bg } = getIconAndColor(item.type)
  
  // 🎨 YouTube 제목 최적화: 깔끔한 제목만 표시
  const getDisplayTitle = () => {
    // YouTube 영상인 경우 metadata.title만 사용 (다른 메타정보 제외)
    if (item.metadata?.platform === 'youtube' && item.metadata?.title) {
      return (item.metadata.title as string).trim()
    }
    
    // 일반적인 경우: metadata.title이 있으면 사용, 없으면 item.name
    return ((item.metadata?.title as string)?.trim()) || item.name.trim()
  }
  
  const displayTitle = getDisplayTitle()
  const displayType = item.type.charAt(0).toUpperCase() + item.type.slice(1)

  return (
    <motion.button
      onClick={() => onSelect(item)}
      className="w-full bg-gradient-to-r from-white to-amber-50/20 hover:from-amber-50/30 hover:to-orange-50/30 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out overflow-hidden"
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02, y: -2 }}
      style={{ 
        marginLeft: level * 8,
        boxShadow: '0 6px 24px rgba(251, 191, 36, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
        minHeight: '80px' // 🎨 터치 영역 최소 44px 이상 확보
      }}
    >
      <div className="flex items-center p-5">
        {/* 🎨 더 크고 직관적인 Type indicator */}
        <div className="flex-shrink-0 w-4 h-12 mr-5 flex items-center">
          <div 
            className="w-3 h-12 rounded-full opacity-70"
            style={{ 
              background: `linear-gradient(135deg, ${color}, ${color}40)`,
              filter: 'blur(0.5px)'
            }}
          />
        </div>

        {/* 🎨 더 크고 명확한 Item icon - 터치 영역 확보 */}
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center mr-5 flex-shrink-0 shadow-lg"
          style={{ 
            backgroundColor: bg,
            border: `1px solid ${color}20`
          }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        
        {/* 🎨 더 크고 가독성 좋은 텍스트 - ph.md 철학 적용 */}
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium text-gray-900 text-lg truncate mb-2 leading-relaxed">
            {displayTitle}
          </p>
          
          <div className="flex items-center gap-3 text-base">
            <span 
              className="px-3 py-1 rounded-xl font-medium text-sm" 
              style={{ 
                backgroundColor: `${color}15`, 
                color: color,
                border: `1px solid ${color}20`
              }}
            >
              {displayType}
            </span>
            
            {/* Show creation date if available */}
            {item.createdAt && (
              <>
                <span className="text-amber-500/60">•</span>
                <span className="text-amber-600/80 text-base font-medium">
                  {new Date(item.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 🎨 더 큰 Arrow indicator - 터치 영역 고려 */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center ml-4 shadow-md">
          <ChevronRight size={16} className="text-amber-600/70" />
        </div>
      </div>
    </motion.button>
  )
}