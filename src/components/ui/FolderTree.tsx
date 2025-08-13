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
  StickyNote,
  Folder
} from 'lucide-react'
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

// 아이템 컴포넌트 (DnD 제거)
const StorageItemNode = ({
  item,
  level,
}: {
  item: StorageItem
  level: number
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getItemIcon = () => {
    switch (item.type) {
      case 'document': return <FileText className="w-3.5 h-3.5" />
      case 'memo': return <StickyNote className="w-3.5 h-3.5" />
      case 'image': return <Image className="w-3.5 h-3.5" aria-label="Image file" />
      case 'video': return <Video className="w-3.5 h-3.5" />
      case 'url': return <Link className="w-3.5 h-3.5" />
      default: return <FileText className="w-3.5 h-3.5" />
    }
  }

  return (
    <div
      style={{
        paddingLeft: `${(level + 1) * 16 + 8}px`
      }}
      className={`flex items-center py-1.5 px-2 mx-1 rounded-md cursor-pointer transition-all duration-150
        ${isHovered ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:text-gray-800'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 flex-1 text-xs">
        <div className="text-gray-400">
          {getItemIcon()}
        </div>
        <span className="truncate">{item.name}</span>
      </div>
    </div>
  )
}

// 폴더 컴포넌트 (DnD 제거, 단순화)
const FolderNode = ({
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
}: {
  item: FolderItem
  level?: number
} & FolderTreeProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [isRenaming, setIsRenaming] = useState(item.name === '' || item.name === 'No name')
  const [renameName, setRenameName] = useState(item.name === '' || item.name === 'No name' ? 'New Folder' : item.name)

  const isExpanded = expandedFolders.has(item.id)
  const isSelected = selectedFolderId === item.id
  const hasChildren = item.children.length > 0

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFolderToggle(item.id)
  }

  const handleSelect = () => {
    onFolderSelect(item.id)
  }

  const handleRename = () => {
    const trimmedName = renameName.trim()
    
    // 🎨 직관적 단순함: 빈 이름이면 기본 이름 제공
    if (!trimmedName) {
      onRenameFolder(item.id, 'New Folder')
    } else if (trimmedName !== item.name) {
      onRenameFolder(item.id, trimmedName)
    }
    
    setIsRenaming(false)
    setRenameName(item.name)
  }

  return (
    <div className="relative"> {/* relative 추가 for absolute positioning */}
      {/* 폴더 헤더 */}
      <div
        className={`group flex items-center py-2 px-2 mx-1 rounded-md cursor-pointer transition-all duration-150
          ${isSelected 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
        style={{
          paddingLeft: `${level * 16 + 8}px`
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          if (!showActions) setShowActions(false)
        }}
        onClick={handleSelect}
      >
        {/* 확장/축소 아이콘 */}
        <button
          className="p-0.5 mr-1 hover:bg-gray-200 rounded transition-colors"
          onClick={handleToggle}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            )
          ) : (
            <div className="w-3.5 h-3.5" />
          )}
        </button>

        {/* 폴더 아이콘과 이름 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Folder 
            className={`w-4 h-4 flex-shrink-0 ${
              isSelected ? 'text-blue-600' : 'text-gray-400'
            }`}
            fill={isSelected ? 'currentColor' : 'none'}
          />
          
          {isRenaming ? (
            <input
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') {
                  setIsRenaming(false)
                  setRenameName(item.name)
                }
              }}
              className="flex-1 text-sm bg-gradient-to-r from-amber-50/50 to-orange-50/30 border-0 rounded-lg px-2 py-1 outline-none focus:from-amber-100/70 focus:to-orange-100/50 transition-all duration-300 shadow-sm focus:shadow-md"
              style={{
                boxShadow: '0 2px 8px rgba(251, 191, 36, 0.15), 0 1px 4px rgba(0, 0, 0, 0.05)'
              }}
              autoFocus
              placeholder="폴더 이름을 입력하세요"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`text-xs truncate ${
              item.name === '' || item.name === 'No name' 
                ? 'text-gray-400 italic' 
                : ''
            }`}>
              {item.name === '' || item.name === 'No name' ? 'New Folder' : item.name}
            </span>
          )}
          
          {/* 아이템 개수 표시 */}
          {item.children.length > 0 && (
            <span className="text-xs text-gray-400">
              ({item.children.length})
            </span>
          )}
        </div>

        {/* 액션 버튼들 - 더 직관적인 삭제 버튼 추가 */}
        {(isHovered || showActions) && !isRenaming && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCreateFolder(item.id)
              }}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="새 폴더"
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
            
            {/* 직접 삭제 버튼 추가 */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`"${item.name || 'New Folder'}" 폴더를 삭제하시겠습니까?`)) {
                  onDeleteFolder(item.id)
                }
              }}
              className="p-1.5 rounded hover:bg-red-100 transition-colors"
              title="폴더 삭제"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* 액션 메뉴 - 위치 수정 */}
      {showActions && (
        <div 
          className="absolute left-4 top-full z-50 mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200"
          style={{
            minWidth: '200px',
            marginLeft: `${level * 16}px`
          }}
          onMouseLeave={() => setShowActions(false)}
        >
          <button
            onClick={() => {
              setIsRenaming(true)
              setShowActions(false)
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit3 className="w-4 h-4" />
            <span>이름 변경</span>
          </button>
          
          {/* 아이템 추가 메뉴 */}
          <div className="border-t border-gray-100 my-1" />
          <div className="px-3 py-1 text-xs text-gray-500">추가하기</div>
          
          {(['memo', 'document', 'url', 'image', 'video'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                onCreateItem(type, item.id)
                setShowActions(false)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {type === 'memo' && <StickyNote className="w-4 h-4" />}
              {type === 'document' && <FileText className="w-4 h-4" />}
              {type === 'url' && <Link className="w-4 h-4" />}
              {type === 'image' && <Image className="w-4 h-4" aria-label="Image file" />}
              {type === 'video' && <Video className="w-4 h-4" />}
              <span>{type === 'url' ? 'URL' : type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </button>
          ))}
          
          {onShareFolder && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  onShareFolder(item.id)
                  setShowActions(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                <Share2 className="w-4 h-4" />
                <span>Market Place에 공유</span>
              </button>
            </>
          )}
          
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              if (confirm('정말로 이 폴더를 삭제하시겠습니까?')) {
                onDeleteFolder(item.id)
                setShowActions(false)
              }
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>삭제</span>
          </button>
        </div>
      )}

      {/* 자식 요소들 */}
      {isExpanded && hasChildren && (
        <div className="transition-all duration-200">
          {item.children.map((child) => (
            child.type === 'folder' ? (
              <FolderNode
                key={child.id}
                item={child as FolderItem}
                level={level + 1}
                folders={[]}
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
            ) : (
              <StorageItemNode
                key={child.id}
                item={child as StorageItem}
                level={level + 1}
              />
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default function FolderTree(props: FolderTreeProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto py-2">
        {props.folders.length === 0 ? (
          <div className="px-4 py-8 text-center">
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
            <FolderNode
              key={folder.id}
              item={folder}
              level={0}
              {...props}
            />
          ))
        )}
      </div>
    </div>
  )
}