'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Heart,
  ChevronDown
} from 'lucide-react'
import { SharedFolder } from '@/types/share'
import { createFolder } from '@/types/folder'

// Removed unused interface MarketPlaceProps

export default function MarketPlace({ searchQuery = '' }: { searchQuery?: string }) {
  const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>([])
  const [filteredFolders, setFilteredFolders] = useState<SharedFolder[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // 카테고리 옵션들
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'food', label: 'Food & Recipe' },
    { value: 'travel', label: 'Travel' },
    { value: 'study', label: 'Study & Learning' },
    { value: 'work', label: 'Work & Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'tech', label: 'Technology' },
    { value: 'investment', label: 'Investment' },
    { value: 'parenting', label: 'Parenting' }
  ]

  // Mock 데이터 로드
  useEffect(() => {
    const loadMockData = async () => {
      setIsLoading(true)
      
      // Mock shared folders data
      const mockSharedFolders: SharedFolder[] = [
        {
          id: '1',
          title: 'Seoul Travel Guide',
          description: 'Complete guide for visiting Seoul with hidden gems and local recommendations',
          author: { id: 'user1', name: 'TravelExpert', avatar: '🌏', verified: true },
          category: 'travel',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          isPublic: true,
          tags: ['seoul', 'korea', 'travel', 'guide'],
          coverImage: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1545569341-9eb8b30979d9%3Fixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D&type=sc960_832',
          stats: {
            views: 1250,
            likes: 125,
            helpful: 89,
            notHelpful: 3,
            shares: 45,
            downloads: 234
          },
          folder: createFolder('Seoul Travel Guide')
        },
        {
          id: '2',
          title: 'Minimalist Morning Routine',
          description: 'Simple and effective morning routine for productivity and wellness',
          author: { id: 'user2', name: 'LifestyleMaven', avatar: '✨', verified: false },
          category: 'lifestyle',
          createdAt: '2024-01-10T08:00:00Z',
          updatedAt: '2024-01-10T08:00:00Z',
          isPublic: true,
          tags: ['morning', 'routine', 'minimalist', 'productivity'],
          coverImage: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1506905925346-21bda4d32df4%3Fixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D&type=sc960_832',
          stats: {
            views: 650,
            likes: 89,
            helpful: 67,
            notHelpful: 2,
            shares: 34,
            downloads: 156
          },
          folder: createFolder('Morning Routine')
        },
        {
          id: '3',
          title: 'Korean Recipes Collection',
          description: 'Authentic Korean recipes from traditional to modern fusion dishes',
          author: { id: 'user3', name: 'ChefKim', avatar: '👨‍🍳', verified: true },
          category: 'food',
          createdAt: '2024-01-08T14:00:00Z',
          updatedAt: '2024-01-08T14:00:00Z',
          isPublic: true,
          tags: ['korean', 'recipes', 'cooking', 'food'],
          stats: {
            views: 1834,
            likes: 203,
            helpful: 189,
            notHelpful: 5,
            shares: 98,
            downloads: 445
          },
          folder: createFolder('Korean Recipes')
        }
      ]

      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate loading
      setSharedFolders(mockSharedFolders)
      setIsLoading(false)
    }

    loadMockData()
  }, [])

  // 검색 및 필터링
  useEffect(() => {
    let filtered = sharedFolders

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(folder => folder.category === selectedCategory)
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(folder =>
        folder.title.toLowerCase().includes(query) ||
        folder.description.toLowerCase().includes(query) ||
        folder.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredFolders(filtered)
  }, [sharedFolders, selectedCategory, searchQuery])

  const handleImportFolder = (sharedFolder: SharedFolder) => {
    if (confirm(`&quot;${sharedFolder.title}&quot; 폴더를 내 워크스페이스에 추가하시겠습니까?`)) {
      // 실제로는 props로 받은 onImportFolder 호출
      console.log('Importing folder:', sharedFolder.title)
      alert(`&quot;${sharedFolder.title}&quot; 폴더가 My Folder에 추가되었습니다!`)
    }
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Market Place 로딩중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 px-2 py-3 sm:px-4 lg:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-medium text-black">
            {filteredFolders.length} folders
          </h3>
          <p className="text-xs text-gray-500">
            {selectedCategory === 'all' ? 'All Categories' : categories.find(cat => cat.value === selectedCategory)?.label}
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 pb-3 border-b border-gray-200">
        {/* 모바일: 드롭다운 */}
        <div className="block sm:hidden relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span>{categories.find(cat => cat.value === selectedCategory)?.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showCategoryDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
            >
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category.value)
                    setShowCategoryDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    selectedCategory === category.value 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'text-gray-700'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* 데스크톱: 기존 버튼 그룹 */}
        <div className="hidden sm:flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === category.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Market Place Cards - 모바일/데스크톱 통일된 그리드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFolders.map((sharedFolder) => (
          <motion.button
            key={sharedFolder.id}
            onClick={() => handleImportFolder(sharedFolder)}
            className="w-full border border-gray-200 rounded-lg p-0 hover:shadow-md overflow-hidden group transition-all bg-white"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* 통일된 카드 레이아웃 (모바일/데스크톱 공통) */}
            <div className="block">
              {/* 커버 이미지 - 더 컴팩트한 비율 */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] overflow-hidden">
                {sharedFolder.coverImage ? (
                  <img 
                    src={sharedFolder.coverImage}
                    alt={sharedFolder.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-500 shadow-sm">
                      <Heart className="w-6 h-6" />
                    </div>
                  </div>
                )}
                
                {/* Category badge - 모바일에서 더 작게 */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                  {categories.find(cat => cat.value === sharedFolder.category)?.label || sharedFolder.category}
                </div>

                {/* Add 버튼 - 모바일에서 더 작게 */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleImportFolder(sharedFolder)
                    }}
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-black transition-all shadow-sm group/btn"
                    title="Add to My Folders"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    
                    {/* Tooltip - 데스크톱에서만 표시 */}
                    <div className="hidden sm:block absolute -bottom-8 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                      Add to My Folders
                    </div>
                  </button>
                </div>
              </div>

              {/* 정보 영역 - 모바일에서 더 컴팩트하게 */}
              <div className="p-2 sm:p-3">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-1.5 leading-tight line-clamp-1">
                  📁 {sharedFolder.title}
                </h3>
                <p className="text-xs text-gray-600 mb-1.5 sm:mb-2 leading-relaxed line-clamp-1 sm:line-clamp-2">
                  {sharedFolder.description}
                </p>
                
                {/* 메타데이터 - 모바일에서 더 간소화 */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 mb-1 sm:mb-2">
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <Heart className="w-3 h-3" />
                    {sharedFolder.stats.likes}
                  </span>
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    📥 {sharedFolder.stats.downloads}
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    📁 {sharedFolder.folder.children.length}개 항목
                  </span>
                </div>

                {/* 하단: 공유자 + 날짜 - 모바일에서 더 간소화 */}
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <span className="text-xs text-gray-500 truncate">
                    by @{sharedFolder.author.name} {sharedFolder.author.verified && '✓'}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {new Date(sharedFolder.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                {/* 태그들 - 모바일에서 더 작게, 개수 제한 */}
                <div className="flex flex-wrap gap-1">
                  {sharedFolder.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hidden sm:inline">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Empty State */}
      {filteredFolders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No folders found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your category filter to find what you&apos;re looking for.
          </p>
        </div>
      )}
    </div>
  )
}