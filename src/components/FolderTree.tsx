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
  Share2,
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
  onShareFolder?: (folderId: string) => void
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
      case 'document': return <FileText className="w-4 h-4" />
      case 'memo': return <StickyNote className="w-4 h-4" />
      case 'image': return <Image className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'url': return <Link className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginLeft: `${(level + 1) * 20 + 12}px`
      }}
      {...attributes}
      {...listeners}
      className={`flex items-center py-2 px-3 mx-2 rounded-md cursor-pointer transition-all duration-150
        ${
          isHovered 
            ? 'bg-gray-50 text-gray-900' 
            : 'text-gray-600 hover:text-gray-800'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2.5 flex-1 text-sm">
        <div className="text-gray-400">
          {getItemIcon()}
        </div>
        <span className="truncate font-medium">{item.name}</span>
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
  onShareFolder,
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
      {/* Vercel 스타일 폴더 헤더 */}
      <div
        className={`group flex items-center py-2.5 px-3 mx-2 rounded-lg cursor-pointer transition-all duration-150
          ${
            isSelected 
              ? 'bg-gray-100 text-gray-900 shadow-sm' 
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
        style={{
          marginLeft: `${level * 20}px`,
          borderRadius: '8px',
          boxShadow: isOver ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
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
        {/* Vercel 스타일 확장/축소 아이콘 */}
        <div 
          className="flex items-center justify-center w-5 h-5 mr-2"
          onClick={(e) => {
            e.stopPropagation()
            if (hasChildren) handleToggle()
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown 
                className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-150" 
              />
            ) : (
              <ChevronRight 
                className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-150" 
              />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* Vercel 스타일 폴더 정보 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color || '#6b7280' }}
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
              className="flex-1 text-sm font-medium bg-transparent border border-gray-200 rounded px-2 py-1 outline-none focus:border-gray-400"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm font-medium truncate">
              {item.name}
            </span>
          )}
        </div>

        {/* Vercel 스타일 액션 버튼들 */}
        {(isHovered || showActions) && !isRenaming && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCreateFolder(item.id)
              }}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-150"
              title="새 폴더"
            >
              <FolderPlus className="w-3.5 h-3.5 text-gray-500" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-150"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Vercel 스타일 액션 메뉴 */}
      {showActions && (
        <div 
          className="absolute z-20 mt-1 py-2 bg-white rounded-lg shadow-lg border border-gray-100"
          style={{
            marginLeft: `${(level + 1) * 20 + 12}px`,
            minWidth: '180px'
          }}
        >
          <button
            onClick={() => {
              setIsRenaming(true)
              setShowActions(false)
            }}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-150"
          >
            <Edit3 className="w-4 h-4" />
            <span>이름 변경</span>
          </button>
          {onShareFolder && (
            <button
              onClick={() => {
                onShareFolder(item.id)
                setShowActions(false)
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-150"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Place에 공유</span>
            </button>
          )}
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={() => {
              onDeleteFolder(item.id)
              setShowActions(false)
            }}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-150"
          >
            <Trash2 className="w-4 h-4" />
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
  onCreateItem,
  onRenameFolder,
  onDeleteFolder,
  onShareFolder
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
      onCreateItem={onCreateItem}
      onRenameFolder={onRenameFolder}
      onDeleteFolder={onDeleteFolder}
      onShareFolder={onShareFolder}
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
          onCreateItem={onCreateItem}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          onShareFolder={onShareFolder}
        />
      ))}
    </DroppableFolder>
  )
}

export default function FolderTree(props: FolderTreeProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Vercel 스타일 폴더 트리 */}
      <SortableContext
        items={props.folders.map(f => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto py-2">
          {props.folders.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FolderPlus className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-3">아직 폴더가 없습니다</p>
              <button
                onClick={() => props.onCreateFolder()}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                첫 번째 폴더 만들기
              </button>
            </div>
          ) : (
            props.folders.map((folder) => (
              <FolderTreeNode
                key={folder.id}
                item={folder}
                {...props}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}