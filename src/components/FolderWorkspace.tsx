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
  Plus,
  Menu
} from 'lucide-react'
import FolderTree from './FolderTree'
import { DragDropProvider } from '@/contexts/DragDropContext'
import { FolderItem, StorageItem, createFolder, createStorageItem, defaultFolderTemplates, createDummyFolders } from '@/types/folder'
import { searchEngine } from '@/lib/search-engine'

export default function FolderWorkspace({ searchQuery = '' }: { searchQuery?: string }) {
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarVisible, setSidebarVisible] = useState(true)

  // localStorage에서 데이터 로드 - 클라이언트 사이드에서만 실행
  useEffect(() => {
    // 브라우저 환경 체크
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

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

    // 약간의 지연을 두고 로드 (hydration 이슈 방지)
    const timer = setTimeout(() => {
      loadData()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // 데이터 저장 - 브라우저 환경 체크 추가
  const saveToStorage = (newFolders: FolderItem[], newSelectedId?: string) => {
    if (typeof window === 'undefined') return
    
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
    
    if (typeof window !== 'undefined') {
      // localStorage 클리어
      localStorage.removeItem('koouk-folders')
      localStorage.removeItem('koouk-selected-folder')
      localStorage.removeItem('koouk-expanded-folders')
    }
    
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
      {/* 모바일 반응형 컨테이너 */}
      <div className="flex h-full relative">
        {/* 모바일 메뉴 토글 버튼 */}
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="fixed top-20 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* 사이드바 */}
        <div className={`
          ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
          fixed lg:relative lg:translate-x-0
          w-72 h-full border-r border-gray-100 bg-white
          transition-transform duration-300 ease-in-out
          z-40 lg:z-auto
        `}>
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
          <div className="px-4 py-2 overflow-y-auto h-[calc(100%-140px)]">
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

        {/* 모바일 오버레이 */}
        {sidebarVisible && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarVisible(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 bg-white overflow-y-auto">
          <FolderContent 
            items={getSelectedFolderItems()}
            onCreateItem={(type) => selectedFolderId && handleCreateItem(type, selectedFolderId)}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </DragDropProvider>
  )
}

// 폴더 콘텐츠 컴포넌트
const FolderContent = ({ 
  items, 
  onCreateItem,
  searchQuery = ''
}: { 
  items: StorageItem[]
  onCreateItem: (type: StorageItem['type']) => void
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
        className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[400px]"
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
        className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[400px]"
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
    <div className="flex-1 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
              
              {/* Grid layout - Mobile 2 cols, Desktop up to 6 cols */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {items.slice(0, 12).map((item) => (
                  <ItemCard key={item.id} item={item} viewMode={viewMode} />
                ))}
              </div>
              
              {/* Show more button */}
              {items.length > 12 && (
                <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <span>더보기 ({items.length - 12}개)</span>
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(sortedGroups).flatMap(([, items]) => 
            items.map((item) => (
              <ItemCard key={item.id} item={item} viewMode={viewMode} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// 아이템 카드 컴포넌트
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

  // Grid 모드 - 통합 카드 디자인
  if (viewMode === 'grid') {
    const getThumbnail = () => {
      if (item.type === 'video') {
        if (item.metadata?.thumbnail) return item.metadata.thumbnail
        return getYouTubeThumbnail(item.content)
      }
      if (item.type === 'image') {
        return item.content
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
        className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Preview area - 4:1 비율 (이미지 영역 유지, 하단만 최소화) */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] overflow-hidden">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          
          {/* Fallback or no thumbnail */}
          <div 
            className="w-full h-full absolute inset-0 flex items-center justify-center" 
            style={{ display: thumbnail ? 'none' : 'flex' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-500 shadow-sm group-hover:scale-110 transition-all duration-300">
              {getTypeIcon()}
            </div>
          </div>
          
          {/* Type badge - 세련된 디자인 */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-[10px] font-semibold shadow-sm border border-white/20">
            <span className="capitalize">
              {item.type === 'url' ? 'Link' : item.type}
            </span>
          </div>

          {/* Duration for videos - 개선된 스타일 */}
          {item.type === 'video' && item.metadata?.duration && (
            <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-medium">
              {Math.floor(item.metadata.duration / 60)}:{(item.metadata.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        
        {/* Content - 극도로 압축된 하단 (1의 비율) */}
        <div className="px-3 py-1.5 bg-white border-t border-gray-50">
          <h4 className="font-medium text-gray-800 truncate text-xs leading-none tracking-tight">
            {item.name}
          </h4>
        </div>
      </motion.div>
    )
  }

  // List 모드
  return (
    <div className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-all cursor-pointer">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
          {item.type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
          {item.type === 'image' && <ImageIcon className="w-4 h-4 text-green-600" />}
          {item.type === 'url' && <Link className="w-4 h-4 text-purple-600" />}
          {item.type === 'document' && <FileText className="w-4 h-4 text-orange-600" />}
          {item.type === 'memo' && <StickyNote className="w-4 h-4 text-yellow-600" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate text-sm">
          {item.name}
        </h4>
        <p className="text-xs text-gray-500 truncate">
          {item.type === 'url' ? getDomain(item.content) : 
           item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content}
        </p>
      </div>
      <div className="text-xs text-gray-400">
        {new Date(item.updatedAt).toLocaleDateString('ko-KR')}
      </div>
    </div>
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