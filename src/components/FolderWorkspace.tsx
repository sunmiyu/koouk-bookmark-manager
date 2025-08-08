'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus,
  FileText,
  Image,
  Video,
  Link,
  StickyNote,
  Grid3X3,
  LayoutList
} from 'lucide-react'
import WorkspaceLayout from './WorkspaceLayout'
import { DragDropProvider } from '@/contexts/DragDropContext'
import { FolderItem, StorageItem, createFolder, createStorageItem, defaultFolderTemplates } from '@/types/folder'

interface FolderWorkspaceProps {
  // 추후 props 추가 가능
}

export default function FolderWorkspace(props: FolderWorkspaceProps) {
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // localStorage에서 데이터 로드
  useEffect(() => {
    const loadData = () => {
      try {
        const savedFolders = localStorage.getItem('koouk-folders')
        const savedSelectedId = localStorage.getItem('koouk-selected-folder')
        const savedExpandedIds = localStorage.getItem('koouk-expanded-folders')

        if (savedFolders) {
          const parsedFolders = JSON.parse(savedFolders)
          setFolders(parsedFolders)
          
          if (parsedFolders.length > 0 && !savedSelectedId) {
            setSelectedFolderId(parsedFolders[0].id)
          }
        } else {
          // 첫 방문 시 기본 템플릿 생성
          const initialFolders = defaultFolderTemplates.general.map(template =>
            createFolder(template.name, undefined, template)
          )
          setFolders(initialFolders)
          if (initialFolders.length > 0) {
            setSelectedFolderId(initialFolders[0].id)
          }
        }

        if (savedSelectedId) {
          setSelectedFolderId(savedSelectedId)
        }

        if (savedExpandedIds) {
          setExpandedFolders(new Set(JSON.parse(savedExpandedIds)))
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
        // 기본 폴더 생성
        const initialFolders = defaultFolderTemplates.general.map(template =>
          createFolder(template.name, undefined, template)
        )
        setFolders(initialFolders)
        if (initialFolders.length > 0) {
          setSelectedFolderId(initialFolders[0].id)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 데이터 저장
  const saveToStorage = (newFolders: FolderItem[], newSelectedId?: string) => {
    try {
      localStorage.setItem('koouk-folders', JSON.stringify(newFolders))
      
      if (newSelectedId !== undefined) {
        localStorage.setItem('koouk-selected-folder', newSelectedId)
      }
      
      localStorage.setItem('koouk-expanded-folders', JSON.stringify([...expandedFolders]))
    } catch (error) {
      console.error('데이터 저장 실패:', error)
    }
  }

  // 폴더 관련 핸들러들
  const handleFoldersChange = (newFolders: FolderItem[]) => {
    setFolders(newFolders)
    saveToStorage(newFolders)
  }

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    saveToStorage(folders, folderId)
  }

  const handleFolderToggle = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
    saveToStorage(folders)
  }

  const handleCreateFolder = (parentId?: string) => {
    const folderName = prompt('새 폴더 이름을 입력하세요:', '새 폴더')
    if (!folderName?.trim()) return

    const newFolder = createFolder(folderName.trim(), parentId)
    
    if (parentId) {
      // 특정 폴더의 하위 폴더로 추가
      const updatedFolders = addToParentFolder(folders, parentId, newFolder)
      handleFoldersChange(updatedFolders)
      
      // 부모 폴더 확장
      const newExpanded = new Set(expandedFolders)
      newExpanded.add(parentId)
      setExpandedFolders(newExpanded)
    } else {
      // 루트 레벨에 추가
      const newFolders = [...folders, newFolder]
      handleFoldersChange(newFolders)
    }
    
    // 새로 생성된 폴더 선택
    handleFolderSelect(newFolder.id)
  }

  const handleRenameFolder = (folderId: string, newName: string) => {
    const updatedFolders = updateFolderInTree(folders, folderId, { name: newName, updatedAt: new Date().toISOString() })
    handleFoldersChange(updatedFolders)
  }

  const handleDeleteFolder = (folderId: string) => {
    if (!confirm('정말로 이 폴더를 삭제하시겠습니까? 하위 폴더와 모든 내용이 함께 삭제됩니다.')) {
      return
    }
    
    const updatedFolders = removeFolderFromTree(folders, folderId)
    handleFoldersChange(updatedFolders)
    
    // 삭제된 폴더가 선택되어 있었다면 첫 번째 폴더 선택
    if (selectedFolderId === folderId && updatedFolders.length > 0) {
      handleFolderSelect(updatedFolders[0].id)
    }
  }

  const handleCreateItem = (type: StorageItem['type'], folderId: string) => {
    const typeLabels = {
      document: '문서',
      memo: '메모',
      image: '이미지',
      video: '비디오',
      url: 'URL'
    }
    
    const itemName = prompt(`새 ${typeLabels[type]} 이름을 입력하세요:`, `새 ${typeLabels[type]}`)
    if (!itemName?.trim()) return

    let content = ''
    if (type === 'url') {
      content = prompt('URL을 입력하세요:', 'https://') || ''
    } else {
      content = prompt('내용을 입력하세요:', '') || ''
    }

    const newItem = createStorageItem(itemName.trim(), type, content, folderId)
    const updatedFolders = addItemToFolder(folders, folderId, newItem)
    handleFoldersChange(updatedFolders)
  }

  // 현재 선택된 폴더의 아이템들 가져오기
  const getSelectedFolderItems = (): StorageItem[] => {
    if (!selectedFolderId) return []
    
    const findItems = (folders: FolderItem[]): StorageItem[] => {
      for (const folder of folders) {
        if (folder.id === selectedFolderId) {
          return folder.children.filter(child => child.type !== 'folder') as StorageItem[]
        }
        
        const childFolderItems = folder.children
          .filter(child => child.type === 'folder')
          .map(child => child as FolderItem)
        
        const found = findItems(childFolderItems)
        if (found.length > 0) return found
      }
      return []
    }

    return findItems(folders)
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>워크스페이스 로딩중...</p>
        </div>
      </div>
    )
  }

  return (
    <DragDropProvider 
      initialFolders={folders}
      onFoldersChange={handleFoldersChange}
    >
      <WorkspaceLayout
        folders={folders}
        selectedFolderId={selectedFolderId}
        expandedFolders={expandedFolders}
        onFolderSelect={handleFolderSelect}
        onFolderToggle={handleFolderToggle}
        onCreateFolder={handleCreateFolder}
        onCreateItem={handleCreateItem}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
      >
        <FolderContent 
          items={getSelectedFolderItems()}
          onCreateItem={(type) => selectedFolderId && handleCreateItem(type, selectedFolderId)}
        />
      </WorkspaceLayout>
    </DragDropProvider>
  )
}

// 폴더 콘텐츠 컴포넌트
const FolderContent = ({ 
  items, 
  onCreateItem 
}: { 
  items: StorageItem[]
  onCreateItem: (type: StorageItem['type']) => void
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  if (items.length === 0) {
    return (
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center text-center p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-full mb-6 flex items-center justify-center" 
             style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <FileText size={24} style={{ color: 'var(--text-secondary)' }} />
        </div>
        
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          폴더가 비어있습니다
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          새로운 콘텐츠를 추가하여 시작하세요
        </p>

        <div className="flex flex-wrap gap-3">
          {[
            { type: 'url' as const, label: 'URL', icon: Link },
            { type: 'memo' as const, label: '메모', icon: StickyNote },
            { type: 'document' as const, label: '문서', icon: FileText },
            { type: 'image' as const, label: '이미지', icon: Image },
            { type: 'video' as const, label: '비디오', icon: Video },
          ].map(({ type, label, icon: Icon }) => (
            <motion.button
              key={type}
              onClick={() => onCreateItem(type)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-light)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={16} />
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="flex-1 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 헤더 & 필터 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {items.length}개의 항목
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            최근 수정된 순으로 정렬
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid3X3 size={16} style={{ color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)' }} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <LayoutList size={16} style={{ color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* 콘텐츠 그리드/리스트 */}
      <div className={
        viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-3"
      }>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} viewMode={viewMode} />
        ))}
      </div>
    </motion.div>
  )
}

// 아이템 카드 컴포넌트
const ItemCard = ({ item, viewMode }: { item: StorageItem; viewMode: 'grid' | 'list' }) => {
  const getItemIcon = () => {
    switch (item.type) {
      case 'document': return <FileText size={20} />
      case 'memo': return <StickyNote size={20} />
      case 'image': return <Image size={20} />
      case 'video': return <Video size={20} />
      case 'url': return <Link size={20} />
      default: return <FileText size={20} />
    }
  }

  const getTypeColor = () => {
    switch (item.type) {
      case 'document': return '#3B82F6'
      case 'memo': return '#F59E0B'
      case 'image': return '#10B981'
      case 'video': return '#EF4444'
      case 'url': return '#8B5CF6'
      default: return '#6B7280'
    }
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)'
        }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: getTypeColor() + '20' }}
        >
          <div style={{ color: getTypeColor() }}>
            {getItemIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate mb-1" style={{ color: 'var(--text-primary)' }}>
            {item.name}
          </h4>
          <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
            {item.content.substring(0, 100)}
          </p>
        </div>
        
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="p-4 rounded-xl transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)'
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: getTypeColor() + '20' }}
      >
        <div style={{ color: getTypeColor() }}>
          {getItemIcon()}
        </div>
      </div>
      
      <h4 className="font-medium mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
        {item.name}
      </h4>
      
      <p className="text-sm line-clamp-3 mb-3" style={{ color: 'var(--text-secondary)' }}>
        {item.content}
      </p>
      
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span className="px-2 py-1 rounded-full" style={{ backgroundColor: getTypeColor() + '20', color: getTypeColor() }}>
          {item.type}
        </span>
        <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  )
}

// 유틸리티 함수들

function addToParentFolder(folders: FolderItem[], parentId: string, newItem: FolderItem | StorageItem): FolderItem[] {
  return folders.map(folder => {
    if (folder.id === parentId) {
      return {
        ...folder,
        children: [...folder.children, newItem],
        updatedAt: new Date().toISOString()
      }
    }
    
    return {
      ...folder,
      children: folder.children.map(child =>
        child.type === 'folder' 
          ? addToParentFolder([child as FolderItem], parentId, newItem)[0]
          : child
      )
    }
  })
}

function updateFolderInTree(folders: FolderItem[], folderId: string, updates: Partial<FolderItem>): FolderItem[] {
  return folders.map(folder => {
    if (folder.id === folderId) {
      return { ...folder, ...updates }
    }
    
    return {
      ...folder,
      children: folder.children.map(child =>
        child.type === 'folder'
          ? updateFolderInTree([child as FolderItem], folderId, updates)[0]
          : child
      )
    }
  })
}

function removeFolderFromTree(folders: FolderItem[], folderId: string): FolderItem[] {
  return folders
    .filter(folder => folder.id !== folderId)
    .map(folder => ({
      ...folder,
      children: folder.children
        .filter(child => child.id !== folderId)
        .map(child =>
          child.type === 'folder'
            ? removeFolderFromTree([child as FolderItem], folderId)[0]
            : child
        )
    }))
}

function addItemToFolder(folders: FolderItem[], folderId: string, newItem: StorageItem): FolderItem[] {
  return folders.map(folder => {
    if (folder.id === folderId) {
      return {
        ...folder,
        children: [...folder.children, newItem],
        updatedAt: new Date().toISOString()
      }
    }
    
    return {
      ...folder,
      children: folder.children.map(child =>
        child.type === 'folder'
          ? addItemToFolder([child as FolderItem], folderId, newItem)[0]
          : child
      )
    }
  })
}