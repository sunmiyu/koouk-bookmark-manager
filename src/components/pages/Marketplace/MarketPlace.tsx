'use client'

import { useState, useEffect } from 'react'
import { SharedFolder } from '@/types/share'
import { createFolder } from '@/types/folder'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/components/auth/AuthProvider'
import { DatabaseService } from '@/lib/database'
import Toast from '@/components/ui/Toast'
import SharedFolderCard from '@/components/ui/SharedFolderCard'
import EditSharedFolderModal from '@/components/ui/EditSharedFolderModal'
import BottomSheet from '@/components/ui/BottomSheet'
import FolderImportPreview from '@/components/ui/FolderImportPreview'
import SuccessOverlay from '@/components/ui/SuccessOverlay'
import { motion } from 'framer-motion'

interface MarketPlaceProps {
  searchQuery?: string
  onImportFolder?: (sharedFolder: SharedFolder) => void
}

export default function MarketPlace({ 
  searchQuery = '', 
  onImportFolder
}: MarketPlaceProps) {
  const { user } = useAuth() // loading 의존성 제거
  const { toast, showSuccess, hideToast } = useToast()
  const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>([])
  const [filteredFolders, setFilteredFolders] = useState<SharedFolder[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'popular' | 'recent' | 'helpful'>('popular')
  const [isLoading, setIsLoading] = useState(true)
  const currentView = 'marketplace'
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<SharedFolder | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedFolderForImport, setSelectedFolderForImport] = useState<SharedFolder | null>(null)
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const categories = [
    { id: 'all', label: 'All Categories', count: sharedFolders.length },
    { id: 'business', label: 'Business', count: sharedFolders.filter(f => f.category === 'business').length },
    { id: 'creative', label: 'Creative', count: sharedFolders.filter(f => f.category === 'creative').length },
    { id: 'tech', label: 'Tech', count: sharedFolders.filter(f => f.category === 'tech').length },
    { id: 'education', label: 'Education', count: sharedFolders.filter(f => f.category === 'education').length },
    { id: 'lifestyle', label: 'Lifestyle', count: sharedFolders.filter(f => f.category === 'lifestyle').length },
    { id: 'entertainment', label: 'Entertainment', count: sharedFolders.filter(f => f.category === 'entertainment').length },
    { id: 'food', label: 'Food & Recipe', count: sharedFolders.filter(f => f.category === 'food').length },
    { id: 'travel', label: 'Travel', count: sharedFolders.filter(f => f.category === 'travel').length },
    { id: 'health', label: 'Health & Fitness', count: sharedFolders.filter(f => f.category === 'health').length },
    { id: 'finance', label: 'Finance', count: sharedFolders.filter(f => f.category === 'finance').length },
    { id: 'shopping', label: 'Shopping', count: sharedFolders.filter(f => f.category === 'shopping').length },
    { id: 'sports', label: 'Sports', count: sharedFolders.filter(f => f.category === 'sports').length },
    { id: 'gaming', label: 'Gaming', count: sharedFolders.filter(f => f.category === 'gaming').length },
    { id: 'news', label: 'News', count: sharedFolders.filter(f => f.category === 'news').length },
    { id: 'science', label: 'Science', count: sharedFolders.filter(f => f.category === 'science').length }
  ]
  
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const mobile = width < 768
      setIsMobile(mobile)
      setViewMode(mobile ? 'list' : 'grid')
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Sort options
  const sortOptions = [
    { value: 'popular', label: 'Popular', description: 'Likes + Downloads' },
    { value: 'recent', label: 'Recent', description: 'Recently uploaded' },
    { value: 'helpful', label: 'Helpful', description: 'Helpful rating' }
  ]

  // Mock shared folders data (기본 샘플 데이터)
  const mockSharedFolders: SharedFolder[] = [
    {
      id: '1',
      title: 'Seoul Travel Guide',
      description: 'Complete guide for visiting Seoul with hidden gems and local recommendations',
      author: { id: 'user1', name: 'TravelExpert', avatar: '', verified: true },
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
      author: { id: 'user2', name: 'ReactDev', avatar: '', verified: true },
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
      author: { id: 'user3', name: 'LifestyleMaven', avatar: '', verified: false },
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
      author: { id: 'user4', name: 'ChefKim', avatar: '', verified: true },
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
      author: { id: 'user5', name: 'DesignPro', avatar: '', verified: true },
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
      author: { id: 'user6', name: 'InvestorK', avatar: '', verified: false },
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

  // 데이터베이스에서 공유 폴더 데이터 로드 - 개선된 버전
  useEffect(() => {
    // AuthContext loading 상태 체크 제거 - user 상태만으로 충분

    const loadData = async () => {
      try {
        setIsLoading(true)
        console.log('Loading marketplace data...')
        
        let convertedFolders: SharedFolder[] = []
        let userSharedFolders: SharedFolder[] = []

        try {
          console.log('Loading public shared folders...')
          const dbSharedFolders = await DatabaseService.getPublicSharedFolders()
          
          // 데이터베이스 형식을 기존 SharedFolder 형식으로 변환
          convertedFolders = await Promise.all(
            dbSharedFolders.map(async (dbFolder) => {
              const author = dbFolder.users ? {
                id: dbFolder.user_id,
                name: dbFolder.users.name || 'Anonymous',
                avatar: dbFolder.users.avatar_url || '👤',
                verified: dbFolder.users.is_verified
              } : {
                id: 'unknown',
                name: 'Anonymous',
                avatar: '',
                verified: false
              }

              return {
                id: dbFolder.id,
                title: dbFolder.title,
                description: dbFolder.description,
                author,
                category: dbFolder.category as SharedFolder['category'],
                createdAt: dbFolder.created_at,
                updatedAt: dbFolder.updated_at,
                isPublic: dbFolder.is_public,
                tags: dbFolder.tags,
                coverImage: dbFolder.cover_image,
                stats: typeof dbFolder.stats === 'object' ? dbFolder.stats as SharedFolder['stats'] : {
                  views: 0,
                  likes: 0,
                  helpful: 0,
                  notHelpful: 0,
                  shares: 0,
                  downloads: 0
                },
                folder: createFolder(dbFolder.title)
              }
            })
          )
          console.log('✅ Public folders loaded:', convertedFolders.length)
        } catch (publicError) {
          console.error('❌ Failed to load public folders:', publicError)
        }
        if (user?.id) {
          try {
            console.log('👤 Loading user shared folders for:', user.email)
            const dbUserSharedFolders = await DatabaseService.getUserSharedFolders(user.id)
            
            userSharedFolders = dbUserSharedFolders.map(dbFolder => ({
              id: dbFolder.id,
              title: dbFolder.title,
              description: dbFolder.description,
              author: {
                id: user.id,
                name: 'You',
                avatar: '',
                verified: false
              },
              category: dbFolder.category as SharedFolder['category'],
              createdAt: dbFolder.created_at,
              updatedAt: dbFolder.updated_at,
              isPublic: dbFolder.is_public,
              tags: dbFolder.tags,
              coverImage: dbFolder.cover_image,
              stats: typeof dbFolder.stats === 'object' ? dbFolder.stats as SharedFolder['stats'] : {
                views: 0,
                likes: 0,
                helpful: 0,
                notHelpful: 0,
                shares: 0,
                downloads: 0
              },
              folder: createFolder(dbFolder.title)
            }))
            console.log('✅ User folders loaded:', userSharedFolders.length)
          } catch (userError) {
            console.error('❌ Failed to load user folders:', userError)
            
            if ((userError as Error)?.message?.includes('No authorization token') || 
                (userError as Error)?.message?.includes('JWT') || 
                (userError as Error)?.message?.includes('authorization')) {
              console.error('🚨 Authorization token missing for user folders')
            }
          }
        } else {
          console.log('👤 No user authenticated, skipping user folders')
        }

        // 데이터가 없으면 mock 데이터 사용 (데모용)
        const allFolders = convertedFolders.length > 0 
          ? [...userSharedFolders, ...convertedFolders]
          : [...userSharedFolders, ...mockSharedFolders]
        
        setSharedFolders(allFolders)
        console.log('✅ Marketplace data loaded successfully:', allFolders.length, 'folders')
        
      } catch (error) {
        console.error('❌ Critical error loading marketplace data:', error)
        // 모든 데이터 로드가 실패하면 mock 데이터라도 표시
        setSharedFolders(mockSharedFolders)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id, user?.email]) // 🔧 mockSharedFolders 제거하여 무한루프 방지

  // 검색, 필터링, 정렬
  useEffect(() => {
    let filtered = sharedFolders

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(folder => folder.category === selectedCategory)
    }

    // 검색 필터 (props searchQuery 또는 localSearchQuery 사용)
    const effectiveSearchQuery = localSearchQuery || searchQuery
    if (effectiveSearchQuery.trim()) {
      const query = effectiveSearchQuery.toLowerCase()
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
    // 검색이나 필터 변경 시 첫 페이지로 이동
    setCurrentPage(1)
  }, [sharedFolders, selectedCategory, searchQuery, localSearchQuery, sortOrder, currentView, user])
  
  const totalPages = Math.ceil(filteredFolders.length / itemsPerPage)
  const currentItems = isMobile ? filteredFolders : filteredFolders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInWeeks = Math.floor(diffInDays / 7)
    const diffInMonths = Math.floor(diffInDays / 30)
    
    if (diffInHours < 1) {
      return 'just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`
    } else if (diffInMonths < 12) {
      return `${diffInMonths}mo ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleCardClick = (sharedFolder: SharedFolder) => {
    if (currentView === 'marketplace') {
      setSelectedFolderForImport(sharedFolder)
      setShowImportModal(true)
    } else {
      handleEditFolder(sharedFolder)
    }
  }

  const handleConfirmImport = async () => {
    if (selectedFolderForImport && onImportFolder) {
      // Close modal first for smoother UX
      setShowImportModal(false)
      
      // Show success animation
      setSuccessMessage(`"${selectedFolderForImport.title}" added to My Folder!`)
      setShowSuccessOverlay(true)
      
      // Import the folder
      onImportFolder(selectedFolderForImport)
      
      // Auto-hide success overlay after animation
      setTimeout(() => {
        setShowSuccessOverlay(false)
        setSelectedFolderForImport(null)
      }, 2500)
    }
  }

  const handleEditFolder = (sharedFolder: SharedFolder) => {
    setEditingFolder(sharedFolder)
    setEditModalOpen(true)
  }

  const handleUpdateFolder = async (updatedFolder: SharedFolder) => {
    if (!user) return
    
    try {
      await DatabaseService.updateSharedFolder(updatedFolder.id, {
        title: updatedFolder.title,
        description: updatedFolder.description,
        cover_image: updatedFolder.coverImage,
        category: updatedFolder.category,
        tags: updatedFolder.tags,
        is_public: updatedFolder.isPublic
      })

      const updatedFolders = sharedFolders.map(folder => 
        folder.id === updatedFolder.id ? updatedFolder : folder
      )
      setSharedFolders(updatedFolders)

      showSuccess(`"${updatedFolder.title}" updated successfully!`)
    } catch (error) {
      console.error('Error updating folder:', error)
      showSuccess('Failed to update folder. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen pb-4">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h1 className="text-base font-semibold text-gray-900">Marketplace</h1>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>
          
          {/* 🖥️ PC Skeleton */}
          <div className="hidden md:block">
            <div className="flex flex-wrap gap-6 justify-start">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex-shrink-0 w-[280px]">
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="aspect-[4/3] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse mt-4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 📱 Mobile Skeleton */}
          <div className="block md:hidden space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-100 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                  <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
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
    <div className="flex flex-col min-h-screen pb-4">
      {/* 🎯 모바일 전용 헤더 */}
      <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* 🎯 카테고리 드롭다운 - 모바일 전용 */}
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 text-sm font-medium bg-transparent border-none focus:outline-none text-gray-900 min-w-0"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label} ({category.count})
                </option>
              ))}
            </select>
          </div>
          
          {/* 🎯 액션 버튼들 - 더 compact */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* 정렬 드롭다운 */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'popular' | 'recent' | 'helpful')}
              className="text-xs text-gray-600 bg-transparent border-none focus:outline-none"
              title="Sort by"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* 검색 버튼 */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
              title="Search"
            >
              🔍
            </button>
          </div>
        </div>
        
        {/* 🎯 검색바 (토글) */}
        {showMobileSearch && (
          <div className="mt-2">
            <div className="relative">
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                placeholder="Search collections..."
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={() => {
                  setLocalSearchQuery('')
                  setShowMobileSearch(false)
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 🎯 메인 컨텐츠 영역 - 타이트한 레이아웃 */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {/* 🎯 바로 콘텐츠 카드들만 표시 - 중복 제목/설명 제거 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFolders.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-2xl md:text-3xl mb-4">🎆</div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No folders found</h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory === 'all' 
                ? 'No shared folders available yet'
                : 'Try selecting a different category or search term'
              }
            </p>
          </motion.div>
        ) : (
          <>
            {/* 🖥️ PC Grid Layout - Fixed card size based on 1750px screen */}
            {!isMobile ? (
              <div className="flex flex-wrap gap-6 justify-start">
                {currentItems.map((sharedFolder, index) => (
                  <motion.div
                    key={sharedFolder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-[280px] h-auto"> {/* Fixed card width for 1750px screen */}
                      <SharedFolderCard
                        sharedFolder={sharedFolder}
                        onImportFolder={onImportFolder}
                        onEditFolder={handleEditFolder}
                        categories={categories.map(cat => ({ 
                          value: cat.id, 
                          label: cat.label,
                          emoji: cat.id === 'business' ? '💼' : 
                                cat.id === 'creative' ? '🎨' : 
                                cat.id === 'tech' ? '💻' : 
                                cat.id === 'education' ? '📚' : 
                                cat.id === 'lifestyle' ? '🏠' : 
                                cat.id === 'entertainment' ? '🎵' : 
                                cat.id === 'food' ? '🍽️' : 
                                cat.id === 'travel' ? '✈️' : 
                                cat.id === 'health' ? '🏃' : 
                                cat.id === 'finance' ? '💰' : 
                                cat.id === 'shopping' ? '🛒' : 
                                cat.id === 'sports' ? '⚽' : 
                                cat.id === 'gaming' ? '🎮' : 
                                cat.id === 'news' ? '📰' : 
                                cat.id === 'science' ? '🔬' : '📁'
                        }))}
                        isOwnFolder={sharedFolder.author.id === user?.id}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* 📱 Mobile Grid Layout - 2 columns */
              <div className="grid grid-cols-2 gap-3">
                {currentItems.map((sharedFolder, index) => (
                  <motion.div
                    key={sharedFolder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {/* Mobile-optimized card */}
                    <div 
                      onClick={() => handleCardClick(sharedFolder)}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-95 transition-transform"
                    >
                      {/* Cover Image */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100">
                        {sharedFolder.coverImage ? (
                          <img
                            src={sharedFolder.coverImage}
                            alt={sharedFolder.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">
                              {sharedFolder.category === 'business' ? '💼' : 
                               sharedFolder.category === 'creative' ? '🎨' : 
                               sharedFolder.category === 'tech' ? '💻' : 
                               sharedFolder.category === 'education' ? '📚' : 
                               sharedFolder.category === 'lifestyle' ? '🏠' : 
                               sharedFolder.category === 'entertainment' ? '🎵' : 
                               sharedFolder.category === 'food' ? '🍽️' : 
                               sharedFolder.category === 'travel' ? '✈️' : 
                               sharedFolder.category === 'health' ? '🏃' : 
                               sharedFolder.category === 'finance' ? '💰' : 
                               sharedFolder.category === 'shopping' ? '🛒' : 
                               sharedFolder.category === 'sports' ? '⚽' : 
                               sharedFolder.category === 'gaming' ? '🎮' : 
                               sharedFolder.category === 'news' ? '📰' : 
                               sharedFolder.category === 'science' ? '🔬' : '📁'}
                            </span>
                          </div>
                        )}
                        
                        {/* Stats overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <div className="flex items-center justify-between text-white text-xs">
                            <span className="flex items-center gap-1">
                              ❤️ {sharedFolder.stats.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              📥 {sharedFolder.stats.downloads}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-3">
                        {/* Title */}
                        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 leading-tight">
                          {sharedFolder.title}
                        </h3>
                        
                        {/* Author & Category */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-600">{sharedFolder.author.name}</span>
                            {sharedFolder.author.verified && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-[8px]">✓</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {getRelativeTime(sharedFolder.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* 🖥️ PC Pagination */}
            {!isMobile && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ← Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-gray-900 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

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

      {/* 📱 MOBILE-FIRST: Bottom Sheet Import Preview */}
      <BottomSheet
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false)
          setSelectedFolderForImport(null)
        }}
        height="auto"
      >
        {selectedFolderForImport && (
          <FolderImportPreview
            folder={selectedFolderForImport}
            onImport={handleConfirmImport}
            onCancel={() => {
              setShowImportModal(false)
              setSelectedFolderForImport(null)
            }}
          />
        )}
      </BottomSheet>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* 📱 MOBILE-FIRST: Success Overlay */}
      <SuccessOverlay
        show={showSuccessOverlay}
        message={successMessage}
        onComplete={() => setShowSuccessOverlay(false)}
      />
    </div>
  )
}