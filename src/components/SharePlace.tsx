'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Heart,
  ExternalLink
} from 'lucide-react'
import { SharedFolder, ShareCategory, categoryMetadata, createDummySharedFolders } from '@/types/share'

interface SharePlaceProps {
  onBack: () => void
  onImportFolder?: (folder: SharedFolder) => void
  initialSearchQuery?: string
}

export default function SharePlace({ searchQuery = '' }: { searchQuery?: string }) {
  const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>([])
  const [filteredFolders, setFilteredFolders] = useState<SharedFolder[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

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
          author: 'TravelExpert',
          category: 'travel',
          likes: 125,
          createdAt: '2024-01-15T10:00:00Z',
          tags: ['seoul', 'korea', 'travel', 'guide'],
          folder: createFolder('Seoul Travel Guide', undefined, {
            name: 'Seoul Travel Guide',
            items: [
              { name: 'Best Korean BBQ Places', type: 'url', content: 'https://example.com/bbq-places' },
              { name: 'Hidden Cafes in Hongdae', type: 'memo', content: 'List of cozy cafes...' },
              { name: 'Subway Map & Tips', type: 'document', content: 'Navigation guide...' }
            ]
          })
        },
        {
          id: '2',
          title: 'Minimalist Morning Routine',
          description: 'Simple and effective morning routine for productivity and wellness',
          author: 'LifestyleMaven',
          category: 'lifestyle',
          likes: 89,
          createdAt: '2024-01-10T08:00:00Z',
          tags: ['morning', 'routine', 'minimalist', 'productivity'],
          folder: createFolder('Morning Routine', undefined, {
            name: 'Morning Routine',
            items: [
              { name: '5 AM Morning Schedule', type: 'document', content: 'Daily schedule...' },
              { name: 'Meditation Apps', type: 'url', content: 'https://example.com/meditation' }
            ]
          })
        },
        {
          id: '3',
          title: 'Korean Recipes Collection',
          description: 'Authentic Korean recipes from traditional to modern fusion dishes',
          author: 'ChefKim',
          category: 'food',
          likes: 203,
          createdAt: '2024-01-08T14:00:00Z',
          tags: ['korean', 'recipes', 'cooking', 'food'],
          folder: createFolder('Korean Recipes', undefined, {
            name: 'Korean Recipes',
            items: [
              { name: 'Kimchi Recipe', type: 'document', content: 'Traditional kimchi...' },
              { name: 'Bulgogi Recipe', type: 'document', content: 'Marinated beef...' }
            ]
          })
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
    if (confirm(`"${sharedFolder.title}" 폴더를 내 워크스페이스에 추가하시겠습니까?`)) {
      // 실제로는 props로 받은 onImportFolder 호출
      console.log('Importing folder:', sharedFolder.title)
      alert(`"${sharedFolder.title}" 폴더가 My Folder에 추가되었습니다!`)
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
    <div className="h-full">
      {/* Category Filter */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
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

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          {filteredFolders.length} {filteredFolders.length === 1 ? 'folder' : 'folders'} found
        </p>
      </div>

      {/* Market Place Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFolders.map((sharedFolder) => (
          <motion.div
            key={sharedFolder.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Category Badge */}
            <div className="mb-3">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded uppercase tracking-wide">
                {categories.find(cat => cat.value === sharedFolder.category)?.label || sharedFolder.category}
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">
              {sharedFolder.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {sharedFolder.description}
            </p>

            {/* Tags */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {sharedFolder.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {sharedFolder.tags.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs text-gray-400">
                    +{sharedFolder.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Author & Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>by {sharedFolder.author}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {sharedFolder.likes}
                </span>
                <span>
                  {new Date(sharedFolder.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleImportFolder(sharedFolder)}
                className="flex-1 px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
              >
                Add to My Folder
              </button>
              <button className="px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded hover:bg-gray-50 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFolders.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No folders found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Try adjusting your search terms or category filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}