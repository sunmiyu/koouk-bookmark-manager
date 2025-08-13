'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  FileText,
  Image as ImageIcon,
  Video,
  Link,
  StickyNote,
  Grid3X3,
  LayoutList,
  FolderOpen,
  Search,
  Plus
} from 'lucide-react'
import { FolderItem, StorageItem } from '@/types/folder'
import { isYouTubeUrl, getYouTubeThumbnail } from '@/utils/youtube'

interface FolderContentProps {
  folderId: string
  folders: FolderItem[]
  editingItem: StorageItem | null
  onFoldersChange: (folders: FolderItem[]) => void
  onSaveMemo: (memo: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>, folderId: string) => void
  onSaveNote: (note: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>, folderId: string) => void
  onCreateItem: () => void
  onDocumentOpen: (item: StorageItem) => void
  searchQuery?: string
}

export default function FolderContent({
  folderId,
  folders,
  onCreateItem,
  onDocumentOpen,
  searchQuery = ''
}: FolderContentProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name' | 'type'>('recent')

  // Find current folder and get its items
  const findFolderById = (folders: FolderItem[], id: string): FolderItem | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder
      const subFolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
      const found = findFolderById(subFolders, id)
      if (found) return found
    }
    return null
  }

  const currentFolder = findFolderById(folders, folderId)
  const items = currentFolder ? currentFolder.children.filter(child => child.type !== 'folder') as StorageItem[] : []

  // Item click handler
  const handleItemClick = (item: StorageItem) => {
    if (item.type === 'url' || item.type === 'video') {
      window.open(item.content, '_blank', 'noopener,noreferrer')
    } else if (item.type === 'document' || item.type === 'memo') {
      onDocumentOpen(item)
    } else if (item.type === 'image') {
      window.open(item.content, '_blank', 'noopener,noreferrer')
    }
  }
  
  // Search filtering
  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    )
  })
  
  // Group items by type
  const typeOrder = { video: 0, image: 1, url: 2, document: 3, memo: 4 }
  
  const groupedItems = filteredItems.reduce((groups, item) => {
    const type = item.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(item)
    return groups
  }, {} as Record<string, StorageItem[]>)
  
  // Sort within each group
  const sortedGroups = Object.keys(groupedItems).sort((a, b) => {
    return (typeOrder[a as keyof typeof typeOrder] ?? 5) - (typeOrder[b as keyof typeof typeOrder] ?? 5)
  }).reduce((result, type) => {
    const items = [...groupedItems[type]].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name, 'ko')
        case 'type':
          return 0
        default:
          return 0
      }
    })
    result[type] = items
    return result
  }, {} as Record<string, StorageItem[]>)

  const getSortLabel = () => {
    switch (sortBy) {
      case 'recent': return 'Recently Modified'
      case 'oldest': return 'Oldest First'
      case 'name': return 'By Name'
      case 'type': return 'By Type'
      default: return 'Recently Modified'
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentFolder?.name || 'Untitled Folder'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Empty folder</p>
            </div>
            
            <button
              onClick={onCreateItem}
              className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Content
            </button>
          </div>
        </div>

        {/* Empty state */}
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center text-center p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Empty Folder</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            This folder is empty. Add some content to get started.
          </p>
          
          <button
            onClick={onCreateItem}
            className="bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Add First Item
          </button>
        </motion.div>
      </div>
    )
  }

  if (searchQuery.trim() && filteredItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentFolder?.name || 'Untitled Folder'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">No search results</p>
            </div>
            
            <button
              onClick={onCreateItem}
              className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Content
            </button>
          </div>
        </div>

        {/* No results state */}
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center text-center p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 max-w-sm">
            No items match &quot;{searchQuery}&quot;. Try different keywords or create new content.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentFolder?.name || 'Untitled Folder'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{filteredItems.length} items</p>
          </div>
          
          <button
            onClick={onCreateItem}
            className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{getSortLabel()}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="recent">Recent</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 p-1 border border-gray-200 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'grid' ? (
          <div className="space-y-8">
            {Object.entries(sortedGroups).map(([type, items]) => (
              <div key={type}>
                {/* Type header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    {type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
                    {type === 'image' && <ImageIcon className="w-4 h-4 text-green-600" />}
                    {type === 'url' && <Link className="w-4 h-4 text-purple-600" />}
                    {type === 'document' && <FileText className="w-4 h-4 text-orange-600" />}
                    {type === 'memo' && <StickyNote className="w-4 h-4 text-yellow-600" />}
                    <h4 className="font-medium text-gray-900">
                      {type === 'url' ? 'Links' : type === 'document' ? 'Documents' : type === 'memo' ? 'Memos' : type === 'image' ? 'Images' : 'Videos'}
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {items.length}
                    </span>
                  </div>
                </div>
                
                {/* Items grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {items.slice(0, 12).map((item) => (
                    <ItemCard key={item.id} item={item} viewMode={viewMode} onItemClick={handleItemClick} />
                  ))}
                </div>
                
                {/* Show more button */}
                {items.length > 12 && (
                  <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <span>Show More ({items.length - 12} items)</span>
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(sortedGroups).flatMap(([, items]) => 
              items.map((item) => (
                <ItemCard key={item.id} item={item} viewMode={viewMode} onItemClick={handleItemClick} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Item card component
const ItemCard = ({ item, viewMode, onItemClick }: { item: StorageItem; viewMode: 'grid' | 'list'; onItemClick: (item: StorageItem) => void }) => {
  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const getDisplayTitle = (item: StorageItem): string => {
    if (item.metadata?.platform === 'youtube' && item.metadata?.title) {
      return item.metadata.title as string
    }
    return (item.metadata?.title as string) || item.name
  }

  if (viewMode === 'grid') {
    const getThumbnail = () => {
      if (item.type === 'video') {
        if (item.metadata?.thumbnail) return item.metadata.thumbnail
        if (isYouTubeUrl(item.content)) {
          return getYouTubeThumbnail(item.content)
        }
        return null
      }
      if (item.type === 'image') {
        return item.content
      }
      if (item.type === 'url') {
        if (item.metadata?.thumbnail) return item.metadata.thumbnail
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

    const getTextPreview = () => {
      if (item.type === 'document' || item.type === 'memo') {
        return item.content.substring(0, 120) + (item.content.length > 120 ? '...' : '')
      }
      return null
    }

    const thumbnail = getThumbnail()
    
    const getTypeIcon = () => {
      switch(item.type) {
        case 'video': return <Video className="w-4 h-4" />
        case 'image': return <ImageIcon className="w-4 h-4" />
        case 'url': return <Link className="w-4 h-4" />
        case 'document': return <FileText className="w-4 h-4" />
        case 'memo': return <StickyNote className="w-4 h-4" />
        default: return <FileText className="w-4 h-4" />
      }
    }

    return (
      <motion.div
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={() => onItemClick(item)}
      >
        {/* Preview area */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-[5/4] overflow-hidden">
          {thumbnail ? (
            <Image 
              src={thumbnail} 
              alt={item.name}
              fill
              className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${
                item.type === 'url' ? 'object-contain p-4' : 'object-cover'
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          
          {/* Text preview */}
          {!thumbnail && getTextPreview() && (
            <div className="absolute inset-0 p-4 flex flex-col justify-center">
              <div className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                {getTextPreview()}
              </div>
            </div>
          )}
          
          {/* Type icon fallback */}
          <div 
            className="w-full h-full absolute inset-0 flex items-center justify-center" 
            style={{ display: (thumbnail || getTextPreview()) ? 'none' : 'flex' }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-500 shadow-sm group-hover:scale-110 transition-all duration-300">
              {getTypeIcon()}
            </div>
          </div>
          
          {/* Duration for videos */}
          {item.type === 'video' && item.metadata?.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
              {Math.floor(item.metadata.duration / 60)}:{(item.metadata.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        
        {/* Title */}
        <div className="p-3">
          <h4 className="font-medium text-gray-900 truncate text-sm">
            {getDisplayTitle(item)}
          </h4>
        </div>
      </motion.div>
    )
  }

  // List view
  return (
    <motion.div 
      className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group border border-gray-100"
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01, y: -1 }}
      onClick={() => onItemClick(item)}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          {item.type === 'video' && <Video className="w-5 h-5 text-blue-600" />}
          {item.type === 'image' && <ImageIcon className="w-5 h-5 text-green-600" />}
          {item.type === 'url' && <Link className="w-5 h-5 text-purple-600" />}
          {item.type === 'document' && <FileText className="w-5 h-5 text-orange-600" />}
          {item.type === 'memo' && <StickyNote className="w-5 h-5 text-yellow-600" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">
          {getDisplayTitle(item)}
        </h4>
        <p className="text-sm text-gray-500 truncate">
          {item.type === 'url' ? getDomain(item.content) : 
           item.content.length > 60 ? item.content.substring(0, 60) + '...' : item.content}
        </p>
      </div>
      <div className="text-sm text-gray-400 flex-shrink-0">
        {new Date(item.updatedAt).toLocaleDateString('ko-KR')}
      </div>
    </motion.div>
  )
}