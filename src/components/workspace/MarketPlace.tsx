'use client'

import { useState, useEffect } from 'react'
import { SharedFolder } from '@/types/share'
import { createFolder } from '@/types/folder'
import { useToast } from '@/hooks/useToast'
import Toast from '../ui/Toast'
import CategoryFilter from '../ui/CategoryFilter'
import SortOptions from '../ui/SortOptions'
import SharedFolderCard from '../ui/SharedFolderCard'
import EditSharedFolderModal from '../ui/EditSharedFolderModal'

// Removed unused interface MarketPlaceProps

interface MarketPlaceProps {
  searchQuery?: string
  onImportFolder?: (sharedFolder: SharedFolder) => void
}

export default function MarketPlace({ searchQuery = '', onImportFolder }: MarketPlaceProps) {
  const { toast, showSuccess, hideToast } = useToast()
  const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>([])
  const [filteredFolders, setFilteredFolders] = useState<SharedFolder[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'popular' | 'recent' | 'helpful'>('popular')
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'marketplace' | 'my-shared'>('marketplace')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<SharedFolder | null>(null)

  // 카테고리 옵션들
  const categories = [
    { value: 'all', label: 'All Categories', emoji: '📂' },
    { value: 'tech', label: 'Technology', emoji: '💻' },
    { value: 'lifestyle', label: 'Lifestyle', emoji: '✨' },
    { value: 'food', label: 'Food & Recipe', emoji: '🍳' },
    { value: 'travel', label: 'Travel', emoji: '🌍' },
    { value: 'study', label: 'Study & Learning', emoji: '📚' },
    { value: 'work', label: 'Work & Business', emoji: '💼' },
    { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
    { value: 'health', label: 'Health & Fitness', emoji: '💪' },
    { value: 'investment', label: 'Investment', emoji: '📈' },
    { value: 'parenting', label: 'Parenting', emoji: '👶' }
  ]

  // Sort options
  const sortOptions = [
    { value: 'popular', label: 'Popular', description: 'Likes + Downloads' },
    { value: 'recent', label: 'Recent', description: 'Recently uploaded' },
    { value: 'helpful', label: 'Helpful', description: 'Helpful rating' }
  ]

  // Load data (mock + user shared)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Load user shared folders from localStorage
      let userSharedFolders: SharedFolder[] = []
      try {
        const existingShared = localStorage.getItem('koouk-shared-folders')
        if (existingShared) {
          userSharedFolders = JSON.parse(existingShared)
        }
      } catch (error) {
        console.error('Failed to load user shared folders:', error)
      }
      
      // Mock shared folders data (확장된 데이터)
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
          title: 'React 개발자 필수 가이드',
          description: 'React 18+ 최신 기능부터 실전 프로젝트까지 완벽 가이드',
          author: { id: 'user2', name: 'ReactDev', avatar: '⚛️', verified: true },
          category: 'tech',
          createdAt: '2024-01-20T08:00:00Z',
          updatedAt: '2024-01-20T08:00:00Z',
          isPublic: true,
          tags: ['react', 'javascript', 'development', 'frontend'],
          coverImage: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1633356122544-f134324a6cee%3Fixlib%3Drb-4.0.3&type=sc960_832',
          stats: {
            views: 2840,
            likes: 312,
            helpful: 289,
            notHelpful: 8,
            shares: 156,
            downloads: 567
          },
          folder: createFolder('React Guide')
        },
        {
          id: '3',
          title: 'Minimalist Morning Routine',
          description: 'Simple and effective morning routine for productivity and wellness',
          author: { id: 'user3', name: 'LifestyleMaven', avatar: '✨', verified: false },
          category: 'lifestyle',
          createdAt: '2024-01-10T08:00:00Z',
          updatedAt: '2024-01-10T08:00:00Z',
          isPublic: true,
          tags: ['morning', 'routine', 'minimalist', 'productivity'],
          coverImage: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1506905925346-21bda4d32df4%3Fixlib%3Drb-4.0.3&type=sc960_832',
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
          id: '4',
          title: 'Korean Recipes Collection',
          description: 'Authentic Korean recipes from traditional to modern fusion dishes',
          author: { id: 'user4', name: 'ChefKim', avatar: '👨‍🍳', verified: true },
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
        },
        {
          id: '5',
          title: 'UI/UX 디자인 시스템',
          description: '일관성 있는 디자인 시스템 구축을 위한 완벽 가이드',
          author: { id: 'user5', name: 'DesignPro', avatar: '🎨', verified: true },
          category: 'tech',
          createdAt: '2024-01-22T09:00:00Z',
          updatedAt: '2024-01-22T09:00:00Z',
          isPublic: true,
          tags: ['design', 'ui', 'ux', 'system'],
          stats: {
            views: 1456,
            likes: 178,
            helpful: 165,
            notHelpful: 4,
            shares: 87,
            downloads: 298
          },
          folder: createFolder('Design System')
        },
        {
          id: '6',
          title: '투자 초보자 가이드',
          description: '안전하고 효율적인 투자를 위한 기초 지식과 실전 전략',
          author: { id: 'user6', name: 'InvestorK', avatar: '📊', verified: false },
          category: 'investment',
          createdAt: '2024-01-18T16:00:00Z',
          updatedAt: '2024-01-18T16:00:00Z',
          isPublic: true,
          tags: ['investment', 'finance', 'money', 'stocks'],
          stats: {
            views: 2340,
            likes: 267,
            helpful: 234,
            notHelpful: 12,
            shares: 123,
            downloads: 456
          },
          folder: createFolder('Investment Guide')
        }
      ]

      // Combine user shared folders with mock data (user folders first)
      const allFolders = [...userSharedFolders, ...mockSharedFolders]
      
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate loading
      setSharedFolders(allFolders)
      setIsLoading(false)
    }

    loadData()
  }, [])

  // 검색, 필터링, 정렬
  useEffect(() => {
    let filtered = sharedFolders

    // 뷰 필터 (Market Place vs My Shared)
    if (currentView === 'my-shared') {
      filtered = filtered.filter(folder => folder.author.id === 'current-user')
    } else {
      // Market Place 뷰에서는 다른 사용자의 폴더만 보이도록 (옵션)
      // filtered = filtered.filter(folder => folder.author.id !== 'current-user')
    }

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

    // 정렬 적용
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'popular':
          return (b.stats.likes + b.stats.downloads) - (a.stats.likes + a.stats.downloads)
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'helpful':
          return b.stats.helpful - a.stats.helpful
        default:
          return 0
      }
    })

    setFilteredFolders(filtered)
  }, [sharedFolders, selectedCategory, searchQuery, sortOrder, currentView])

  const handleImportFolder = (sharedFolder: SharedFolder) => {
    if (confirm(`Add "${sharedFolder.title}" to My Folder?`)) {
      if (onImportFolder) {
        onImportFolder(sharedFolder)
        showSuccess(`📁 "${sharedFolder.title}" added to My Folder!`)
      } else {
        // 폴백: onImportFolder가 없을 때
        console.log('Importing folder:', sharedFolder.title)
        showSuccess(`📁 "${sharedFolder.title}" added to My Folder!`)
      }
    }
  }

  const handleEditFolder = (sharedFolder: SharedFolder) => {
    setEditingFolder(sharedFolder)
    setEditModalOpen(true)
  }

  const handleUpdateFolder = (updatedFolder: SharedFolder) => {
    try {
      // Update in state
      const updatedFolders = sharedFolders.map(folder => 
        folder.id === updatedFolder.id ? updatedFolder : folder
      )
      setSharedFolders(updatedFolders)

      // Update in localStorage
      const userSharedFolders = updatedFolders.filter(folder => folder.author.id === 'current-user')
      localStorage.setItem('koouk-shared-folders', JSON.stringify(userSharedFolders))

      showSuccess(`📁 "${updatedFolder.title}" updated successfully!`)
    } catch (error) {
      console.error('Error updating folder:', error)
      alert('Failed to update folder. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          {/* Market Place skeleton loading */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="aspect-[4/3] sm:aspect-[5/4] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
                <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
                    <div className="h-2 sm:h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse mt-2 sm:mt-4"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 px-2 py-3 sm:px-4 lg:p-4">
      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-1 mb-4 border-b border-gray-200">
          <button
            onClick={() => setCurrentView('marketplace')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-150 text-center active:scale-95 select-none ${
              currentView === 'marketplace'
                ? 'bg-white text-gray-900 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            Browse Market Place
          </button>
          <button
            onClick={() => setCurrentView('my-shared')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-150 text-center active:scale-95 select-none ${
              currentView === 'my-shared'
                ? 'bg-white text-gray-900 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            My Shared Folders
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentView === 'marketplace' 
                  ? `${filteredFolders.length} ${filteredFolders.length === 1 ? 'shared folder' : 'shared folders'}`
                  : `${filteredFolders.filter(f => f.author.id === 'current-user').length} folders shared by you`
                }
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentView === 'marketplace' ? 'Browse and discover amazing collections' : 'Manage your shared folders'}
              </p>
            </div>
          </div>
          
          {/* 필터 섹션 - Market Place에서만 표시 */}
          {currentView === 'marketplace' && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* 모바일: 드롭다운들을 한 줄에 50:50 배치 */}
              <div className="flex sm:hidden gap-2">
                <div className="flex-1">
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    showDropdownOnMobile={true}
                  />
                </div>
                <div className="flex-1">
                  <SortOptions
                    options={sortOptions}
                    selectedSort={sortOrder}
                    onSortChange={(sort) => setSortOrder(sort as 'popular' | 'recent' | 'helpful')}
                  />
                </div>
              </div>
              
              {/* PC: 기존 레이아웃 유지 */}
              <div className="hidden sm:flex items-center justify-between w-full">
                <div className="flex-1">
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    showDropdownOnMobile={false}
                  />
                </div>
                <div className="ml-3 flex-shrink-0">
                  <SortOptions
                    options={sortOptions}
                    selectedSort={sortOrder}
                    onSortChange={(sort) => setSortOrder(sort as 'popular' | 'recent' | 'helpful')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 폴더 그리드 */}
      {filteredFolders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📂</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-sm text-gray-500">Try different keywords</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {filteredFolders.map((sharedFolder) => (
            <SharedFolderCard
              key={sharedFolder.id}
              sharedFolder={sharedFolder}
              onImportFolder={currentView === 'marketplace' ? handleImportFolder : undefined}
              onEditFolder={currentView === 'my-shared' ? handleEditFolder : undefined}
              categories={categories}
              isOwnFolder={currentView === 'my-shared' && sharedFolder.author.id === 'current-user'}
            />
          ))}
        </div>
      )}


      
      {/* Edit Shared Folder Modal */}
      {editingFolder && (
        <EditSharedFolderModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditingFolder(null)
          }}
          sharedFolder={editingFolder}
          onUpdateFolder={handleUpdateFolder}
        />
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  )
}