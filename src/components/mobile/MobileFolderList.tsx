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
      className="flex-1 overflow-y-auto bg-white"
    >
      <div className="p-3 space-y-1">
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
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Folder size={24} color="#9CA3AF" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">No folders</h3>
            <p className="text-xs text-gray-500">Create a new folder using the input bar below</p>
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
      {/* Folder header */}
      <motion.div
        className="flex items-center bg-white hover:bg-gray-50 border border-gray-100 rounded-lg overflow-hidden"
        whileTap={{ scale: 0.98 }}
      >
        {/* Indentation */}
        {level > 0 && (
          <div 
            className="flex-shrink-0"
            style={{ width: `${level * 16}px` }}
          />
        )}
        
        {/* Expand/collapse button */}
        <button
          onClick={() => onToggle(folder.id)}
          className="flex-shrink-0 w-8 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} color="#6B7280" />
            ) : (
              <ChevronRight size={14} color="#6B7280" />
            )
          ) : (
            <div className="w-3 h-3" />
          )}
        </button>

        {/* Folder info - Clickable area */}
        <button
          onClick={() => onFolderSelect?.(folder.id)}
          className="flex-1 flex items-center gap-2 px-2 py-2 hover:bg-gray-50 transition-colors text-left"
        >
          {/* Folder icon */}
          <span className="text-sm flex-shrink-0">
            {folder.icon || '📁'}
          </span>
          
          {/* Folder name and info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm truncate">
              {folder.name}
            </h3>
            {folder.children.length > 0 && (
              <p className="text-xs text-gray-500">
                {folder.children.length} items
              </p>
            )}
          </div>
        </button>
      </motion.div>

      {/* Expanded sub-items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2"
          >
            <div className="space-y-1 ml-4">
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

  const Icon = getIcon(item.type)

  return (
    <motion.button
      onClick={() => onSelect(item)}
      className="w-full flex items-center bg-white hover:bg-gray-50 border border-gray-100 rounded-lg overflow-hidden transition-colors"
      whileTap={{ scale: 0.98 }}
    >
      {/* Indentation */}
      {level > 0 && (
        <div 
          className="flex-shrink-0"
          style={{ width: `${level * 16}px` }}
        />
      )}
      
      {/* Empty space (expand button area) */}
      <div className="w-8 flex items-center justify-center">
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Item info */}
      <div className="flex-1 flex items-center gap-2 px-2 py-2 text-left">
        {/* Item icon */}
        <Icon size={14} className="flex-shrink-0 text-gray-500" />
        
        {/* Item name */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-sm truncate">
            {(item.metadata?.title as string) || item.name}
          </p>
        </div>
        
        {/* Type label */}
        <span className="text-xs text-gray-400 flex-shrink-0">
          {item.type}
        </span>
      </div>
    </motion.button>
  )
}

