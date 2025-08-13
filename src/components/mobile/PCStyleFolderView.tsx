'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Grid3X3, 
  List, 
  Plus,
  ChevronRight,
  Folder,
  FileText,
  Image,
  Video,
  Link,
  StickyNote,
  File
} from 'lucide-react'
import { FolderItem, StorageItem } from '@/types/folder'

interface PCStyleFolderViewProps {
  currentFolder: FolderItem | null
  folderPath: { id: string; name: string }[]
  onBack: () => void
  onNavigateToFolder: (folderId: string) => void
  onFolderSelect: (folderId: string) => void
  onItemSelect: (item: StorageItem) => void
  onCreateFolder: (parentId: string) => void
  onCreateItem?: (type: StorageItem['type'], folderId: string) => void
}

type ViewMode = 'grid' | 'list'

export default function PCStyleFolderView({
  currentFolder,
  folderPath,
  onBack,
  onNavigateToFolder,
  onFolderSelect,
  onItemSelect,
  onCreateFolder
}: PCStyleFolderViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  // const [showContextMenu, setShowContextMenu] = useState<string | null>(null)

  if (!currentFolder) return null

  const subFolders = currentFolder.children.filter(child => child.type === 'folder') as FolderItem[]
  const items = currentFolder.children.filter(child => child.type !== 'folder') as StorageItem[]

  // Get PC-style icon for file types
  const getFileIcon = (type: StorageItem['type']) => {
    switch (type) {
      case 'document': return { Icon: FileText, color: '#3B82F6', bgColor: '#EFF6FF' }
      case 'image': return { Icon: Image, color: '#10B981', bgColor: '#ECFDF5' }
      case 'video': return { Icon: Video, color: '#F59E0B', bgColor: '#FEF3C7' }
      case 'url': return { Icon: Link, color: '#8B5CF6', bgColor: '#F3E8FF' }
      case 'memo': return { Icon: StickyNote, color: '#EF4444', bgColor: '#FEF2F2' }
      default: return { Icon: File, color: '#6B7280', bgColor: '#F9FAFB' }
    }
  }

  // Format file size/date like PC
  const formatItemInfo = (item: StorageItem) => {
    const type = item.type.charAt(0).toUpperCase() + item.type.slice(1)
    const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    }) : 'Today'
    return `${type} • ${date}`
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* PC-Style Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center mb-3">
          <button
            onClick={onBack}
            className="mr-3 p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <button
              onClick={() => onNavigateToFolder('')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              My Folder
            </button>
            
            {folderPath.map((pathItem, index) => (
              <div key={pathItem.id} className="flex items-center gap-1">
                <ChevronRight size={14} className="text-gray-400" />
                <button
                  onClick={() => onNavigateToFolder(pathItem.id)}
                  className={`text-sm font-medium transition-colors truncate max-w-24 ${
                    index === folderPath.length - 1
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {pathItem.name}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => onCreateFolder(currentFolder.id)}
            className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="새 폴더"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* PC-Style Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {subFolders.length + items.length}개 항목
            </span>
            {subFolders.length > 0 && (
              <span className="text-sm text-gray-500">
                {subFolders.length}개 폴더
              </span>
            )}
            {items.length > 0 && (
              <span className="text-sm text-gray-500">
                {items.length}개 파일
              </span>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="그리드 보기"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="리스트 보기"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'grid' ? (
          <GridView
            subFolders={subFolders}
            items={items}
            onFolderSelect={onFolderSelect}
            onItemSelect={onItemSelect}
            getFileIcon={getFileIcon}
            formatItemInfo={formatItemInfo}
          />
        ) : (
          <ListView
            subFolders={subFolders}
            items={items}
            onFolderSelect={onFolderSelect}
            onItemSelect={onItemSelect}
            getFileIcon={getFileIcon}
            formatItemInfo={formatItemInfo}
          />
        )}

        {/* Empty State */}
        {subFolders.length === 0 && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Folder size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">폴더가 비어있습니다</h3>
            <p className="text-sm text-gray-500 mb-4">새 폴더나 파일을 추가해보세요</p>
            <button
              onClick={() => onCreateFolder(currentFolder.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              폴더 만들기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Grid View Component
function GridView({
  subFolders,
  items,
  onFolderSelect,
  onItemSelect,
  getFileIcon,
  formatItemInfo
}: {
  subFolders: FolderItem[]
  items: StorageItem[]
  onFolderSelect: (folderId: string) => void
  onItemSelect: (item: StorageItem) => void
  getFileIcon: (type: StorageItem['type']) => { Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string; bgColor: string }
  formatItemInfo: (item: StorageItem) => string
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Folder Cards */}
      {subFolders.map((folder) => (
        <motion.button
          key={folder.id}
          onClick={() => onFolderSelect(folder.id)}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 text-left"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
              <Folder size={24} className="text-yellow-600" />
            </div>
            <h3 className="font-medium text-gray-900 text-sm mb-1 truncate w-full">
              {folder.name}
            </h3>
            <p className="text-xs text-gray-500">
              {folder.children.length}개 항목
            </p>
          </div>
        </motion.button>
      ))}

      {/* File Cards */}
      {items.map((item) => {
        const { Icon, color, bgColor } = getFileIcon(item.type)
        const displayTitle = (item.metadata?.title as string)?.trim() || item.name.trim()
        
        return (
          <motion.button
            key={item.id}
            onClick={() => onItemSelect(item)}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 text-left"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: bgColor }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-1 truncate w-full">
                {displayTitle}
              </h3>
              <p className="text-xs text-gray-500">
                {formatItemInfo(item)}
              </p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// List View Component
function ListView({
  subFolders,
  items,
  onFolderSelect,
  onItemSelect,
  getFileIcon,
  formatItemInfo
}: {
  subFolders: FolderItem[]
  items: StorageItem[]
  onFolderSelect: (folderId: string) => void
  onItemSelect: (item: StorageItem) => void
  getFileIcon: (type: StorageItem['type']) => { Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string; bgColor: string }
  formatItemInfo: (item: StorageItem) => string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Folder Rows */}
      {subFolders.map((folder, index) => (
        <motion.button
          key={folder.id}
          onClick={() => onFolderSelect(folder.id)}
          className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left ${
            index > 0 || items.length > 0 ? 'border-t border-gray-100' : ''
          }`}
          whileTap={{ scale: 0.995 }}
        >
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <Folder size={20} className="text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm truncate">
              {folder.name}
            </h3>
            <p className="text-xs text-gray-500">
              폴더 • {folder.children.length}개 항목
            </p>
          </div>
          <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
        </motion.button>
      ))}

      {/* File Rows */}
      {items.map((item, index) => {
        const { Icon, color, bgColor } = getFileIcon(item.type)
        const displayTitle = (item.metadata?.title as string)?.trim() || item.name.trim()
        
        return (
          <motion.button
            key={item.id}
            onClick={() => onItemSelect(item)}
            className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left ${
              index > 0 || subFolders.length > 0 ? 'border-t border-gray-100' : ''
            }`}
            whileTap={{ scale: 0.995 }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
              style={{ backgroundColor: bgColor }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm truncate">
                {displayTitle}
              </h3>
              <p className="text-xs text-gray-500">
                {formatItemInfo(item)}
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
          </motion.button>
        )
      })}
    </div>
  )
}