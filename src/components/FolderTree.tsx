'use client'

import { useState } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  FolderPlus,
  FileText,
  Image,
  Video,
  Link,
  StickyNote
} from 'lucide-react'
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  CSS,
} from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { FolderItem, StorageItem } from '@/types/folder'

interface FolderTreeProps {
  folders: FolderItem[]
  selectedFolderId?: string
  expandedFolders: Set<string>
  onFolderSelect: (folderId: string) => void
  onFolderToggle: (folderId: string) => void
  onCreateFolder: (parentId?: string) => void
  onCreateItem: (type: StorageItem['type'], folderId: string) => void
  onRenameFolder: (folderId: string, newName: string) => void
  onDeleteFolder: (folderId: string) => void
}

const DraggableStorageItem = ({
  item,
  level,
}: {
  item: StorageItem
  level: number
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getItemIcon = () => {
    switch (item.type) {
      case 'document': return <FileText size={14} />
      case 'memo': return <StickyNote size={14} />
      case 'image': return <Image size={14} />
      case 'video': return <Video size={14} />
      case 'url': return <Link size={14} />
      default: return <FileText size={14} />
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginLeft: `${(level + 1) * 16}px`,
        backgroundColor: isHovered ? 'var(--bg-secondary)' : 'transparent',
        color: 'var(--text-secondary)'
      }}
      {...attributes}
      {...listeners}
      className="flex items-center py-1 px-2 rounded-lg cursor-pointer transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 flex-1 text-xs">
        {getItemIcon()}
        <span className="truncate">{item.name}</span>
      </div>
    </div>
  )
}

const DroppableFolder = ({
  item,
  level = 0,
  selectedFolderId,
  expandedFolders,
  onFolderSelect,
  onFolderToggle,
  onCreateFolder,
  onCreateItem,
  onRenameFolder,
  onDeleteFolder,
  children
}: {
  item: FolderItem
  level?: number
  children?: React.ReactNode
} & Omit<FolderTreeProps, 'folders'>) => {
  const { setNodeRef, isOver } = useDroppable({
    id: item.id,
  })

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameName, setRenameName] = useState(item.name)

  const isExpanded = expandedFolders.has(item.id)
  const isSelected = selectedFolderId === item.id
  const hasChildren = item.children.length > 0

  const handleToggle = () => {
    onFolderToggle(item.id)
  }

  const handleSelect = () => {
    onFolderSelect(item.id)
  }

  const handleRename = () => {
    if (renameName.trim() && renameName !== item.name) {
      onRenameFolder(item.id, renameName.trim())
    }
    setIsRenaming(false)
  }

  // 두 개의 ref를 결합
  const combinedRef = (node: HTMLElement | null) => {
    setNodeRef(node)
    setSortableNodeRef(node)
  }

  return (
    <div ref={combinedRef} style={style}>
      {/* 폴더 헤더 */}
      <div
        className="group flex items-center py-2 px-2 rounded-lg cursor-pointer transition-all duration-300"
        style={{
          marginLeft: `${level * 16}px`,
          backgroundColor: isSelected 
            ? 'var(--bg-secondary)' 
            : (isOver || isHovered) ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
          borderLeft: isSelected ? `3px solid ${item.color || 'var(--text-primary)'}` : '3px solid transparent',
          borderRadius: isOver ? '8px' : '4px',
          boxShadow: isOver ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
        }}
        {...attributes}
        {...listeners}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowActions(false)
        }}
        onClick={handleSelect}
      >
        {/* 확장/축소 아이콘 */}
        <div 
          className="flex items-center justify-center w-5 h-5 mr-1"
          onClick={(e) => {
            e.stopPropagation()
            if (hasChildren) handleToggle()
          }}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown 
                size={14} 
                style={{ color: 'var(--text-secondary)' }}
                className="transition-transform duration-200"
              />
            ) : (
              <ChevronRight 
                size={14} 
                style={{ color: 'var(--text-secondary)' }}
                className="transition-transform duration-200"
              />
            )
          )}
        </div>

        {/* 폴더 정보 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color || 'var(--text-secondary)' }}
          />
          
          {isRenaming ? (
            <input
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onBlur={handleRename}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') {
                  setIsRenaming(false)
                  setRenameName(item.name)
                }
              }}
              className="flex-1 text-sm bg-transparent border-none outline-none"
              style={{ color: 'var(--text-primary)' }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className="text-sm font-medium truncate"
              style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {item.name}
            </span>
          )}
        </div>

        {/* 액션 버튼들 */}
        {(isHovered || showActions) && !isRenaming && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCreateFolder(item.id)
              }}
              className="p-1 rounded hover:bg-black hover:bg-opacity-5 transition-colors"
              title="새 폴더"
            >
              <FolderPlus size={12} style={{ color: 'var(--text-secondary)' }} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className="p-1 rounded hover:bg-black hover:bg-opacity-5 transition-colors"
            >
              <MoreHorizontal size={12} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        )}
      </div>

      {/* 액션 메뉴 */}
      {showActions && (
        <div 
          className="absolute z-10 mt-1 py-1 rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            marginLeft: `${(level + 1) * 16}px`
          }}
        >
          <button
            onClick={() => {
              setIsRenaming(true)
              setShowActions(false)
            }}
            className="flex items-center gap-2 w-full px-3 py-1 text-xs hover:bg-gray-50 transition-colors"
          >
            <Edit3 size={12} />
            <span>이름 변경</span>
          </button>
          <button
            onClick={() => {
              onDeleteFolder(item.id)
              setShowActions(false)
            }}
            className="flex items-center gap-2 w-full px-3 py-1 text-xs hover:bg-red-50 text-red-600 transition-colors"
          >
            <Trash2 size={12} />
            <span>삭제</span>
          </button>
        </div>
      )}

      {/* 자식 요소들 */}
      {isExpanded && hasChildren && (
        <SortableContext
          items={item.children.map(child => child.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="transition-all duration-200">
            {children}
          </div>
        </SortableContext>
      )}
    </div>
  )
}

const FolderTreeNode = ({
  item,
  level = 0,
  selectedFolderId,
  expandedFolders,
  onFolderSelect,
  onFolderToggle,
  onCreateFolder,
  // onCreateItem,
  onRenameFolder,
  onDeleteFolder
}: {
  item: FolderItem | StorageItem
  level?: number
} & Omit<FolderTreeProps, 'folders'>) => {
  if (item.type !== 'folder') {
    return (
      <DraggableStorageItem 
        item={item as StorageItem} 
        level={level}
      />
    )
  }

  // Folder 렌더링
  const folderItem = item as FolderItem
  const isExpanded = expandedFolders.has(folderItem.id)

  return (
    <DroppableFolder
      item={folderItem}
      level={level}
      selectedFolderId={selectedFolderId}
      expandedFolders={expandedFolders}
      onFolderSelect={onFolderSelect}
      onFolderToggle={onFolderToggle}
      onCreateFolder={onCreateFolder}
      onCreateItem={() => {}}
      onRenameFolder={onRenameFolder}
      onDeleteFolder={onDeleteFolder}
    >
      {isExpanded && folderItem.children.map((child) => (
        <FolderTreeNode
          key={child.id}
          item={child}
          level={level + 1}
          selectedFolderId={selectedFolderId}
          expandedFolders={expandedFolders}
          onFolderSelect={onFolderSelect}
          onFolderToggle={onFolderToggle}
          onCreateFolder={onCreateFolder}
          onCreateItem={() => {}}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
        />
      ))}
    </DroppableFolder>
  )
}

export default function FolderTree(props: FolderTreeProps) {
  return (
    <div 
      className="h-full flex flex-col"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border-light)'
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          폴더
        </h2>
        <button
          onClick={() => props.onCreateFolder()}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          title="새 폴더"
        >
          <Plus size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* 폴더 트리 */}
      <SortableContext
        items={props.folders.map(f => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
          {props.folders.map((folder) => (
            <FolderTreeNode
              key={folder.id}
              item={folder}
              {...props}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}