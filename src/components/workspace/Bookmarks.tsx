'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Star,
  Link as LinkIcon,
  Trash2,
  ExternalLink
} from 'lucide-react'

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
}

export default function Bookmarks({ searchQuery = '' }: { searchQuery?: string }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // 카테고리 옵션들
  const categories = [
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
          isFavorite: true
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
          isFavorite: false
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
          isFavorite: true
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
          isFavorite: false
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
          isFavorite: true
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
    if (selectedCategory !== 'all') {
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
    if (confirm('이 북마크를 삭제하시겠습니까?')) {
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
    }
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">북마크 로딩중...</p>
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
            {filteredBookmarks.length} bookmarks
          </h3>
          <p className="text-xs text-gray-500">
            {selectedCategory === 'all' ? 'All Categories' : categories.find(cat => cat.value === selectedCategory)?.label}
          </p>
        </div>
        
        {/* Add Bookmark Button */}
        <button
          onClick={() => {
            const url = prompt('북마크할 URL을 입력하세요:')
            if (url) {
              const title = prompt('제목을 입력하세요:', url) || url
              const newBookmark: Bookmark = {
                id: Date.now().toString(),
                title,
                url,
                description: '',
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                category: 'personal',
                isFavorite: false
              }
              setBookmarks(prev => [newBookmark, ...prev])
            }
          }}
          className="px-4 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Bookmark
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6 pb-3 border-b border-gray-200">
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
                  <img 
                    src={bookmark.favicon} 
                    alt={bookmark.title}
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
                  {new Date(bookmark.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              {/* Actions - PC에서만 표시 */}
              <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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
    </div>
  )
}