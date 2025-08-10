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
    <div className="flex-1 p-3 lg:p-4">
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

      {/* Bookmarks Grid - 2xN PC, 1xN Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBookmarks.map((bookmark) => (
          <motion.div
            key={bookmark.id}
            className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 group relative"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-4">
              {/* Header with favicon and actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {bookmark.title}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {new URL(bookmark.url).hostname}
                    </p>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      handleOpenBookmark(bookmark)
                    }}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3 h-3" />
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
              </div>

              {/* Description */}
              {bookmark.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                  {bookmark.description}
                </p>
              )}

              {/* Tags and date */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {bookmark.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(bookmark.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Click overlay */}
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={() => handleOpenBookmark(bookmark)}
            />
          </motion.div>
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