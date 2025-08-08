'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Trash2
} from 'lucide-react'
import WorkspaceLayout from './WorkspaceLayout'
import SharePlace from './SharePlace'
import UniversalInputBar from './UniversalInputBar'
import FolderTree from './FolderTree'
import { DragDropProvider } from '@/contexts/DragDropContext'
import { FolderItem, StorageItem, createFolder, createStorageItem, defaultFolderTemplates, createDummyFolders } from '@/types/folder'
import { SharedFolder } from '@/types/share'
import { searchEngine } from '@/lib/search-engine'

// interface FolderWorkspaceProps {
//   className?: string
// }

export default function FolderWorkspace({ searchQuery = '' }: { searchQuery?: string }) {
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
          // 첫 방문 시 더미 데이터 생성
          const initialFolders = createDummyFolders()
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
    
    // 검색 엔진 인덱스 업데이트
    searchEngine.indexFolders(newFolders)
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

  const handleClearAll = () => {
    if (!confirm('모든 폴더와 내용을 삭제하고 새로 시작하시겠습니까?')) {
      return
    }
    
    // localStorage 클리어
    localStorage.removeItem('koouk-folders')
    localStorage.removeItem('koouk-selected-folder')
    localStorage.removeItem('koouk-expanded-folders')
    
    // 더미 데이터로 재설정
    const initialFolders = createDummyFolders()
    setFolders(initialFolders)
    setSelectedFolderId(initialFolders[0].id)
    setExpandedFolders(new Set())
  }

  const handleShareFolder = (folderId: string) => {
    const folderToShare = findFolderById(folders, folderId)
    if (!folderToShare) return

    const title = prompt('공유할 폴더의 제목을 입력하세요:', folderToShare.name)
    if (!title?.trim()) return

    const description = prompt('폴더에 대한 설명을 입력하세요:', '')
    if (description === null) return

    const category = prompt('카테고리를 선택하세요 (lifestyle, food, travel, study, parenting, investment, work, entertainment, health, tech):', 'lifestyle')
    if (!category) return

    // Share Place에 공유 성공 알림
    alert(`"${title}" 폴더가 Market Place에 공유되었습니다! 🎉\n다른 사용자들이 이제 이 폴더를 발견하고 활용할 수 있습니다.`)
  }

  const handleAddItem = (item: StorageItem, folderId: string) => {
    const updatedFolders = addItemToFolder(folders, folderId, item)
    handleFoldersChange(updatedFolders)
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
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">워크스페이스 로딩중...</p>
        </div>
      </div>
    )
  }

  return (
    <DragDropProvider 
      initialFolders={folders}
      onFoldersChange={handleFoldersChange}
    >
      <div className="flex h-full">
        {/* Left Sidebar - Folder Tree */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors border border-red-200 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            expandedFolders={expandedFolders}
            onFolderSelect={handleFolderSelect}
            onFolderToggle={handleFolderToggle}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onShareFolder={handleShareFolder}
            onCreateItem={handleCreateItem}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white">
          <FolderContent 
            items={getSelectedFolderItems()}
            onCreateItem={(type) => selectedFolderId && handleCreateItem(type, selectedFolderId)}
            searchQuery={searchQuery}
          />
        </div>
      </div>
      
      {/* Universal Input Bar */}
      <UniversalInputBar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onAddItem={handleAddItem}
        onFolderSelect={handleFolderSelect}
      />
    </DragDropProvider>
  )
}

// 폴더 콘텐츠 컴포넌트
const FolderContent = ({ 
  items, 
  onCreateItem,
  isFullWidth = false,
  searchQuery = ''
}: { 
  items: StorageItem[]
  onCreateItem: (type: StorageItem['type']) => void
  isFullWidth?: boolean
  searchQuery?: string
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name' | 'type'>('recent')
  
  // 검색 필터링
  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    )
  })
  
  // 아이템 정렬
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'oldest':
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      case 'name':
        return a.name.localeCompare(b.name, 'ko')
      case 'type':
        // 타입 우선순위: document > memo > url > video > image
        const typeOrder = { document: 0, memo: 1, url: 2, video: 3, image: 4 }
        const orderA = typeOrder[a.type] ?? 5
        const orderB = typeOrder[b.type] ?? 5
        return orderA - orderB || a.name.localeCompare(b.name, 'ko')
      default:
        return 0
    }
  })

  const getSortLabel = () => {
    switch (sortBy) {
      case 'recent': return '최근 수정된 순'
      case 'oldest': return '오래된 순'
      case 'name': return '이름순'
      case 'type': return '타입별'
      default: return '최근 수정된 순'
    }
  }

  if (items.length === 0) {
    return (
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center text-center p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Empty Folder</h3>
        <p className="text-gray-500 mb-6 max-w-sm">
          This folder is empty. Add some content to get started.
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {(['memo', 'document', 'url', 'image', 'video'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onCreateItem(type)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              {type === 'memo' && <StickyNote className="w-4 h-4" />}
              {type === 'document' && <FileText className="w-4 h-4" />}
              {type === 'url' && <Link className="w-4 h-4" />}
              {type === 'image' && <ImageIcon className="w-4 h-4" />}
              {type === 'video' && <Video className="w-4 h-4" />}
              Add {type}
            </button>
          ))}
        </div>
      </motion.div>
    )
  }

  if (searchQuery.trim() && filteredItems.length === 0) {
    return (
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
    )
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-black">
            {filteredItems.length} items
          </h3>
          <p className="text-sm text-gray-500">
            {getSortLabel()}
          </p>
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

      {/* Content grid/list */}
      <div className={
        viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          : "space-y-3"
      }>
        {sortedItems.map((item) => (
          <ItemCard key={item.id} item={item} viewMode={viewMode} />
        ))}
      </div>
    </div>
  )
}

// 아이템 카드 컴포넌트
const ItemCard = ({ item, viewMode }: { item: StorageItem; viewMode: 'grid' | 'list' }) => {
  const getItemIcon = () => {
    switch (item.type) {
      case 'document': return <FileText size={20} />
      case 'memo': return <StickyNote size={20} />
      case 'image': return <ImageIcon size={20} />
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
        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 cursor-pointer bg-white"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
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
          <h4 className="font-medium truncate mb-1 text-gray-900">
            {item.name}
          </h4>
          <p className="text-sm text-gray-600 truncate">
            {item.content.substring(0, 100)}
          </p>
        </div>
        
        <div className="text-xs text-gray-500">
          {new Date(item.updatedAt).toLocaleDateString()}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 cursor-pointer bg-white"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-3">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: getTypeColor() + '20' }}
        >
          <div style={{ color: getTypeColor() }}>
            {getItemIcon()}
          </div>
        </div>
      </div>
      
      <h4 className="font-medium mb-2 line-clamp-2 text-gray-900">
        {item.name}
      </h4>
      
      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
        {item.content}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: getTypeColor() + '20', color: getTypeColor() }}
        >
          {item.type}
        </span>
        <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  )
}

// 유틸리티 함수들

function findFolderById(folders: FolderItem[], folderId: string): FolderItem | null {
  for (const folder of folders) {
    if (folder.id === folderId) {
      return folder
    }
    
    const childFolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
    const found = findFolderById(childFolders, folderId)
    if (found) return found
  }
  return null
}

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