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
      className="flex-1 overflow-y-auto bg-gray-50"
    >
      <div className="p-4 space-y-3">
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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Folder size={32} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No folders yet</h3>
            <p className="text-sm text-gray-500 max-w-xs">Start organizing your content by creating your first folder</p>
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
      {/* Modern Folder Card */}
      <motion.div
        className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
        whileTap={{ scale: 0.98 }}
        style={{ marginLeft: level * 16 }}
      >
        {/* Colored accent bar */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b"
          style={{ 
            background: `linear-gradient(to bottom, ${folder.color || '#3B82F6'}, ${folder.color || '#3B82F6'}80)` 
          }}
        />
        
        <div className="flex items-center">
          {/* Expand/collapse button */}
          <button
            onClick={() => onToggle(folder.id)}
            className="flex-shrink-0 w-12 h-14 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {/* Main folder content */}
          <button
            onClick={() => onFolderSelect?.(folder.id)}
            className="flex-1 flex items-center gap-3 px-3 py-3 hover:bg-gray-50/50 transition-colors text-left"
          >
            {/* Folder icon with background */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm"
              style={{ 
                backgroundColor: `${folder.color || '#3B82F6'}15`,
                border: `1px solid ${folder.color || '#3B82F6'}30`
              }}
            >
              <span className="filter drop-shadow-sm">
                {folder.icon || '📁'}
              </span>
            </div>
            
            {/* Folder info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate mb-0.5">
                {folder.name}
              </h3>
              {folder.children.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{folder.children.length} items</span>
                  {items.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{items.length} files</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Share button */}
            {onShareFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShareFolder(folder.id)
                }}
                className="mr-2 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors flex-shrink-0"
                title="Share folder"
              >
                <Share2 size={14} className="text-blue-600" />
              </button>
            )}

            {/* Arrow indicator */}
            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
          </button>
        </div>
      </motion.div>

      {/* Expanded sub-items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-3"
          >
            <div className="space-y-2 ml-6 pl-4 border-l-2 border-gray-100">
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
  
  // Fix duplicate text issue - use title first, fallback to name
  const displayTitle = (item.metadata?.title as string)?.trim() || item.name.trim()
  const displayType = item.type.charAt(0).toUpperCase() + item.type.slice(1)

  return (
    <motion.button
      onClick={() => onSelect(item)}
      className="w-full bg-white hover:bg-gray-50 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      whileTap={{ scale: 0.98 }}
      style={{ marginLeft: level * 8 }}
    >
      <div className="flex items-center p-3">
        {/* Type indicator dot */}
        <div className="flex-shrink-0 w-2 h-8 mr-3 flex items-center">
          <div 
            className="w-1.5 h-8 rounded-full"
            style={{ backgroundColor: color + '40' }}
          />
        </div>

        {/* Item icon */}
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
          style={{ backgroundColor: bg }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        
        {/* Item content */}
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium text-gray-900 text-sm truncate mb-0.5">
            {displayTitle}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-1.5 py-0.5 rounded-md font-medium" style={{ 
              backgroundColor: bg, 
              color: color 
            }}>
              {displayType}
            </span>
            
            {/* Show creation date if available */}
            {item.createdAt && (
              <>
                <span>•</span>
                <span>{new Date(item.createdAt).toLocaleDateString('ko-KR', { 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </>
            )}
          </div>
        </div>

        {/* Arrow indicator */}
        <ChevronRight size={12} className="text-gray-300 flex-shrink-0 ml-2" />
      </div>
    </motion.button>
  )
}