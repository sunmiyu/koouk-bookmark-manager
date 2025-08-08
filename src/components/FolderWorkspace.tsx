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
  Trash2,
  Plus
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
    
    // 빈 상태로 초기화
    setFolders([])
    setSelectedFolderId(undefined)
    setExpandedFolders(new Set())
    
    // 검색 엔진도 클리어
    searchEngine.indexFolders([])
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
      {/* Vercel 스타일 컨테이너로 센터링 */}
      <div className="vercel-container">
        <div className="flex h-full max-w-none">
          {/* Vercel 스타일 사이드바 */}
          <div className="w-72 border-r border-gray-100 bg-white">
            {/* 헤더 영역 */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">My Workspace</h2>
                <button 
                  onClick={() => handleCreateFolder()}
                  className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
                  title="새 폴더 만들기"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <button
                onClick={handleClearAll}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 
                           text-sm font-medium text-gray-700 hover:text-gray-900 
                           hover:bg-gray-50 rounded-lg transition-all duration-150
                           border border-gray-200 hover:border-gray-300 hover:shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>

            {/* 폴더 트리 영역 */}
            <div className="px-4 py-2">
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
  
  // 아이템을 타입별로 그룹화 (영상 > 이미지 > 링크 > 문서 > 메모 순서)
  const typeOrder = { video: 0, image: 1, url: 2, document: 3, memo: 4 }
  
  const groupedItems = filteredItems.reduce((groups, item) => {
    const type = item.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(item)
    return groups
  }, {} as Record<string, StorageItem[]>)
  
  // 각 그룹 내에서 정렬
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
          return 0 // 이미 타입별로 그룹화되어 있음
        default:
          return 0
      }
    })
    result[type] = items
    return result
  }, {} as Record<string, StorageItem[]>)

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

      {/* Content by type groups */}
      {viewMode === 'grid' ? (
        <div className="space-y-8">
          {Object.entries(sortedGroups).map(([type, items]) => (
            <div key={type} className="">
              {/* Type header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                  {type === 'video' && <Video className="w-5 h-5 text-red-500" />}
                  {type === 'image' && <ImageIcon className="w-5 h-5 text-green-500" />}
                  {type === 'url' && <Link className="w-5 h-5 text-blue-500" />}
                  {type === 'document' && <FileText className="w-5 h-5 text-blue-600" />}
                  {type === 'memo' && <StickyNote className="w-5 h-5 text-yellow-500" />}
                  <h4 className="font-medium text-gray-900 capitalize">
                    {type === 'url' ? 'Links' : type === 'document' ? 'Documents' : type === 'memo' ? 'Memos' : type === 'image' ? 'Images' : 'Videos'}
                  </h4>
                  <span className="text-sm text-gray-500">({items.length})</span>
                </div>
              </div>
              
              {/* Horizontal scrollable items */}
              <div className="overflow-x-auto">
                <div className="flex gap-4 pb-2" style={{ minWidth: 'fit-content' }}>
                  {items.map((item) => (
                    <div key={item.id} className="flex-shrink-0 w-64">
                      <ItemCard item={item} viewMode={viewMode} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(sortedGroups).flatMap(([type, items]) => 
            items.map((item) => (
              <ItemCard key={item.id} item={item} viewMode={viewMode} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// 아이템 카드 컴포넌트 - 타입별 특화 카드
const ItemCard = ({ item, viewMode }: { item: StorageItem; viewMode: 'grid' | 'list' }) => {
  // YouTube 썸네일 추출
  const getYouTubeThumbnail = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
    }
    return null
  }

  // 링크에서 도메인 추출
  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  // 타입별 카드 렌더링
  const renderVideoCard = () => {
    const thumbnail = getYouTubeThumbnail(item.content) || item.metadata?.thumbnail
    return (
      <motion.div
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* 영상 썸네일 */}
        <div className="relative bg-gray-900 aspect-video">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            <Video className="w-3 h-3 inline mr-1" />
            Video
          </div>
        </div>
        
        {/* 콘텐츠 */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {item.name}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {getDomain(item.content)}
          </p>
          <div className="text-xs text-gray-400">
            {new Date(item.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderImageCard = () => {
    return (
      <motion.div
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* 이미지 썸네일 */}
        <div className="relative bg-gray-100 aspect-square">
          {item.content.startsWith('http') || item.content.startsWith('/') ? (
            <img 
              src={item.content} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            <ImageIcon className="w-3 h-3 inline mr-1" />
            Image
          </div>
        </div>
        
        {/* 콘텐츠 */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {item.name}
          </h4>
          <div className="text-xs text-gray-400">
            {new Date(item.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderLinkCard = () => {
    return (
      <motion.div
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* 링크 썸네일 (임시로 파비콘 사용) */}
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 aspect-video flex items-center justify-center">
          <div className="text-center">
            <Link className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-700">
              {getDomain(item.content)}
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-blue-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
            <Link className="w-3 h-3 inline mr-1" />
            Link
          </div>
        </div>
        
        {/* 콘텐츠 */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {item.name}
          </h4>
          <p className="text-sm text-blue-600 hover:text-blue-800 truncate mb-2">
            {item.content}
          </p>
          <div className="text-xs text-gray-400">
            {new Date(item.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderMemoCard = () => {
    return (
      <motion.div
        className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* 메모 헤더 */}
        <div className="bg-yellow-400 bg-opacity-20 p-3 border-b border-yellow-200">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Memo</span>
          </div>
        </div>
        
        {/* 메모 내용 */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 line-clamp-1 mb-3">
            {item.name}
          </h4>
          <div className="text-sm text-gray-700 line-clamp-4 whitespace-pre-wrap mb-3">
            {item.content}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(item.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderDocumentCard = () => {
    const wordCount = item.content.split(' ').length
    return (
      <motion.div
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* 문서 헤더 */}
        <div className="bg-blue-50 p-3 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Document</span>
            </div>
            <span className="text-xs text-blue-600">{wordCount} words</span>
          </div>
        </div>
        
        {/* 문서 내용 */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 line-clamp-2 mb-3">
            {item.name}
          </h4>
          <div className="text-sm text-gray-600 line-clamp-4 mb-3">
            {item.content}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(item.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    )
  }

  // List 모드일 때는 간단한 형식
  if (viewMode === 'list') {
    return (
      <motion.div
        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 cursor-pointer bg-white"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50">
          {item.type === 'video' && <Video className="w-5 h-5 text-red-500" />}
          {item.type === 'image' && <ImageIcon className="w-5 h-5 text-green-500" />}
          {item.type === 'url' && <Link className="w-5 h-5 text-blue-500" />}
          {item.type === 'memo' && <StickyNote className="w-5 h-5 text-yellow-500" />}
          {item.type === 'document' && <FileText className="w-5 h-5 text-blue-600" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate mb-1 text-gray-900">
            {item.name}
          </h4>
          <p className="text-sm text-gray-600 truncate">
            {item.content.substring(0, 100)}
          </p>
        </div>
        
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs">
            {item.type}
          </span>
          <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
        </div>
      </motion.div>
    )
  }

  // Grid 모드에서 타입별 카드 렌더링
  switch (item.type) {
    case 'video':
      return renderVideoCard()
    case 'image':
      return renderImageCard()
    case 'url':
      return renderLinkCard()
    case 'memo':
      return renderMemoCard()
    case 'document':
      return renderDocumentCard()
    default:
      return renderDocumentCard()
  }
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