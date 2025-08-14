'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Plus
} from 'lucide-react'
import BookmarkCard, { Bookmark } from '../ui/BookmarkCard'
import CategoryFilter from '../ui/CategoryFilter'
import { useOptimisticAuth } from '@/hooks/useOptimisticAuth'
import { DatabaseService } from '@/lib/database'

// type DbBookmark = Database['public']['Tables']['bookmarks']['Row']




export default function Bookmarks({ searchQuery = '' }: { searchQuery?: string }) {
  const { user } = useOptimisticAuth()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('most-used')
  const [isLoading, setIsLoading] = useState(true)

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

  // 데이터베이스에서 북마크 로드
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const loadBookmarks = async () => {
      setIsLoading(true)
      
      try {
        // Supabase에서 북마크 데이터 로드
        const dbBookmarks = await DatabaseService.getUserBookmarks(user.id)
        
        // 데이터베이스 형식을 기존 Bookmark 형식으로 변환
        const convertedBookmarks: Bookmark[] = dbBookmarks.map(dbBookmark => ({
          id: dbBookmark.id,
          title: dbBookmark.title,
          url: dbBookmark.url,
          description: dbBookmark.description || '',
          favicon: `${new URL(dbBookmark.url).origin}/favicon.ico`,
          tags: dbBookmark.tags,
          createdAt: dbBookmark.created_at,
          updatedAt: dbBookmark.updated_at,
          category: dbBookmark.category || 'work',
          isFavorite: dbBookmark.is_favorite,
          usageCount: 0, // 현재 스키마에는 없으므로 기본값
          lastUsedAt: dbBookmark.updated_at // 임시로 updated_at 사용
        }))

        setBookmarks(convertedBookmarks)
        
      } catch (error) {
        console.error('Failed to load bookmarks:', error)
        setBookmarks([])
      } finally {
        setIsLoading(false)
      }
    }

    loadBookmarks()
  }, [user])

  // 샘플 북마크 데이터 (참고용 - 실제로는 사용하지 않음)
  /*
  const sampleBookmarks: Bookmark[] = [
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
  */

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
    <div className="flex-1 px-2 py-3 sm:px-4 lg:p-4">
      {/* 모바일: 헤더 + 드롭다운 + 버튼 */}
      <div className="block sm:hidden mb-4">
        {/* 모바일 헤더 - 통일된 스타일 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedCategory === 'all' ? 'All Categories' : categories.find(cat => cat.value === selectedCategory)?.label}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 카테고리 필터 컴포넌트 사용 */}
          <div className="flex-1">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              showDropdownOnMobile={true}
            />
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
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-150 active:scale-95 select-none"
            title="Add Bookmark"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* 헤더 - 통일된 스타일 */}
      <div className="hidden sm:flex sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
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
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-150 flex items-center gap-2 active:scale-95 select-none"
          title="Add Bookmark"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-medium">Add Bookmark</span>
        </button>
      </div>

      {/* Category Filter - 데스크톱용만 */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        showDropdownOnMobile={false}
      />

      {/* Bookmarks List - Unified Compact Design for Mobile and PC */}
      <div className="space-y-0">
        {filteredBookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onOpenBookmark={handleOpenBookmark}
            onToggleFavorite={handleToggleFavorite}
            onDeleteBookmark={handleDeleteBookmark}
          />
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