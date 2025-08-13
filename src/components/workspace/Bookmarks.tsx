'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  Search, 
  Star,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  ChevronDown,
  Plus
} from 'lucide-react'
import UniversalInputBar from '../ui/UniversalInputBar'
import { FolderItem, StorageItem } from '@/types/folder'
import { useToast } from '@/hooks/useToast'
import Toast from '../ui/Toast'

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  favicon?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  category?: string
  isFavorite?: boolean
  usageCount?: number
  lastUsedAt?: string
}

export default function Bookmarks({ searchQuery = '' }: { searchQuery?: string }) {
  const { toast, showSuccess, hideToast } = useToast()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('most-used')
  const [isLoading, setIsLoading] = useState(true)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  
  // Mock folders for Universal Input Bar (bookmarks don't actually use folders)
  const mockFolders: FolderItem[] = [{
    id: 'bookmarks',
    name: 'Bookmarks',
    type: 'folder',
    children: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: '#3B82F6',
    icon: '🔖'
  }]

  // 카테고리 옵션들
  const categories = [
    { value: 'most-used', label: 'Most Used' },
    { value: 'all', label: 'All Bookmarks' },
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'news', label: 'News' },
    { value: 'social', label: 'Social' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'education', label: 'Education' },
    { value: 'tech', label: 'Technology' }
  ]

  // Mock 데이터 로드
  useEffect(() => {
    const loadBookmarks = async () => {
      setIsLoading(true)
      
      // Mock bookmarks data
      const mockBookmarks: Bookmark[] = [
        {
          id: '1',
          title: 'GitHub - React',
          url: 'https://github.com/facebook/react',
          description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
          favicon: 'https://github.com/favicon.ico',
          tags: ['react', 'javascript', 'library'],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          category: 'tech',
          isFavorite: true,
          usageCount: 78,
          lastUsedAt: '2025-08-10T14:30:00Z'
        },
        {
          id: '2',
          title: 'Next.js Documentation',
          url: 'https://nextjs.org/docs',
          description: 'Learn about Next.js features and API.',
          favicon: 'https://nextjs.org/favicon.ico',
          tags: ['nextjs', 'react', 'documentation'],
          createdAt: '2024-01-14T09:00:00Z',
          updatedAt: '2024-01-14T09:00:00Z',
          category: 'tech',
          isFavorite: false,
          usageCount: 65,
          lastUsedAt: '2025-08-09T16:45:00Z'
        },
        {
          id: '3',
          title: 'Tailwind CSS',
          url: 'https://tailwindcss.com',
          description: 'A utility-first CSS framework for rapidly building custom user interfaces.',
          favicon: 'https://tailwindcss.com/favicon.ico',
          tags: ['css', 'framework', 'styling'],
          createdAt: '2024-01-13T14:00:00Z',
          updatedAt: '2024-01-13T14:00:00Z',
          category: 'tech',
          isFavorite: true,
          usageCount: 52,
          lastUsedAt: '2025-08-08T11:20:00Z'
        },
        {
          id: '4',
          title: 'Google',
          url: 'https://www.google.com',
          description: 'Search the world\'s information',
          favicon: 'https://www.google.com/favicon.ico',
          tags: ['search', 'google'],
          createdAt: '2024-01-12T08:00:00Z',
          updatedAt: '2024-01-12T08:00:00Z',
          category: 'work',
          isFavorite: false,
          usageCount: 34,
          lastUsedAt: '2025-08-07T13:15:00Z'
        },
        {
          id: '5',
          title: 'YouTube',
          url: 'https://www.youtube.com',
          description: 'Enjoy the videos and music you love',
          favicon: 'https://www.youtube.com/favicon.ico',
          tags: ['video', 'entertainment', 'music'],
          createdAt: '2024-01-11T15:00:00Z',
          updatedAt: '2024-01-11T15:00:00Z',
          category: 'entertainment',
          isFavorite: true,
          usageCount: 28,
          lastUsedAt: '2025-08-06T19:30:00Z'
        },
        {
          id: '6',
          title: 'Stack Overflow',
          url: 'https://stackoverflow.com',
          description: 'Where developers learn, share, & build careers',
          favicon: 'https://stackoverflow.com/favicon.ico',
          tags: ['programming', 'help', 'community'],
          createdAt: '2024-01-10T12:00:00Z',
          updatedAt: '2024-01-10T12:00:00Z',
          category: 'tech',
          isFavorite: false,
          usageCount: 71,
          lastUsedAt: '2025-08-11T09:45:00Z'
        },
        {
          id: '7',
          title: 'Gmail',
          url: 'https://mail.google.com',
          description: 'Email from Google',
          favicon: 'https://mail.google.com/favicon.ico',
          tags: ['email', 'google', 'communication'],
          createdAt: '2024-01-09T08:30:00Z',
          updatedAt: '2024-01-09T08:30:00Z',
          category: 'work',
          isFavorite: true,
          usageCount: 89,
          lastUsedAt: '2025-08-11T08:00:00Z'
        },
        {
          id: '8',
          title: 'Notion',
          url: 'https://www.notion.so',
          description: 'One platform. Every team.',
          favicon: 'https://www.notion.so/favicon.ico',
          tags: ['productivity', 'notes', 'collaboration'],
          createdAt: '2024-01-08T16:20:00Z',
          updatedAt: '2024-01-08T16:20:00Z',
          category: 'work',
          isFavorite: true,
          usageCount: 43,
          lastUsedAt: '2025-08-05T15:20:00Z'
        },
        {
          id: '9',
          title: 'Netflix',
          url: 'https://www.netflix.com',
          description: 'Watch TV shows and movies online',
          favicon: 'https://www.netflix.com/favicon.ico',
          tags: ['streaming', 'movies', 'tv'],
          createdAt: '2024-01-07T20:00:00Z',
          updatedAt: '2024-01-07T20:00:00Z',
          category: 'entertainment',
          isFavorite: false,
          usageCount: 15,
          lastUsedAt: '2025-08-04T21:30:00Z'
        },
        {
          id: '10',
          title: 'MDN Web Docs',
          url: 'https://developer.mozilla.org',
          description: 'Resources for developers, by developers',
          favicon: 'https://developer.mozilla.org/favicon.ico',
          tags: ['documentation', 'web', 'javascript'],
          createdAt: '2024-01-06T14:15:00Z',
          updatedAt: '2024-01-06T14:15:00Z',
          category: 'tech',
          isFavorite: false,
          usageCount: 37,
          lastUsedAt: '2025-08-03T10:45:00Z'
        },
        {
          id: '11',
          title: 'Figma',
          url: 'https://www.figma.com',
          description: 'The collaborative interface design tool',
          favicon: 'https://www.figma.com/favicon.ico',
          tags: ['design', 'ui', 'collaboration'],
          createdAt: '2024-01-05T11:30:00Z',
          updatedAt: '2024-01-05T11:30:00Z',
          category: 'work',
          isFavorite: true,
          usageCount: 59,
          lastUsedAt: '2025-08-02T14:00:00Z'
        },
        {
          id: '12',
          title: 'Spotify',
          url: 'https://open.spotify.com',
          description: 'Music for everyone',
          favicon: 'https://open.spotify.com/favicon.ico',
          tags: ['music', 'streaming', 'playlist'],
          createdAt: '2024-01-04T09:45:00Z',
          updatedAt: '2024-01-04T09:45:00Z',
          category: 'entertainment',
          isFavorite: false,
          usageCount: 22,
          lastUsedAt: '2025-08-01T16:20:00Z'
        },
        {
          id: '13',
          title: 'Amazon',
          url: 'https://www.amazon.com',
          description: 'Online shopping for everything',
          favicon: 'https://www.amazon.com/favicon.ico',
          tags: ['shopping', 'ecommerce', 'delivery'],
          createdAt: '2024-01-03T15:10:00Z',
          updatedAt: '2024-01-03T15:10:00Z',
          category: 'shopping',
          isFavorite: false,
          usageCount: 12,
          lastUsedAt: '2025-07-30T12:30:00Z'
        },
        {
          id: '14',
          title: 'Hacker News',
          url: 'https://news.ycombinator.com',
          description: 'Social news website focusing on computer science',
          favicon: 'https://news.ycombinator.com/favicon.ico',
          tags: ['news', 'tech', 'community'],
          createdAt: '2024-01-02T13:25:00Z',
          updatedAt: '2024-01-02T13:25:00Z',
          category: 'news',
          isFavorite: true,
          usageCount: 31,
          lastUsedAt: '2025-07-29T08:15:00Z'
        },
        {
          id: '15',
          title: 'LinkedIn',
          url: 'https://www.linkedin.com',
          description: 'Professional networking platform',
          favicon: 'https://www.linkedin.com/favicon.ico',
          tags: ['professional', 'networking', 'career'],
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z',
          category: 'social',
          isFavorite: false,
          usageCount: 8,
          lastUsedAt: '2025-07-28T17:45:00Z'
        }
      ]

      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate loading
      setBookmarks(mockBookmarks)
      setIsLoading(false)
    }

    loadBookmarks()
  }, [])

  // 검색 및 필터링
  useEffect(() => {
    let filtered = bookmarks

    // 카테고리 필터
    if (selectedCategory === 'most-used') {
      // Most Used: usageCount가 높은 순으로 정렬하고 상위 10개만 표시
      filtered = filtered
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 10)
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(bookmark => bookmark.category === selectedCategory)
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description?.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredBookmarks(filtered)
  }, [bookmarks, selectedCategory, searchQuery])

  const handleOpenBookmark = (bookmark: Bookmark) => {
    // 사용 횟수 증가
    setBookmarks(prev => prev.map(b => 
      b.id === bookmark.id 
        ? { 
            ...b, 
            usageCount: (b.usageCount || 0) + 1, 
            lastUsedAt: new Date().toISOString() 
          }
        : b
    ))
    
    window.open(bookmark.url, '_blank', 'noopener,noreferrer')
  }

  const handleToggleFavorite = (bookmarkId: string) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === bookmarkId 
        ? { ...bookmark, isFavorite: !bookmark.isFavorite }
        : bookmark
    ))
  }

  const handleDeleteBookmark = (bookmarkId: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
    }
  }

  // Handle Universal Input Bar items (mainly URLs)
  const handleAddItemFromInputBar = (item: StorageItem) => {
    if (item.type === 'url') {
      // Convert StorageItem to Bookmark
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: item.name === 'Link' ? new URL(item.content).hostname : item.name,
        url: item.content,
        description: '',
        tags: ['universal-input'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'personal',
        isFavorite: false,
        usageCount: 0,
        lastUsedAt: new Date().toISOString()
      }
      
      setBookmarks(prev => [newBookmark, ...prev])
      showSuccess('🔖 Bookmark saved!')
    }
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          {/* Bookmarks skeleton loading */}
          <div className="space-y-0 max-w-2xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 border-b border-gray-100">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 px-2 py-3 sm:px-4 lg:p-4 pb-24">
      {/* 모바일: 드롭다운 + 버튼 한 줄 */}
      <div className="block sm:hidden mb-4">
        <div className="flex items-center gap-3">
          {/* 드롭다운 */}
          <div className="flex-1 relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>{categories.find(cat => cat.value === selectedCategory)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* 드롭다운 메뉴 */}
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
          
          {/* + 버튼 - 투명 배경 */}
          <button
            onClick={() => {
              const url = prompt('Enter URL to bookmark:')
              if (url) {
                const title = prompt('Enter title:', url) || url
                const newBookmark: Bookmark = {
                  id: Date.now().toString(),
                  title,
                  url,
                  description: '',
                  tags: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  category: 'personal',
                  isFavorite: false,
                  usageCount: 0,
                  lastUsedAt: new Date().toISOString()
                }
                setBookmarks(prev => [newBookmark, ...prev])
              }
            }}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add Bookmark"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* 데스크톱: 기존 헤더 */}
      <div className="hidden sm:flex sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-medium text-black">
            {filteredBookmarks.length} bookmarks
          </h3>
          <p className="text-xs text-gray-500">
            {selectedCategory === 'all' ? 'All Categories' : categories.find(cat => cat.value === selectedCategory)?.label}
          </p>
        </div>
        
        {/* Add Bookmark Button - Desktop */}
        <button
          onClick={() => {
            const url = prompt('Enter URL to bookmark:')
            if (url) {
              const title = prompt('Enter title:', url) || url
              const newBookmark: Bookmark = {
                id: Date.now().toString(),
                title,
                url,
                description: '',
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                category: 'personal',
                isFavorite: false,
                usageCount: 0,
                lastUsedAt: new Date().toISOString()
              }
              setBookmarks(prev => [newBookmark, ...prev])
            }
          }}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          title="Add Bookmark"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-medium">Add Bookmark</span>
        </button>
      </div>

      {/* Category Filter - 데스크톱용만 */}
      <div className="hidden sm:block mb-6 pb-3 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
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

      {/* Bookmarks List - Unified Compact Design for Mobile and PC */}
      <div className="space-y-0">
        {filteredBookmarks.map((bookmark) => (
          <motion.button
            key={bookmark.id}
            onClick={() => handleOpenBookmark(bookmark)}
            className="w-full px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
            whileTap={{ scale: 0.98 }}
            style={{ minHeight: '44px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* 통합된 컴팩트 레이아웃 - 모바일과 PC 동일 */}
            <div className="flex items-center gap-3">
              {/* 파비콘 */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-100">
                {bookmark.favicon ? (
                  <Image 
                    src={bookmark.favicon} 
                    alt={bookmark.title}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=16`
                    }}
                  />
                ) : (
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                )}
              </div>
              
              {/* 제목 */}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900 text-sm truncate block">{bookmark.title}</span>
              </div>
              
              {/* URL 도메인 - PC에서 더 넓게 */}
              <div className="hidden sm:block text-xs text-gray-500 w-24 truncate flex-shrink-0">
                {new URL(bookmark.url).hostname.replace('www.', '')}
              </div>
              
              {/* 태그들 - PC에서만 표시 */}
              <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
                {bookmark.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* 메타정보 */}
              <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                {bookmark.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                <span className="hidden sm:inline">
                  {new Date(bookmark.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              {/* Actions - 모바일/PC 모두 표시 */}
              <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleFavorite(bookmark.id)
                  }}
                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                    bookmark.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                  title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-3 h-3 ${bookmark.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteBookmark(bookmark.id)
                  }}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete bookmark"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <ExternalLink size={14} color="#9CA3AF" className="flex-shrink-0" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Empty State */}
      {filteredBookmarks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No bookmarks found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search terms.' : 'Start adding bookmarks to see them here.'}
          </p>
        </div>
      )}
      
      {/* Universal Input Bar - Fixed at bottom for paste-and-save workflow */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
        <UniversalInputBar
          folders={mockFolders}
          selectedFolderId="bookmarks"
          onAddItem={(item) => handleAddItemFromInputBar(item)}
          onFolderSelect={() => {}} // Not needed for bookmarks
          onOpenMemo={() => {}} // Not applicable for bookmarks
          onOpenNote={() => {}} // Not applicable for bookmarks
        />
      </div>
      
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