'use client'

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { createContext, useContext, useState, ReactNode } from 'react'
import { FolderItem, StorageItem } from '@/types/folder'

interface DragDropContextType {
  activeId: UniqueIdentifier | null
  folders: FolderItem[]
  setFolders: (folders: FolderItem[]) => void
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragOver: (event: DragOverEvent) => void
}

const DragDropContext = createContext<DragDropContextType | null>(null)

export const useDragDrop = () => {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider')
  }
  return context
}

interface DragDropProviderProps {
  children: ReactNode
  initialFolders: FolderItem[]
  onFoldersChange: (folders: FolderItem[]) => void
}

export function DragDropProvider({ children, initialFolders, onFoldersChange }: DragDropProviderProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [folders, setFolders] = useState<FolderItem[]>(initialFolders)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동 후 드래그 시작 (클릭과 구분)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 재귀적으로 폴더와 아이템을 찾는 헬퍼 함수
  const findItemInFolders = (folders: FolderItem[], id: string): { item: FolderItem | StorageItem; parent?: FolderItem } | null => {
    for (const folder of folders) {
      if (folder.id === id) {
        return { item: folder }
      }
      
      for (const child of folder.children) {
        if (child.id === id) {
          return { item: child, parent: folder }
        }
        
        if (child.type === 'folder') {
          const found = findItemInFolders([child], id)
          if (found) return found
        }
      }
    }
    return null
  }

  // 폴더나 아이템을 제거하는 헬퍼 함수
  const removeItemFromFolders = (folders: FolderItem[], itemId: string): FolderItem[] => {
    return folders.map(folder => {
      if (folder.id === itemId) {
        return null // 이 폴더를 제거
      }
      
      return {
        ...folder,
        children: folder.children
          .filter(child => child.id !== itemId) // 직속 자식 중에서 제거
          .map(child => child.type === 'folder' ? removeItemFromFolders([child], itemId)[0] : child) // 재귀적으로 제거
      }
    }).filter(Boolean) as FolderItem[]
  }

  // 폴더에 아이템을 추가하는 헬퍼 함수
  const addItemToFolder = (folders: FolderItem[], folderId: string, item: FolderItem | StorageItem): FolderItem[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          children: [...folder.children, item],
          updatedAt: new Date().toISOString()
        }
      }
      
      return {
        ...folder,
        children: folder.children.map(child => 
          child.type === 'folder' 
            ? addItemToFolder([child], folderId, item)[0]
            : child
        )
      }
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return

    const activeId = active.id
    const overId = over.id

    // 자기 자신에게 드래그하는 경우 무시
    if (activeId === overId) return

    const activeItem = findItemInFolders(folders, activeId.toString())
    const overItem = findItemInFolders(folders, overId.toString())

    if (!activeItem || !overItem) return

    // 폴더를 자신의 하위 폴더로 이동하려는 경우 방지
    if (activeItem.item.type === 'folder' && overItem.item.type === 'folder') {
      const isDescendant = (parentId: string, childId: string): boolean => {
        const parent = findItemInFolders(folders, parentId)
        if (!parent || parent.item.type !== 'folder') return false
        
        return parent.item.children.some(child => 
          child.id === childId || (child.type === 'folder' && isDescendant(child.id, childId))
        )
      }

      if (isDescendant(activeId.toString(), overId.toString())) {
        return // 순환 참조 방지
      }
    }

    // Storage Item을 다른 폴더로 이동
    if (activeItem.item.type !== 'folder' && overItem.item.type === 'folder') {
      const updatedItem: StorageItem = {
        ...activeItem.item as StorageItem,
        folderId: overId.toString(),
        updatedAt: new Date().toISOString()
      }

      let newFolders = removeItemFromFolders(folders, activeId.toString())
      newFolders = addItemToFolder(newFolders, overId.toString(), updatedItem)
      
      setFolders(newFolders)
      onFoldersChange(newFolders)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const activeItem = findItemInFolders(folders, activeId.toString())
    const overItem = findItemInFolders(folders, overId.toString())

    if (!activeItem || !overItem) return

    // 폴더를 다른 폴더로 이동
    if (activeItem.item.type === 'folder' && overItem.item.type === 'folder') {
      const updatedFolder: FolderItem = {
        ...activeItem.item as FolderItem,
        parentId: overId.toString(),
        updatedAt: new Date().toISOString()
      }

      let newFolders = removeItemFromFolders(folders, activeId.toString())
      newFolders = addItemToFolder(newFolders, overId.toString(), updatedFolder)
      
      setFolders(newFolders)
      onFoldersChange(newFolders)
    }
  }

  const contextValue: DragDropContextType = {
    activeId,
    folders,
    setFolders: (newFolders: FolderItem[]) => {
      setFolders(newFolders)
      onFoldersChange(newFolders)
    },
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  }

  return (
    <DragDropContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={folders.map(f => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div
              className="px-3 py-2 rounded-lg shadow-lg opacity-90"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px solid var(--text-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-current" />
                <span className="text-sm font-medium">
                  {findItemInFolders(folders, activeId.toString())?.item.name}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  )
}