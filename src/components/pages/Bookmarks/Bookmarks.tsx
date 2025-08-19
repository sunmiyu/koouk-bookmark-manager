'use client'

import { useState, useEffect } from 'react'
import BookmarkCard, { Bookmark } from '@/components/ui/BookmarkCard'
import CategoryFilter from '@/components/ui/CategoryFilter'
import { useAuth } from '@/components/auth/AuthProvider'
import { DatabaseService } from '@/lib/database'
// 🎨 PERFECTION: Import new components
import ContentCard, { ContentGrid } from '@/components/ui/ContentCard'
import SearchHeader, { FilterPills } from '@/components/ui/SearchHeader'
import { motion } from 'framer-motion'

export default function Bookmarks({ searchQuery = '' }: { searchQuery?: string }) {
  const { user } = useAuth() // loading 의존성 제거
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('most-used')
  const [isLoading, setIsLoading] = useState(true)
  // 🎨 PERFECTION: Enhanced state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // 🎨 PERFECTION: Enhanced categories with counts
  const categories = [
    { id: 'all', label: 'All Bookmarks', count: bookmarks.length },
    { id: 'most-used', label: 'Most Used', count: bookmarks.filter(b => b.category === 'most-used').length },
    { id: 'work', label: 'Work', count: bookmarks.filter(b => b.category === 'work').length },
    { id: 'personal', label: 'Personal', count: bookmarks.filter(b => b.category === 'personal').length },
    { id: 'entertainment', label: 'Entertainment', count: bookmarks.filter(b => b.category === 'entertainment').length },
    { id: 'social', label: 'Social', count: bookmarks.filter(b => b.category === 'social').length },
    { id: 'shopping', label: 'Shopping', count: bookmarks.filter(b => b.category === 'shopping').length },
    { id: 'education', label: 'Education', count: bookmarks.filter(b => b.category === 'education').length },
    { id: 'tech', label: 'Technology', count: bookmarks.filter(b => b.category === 'tech').length }
  ]

  // 데이터베이스에서 북마크 로드 - 개선된 버전
  useEffect(() => {
    // 🔒 핵심: 사용자 인증 및 로딩 상태 체크
    if (!user) {
      console.log('No user found, skipping bookmarks load')
      setIsLoading(false)
      setBookmarks([])
      return
    }

    // loading 상태 체크 제거 - user 상태만으로 충분

    const loadBookmarks = async () => {
      try {
        setIsLoading(true)
        console.log('Loading bookmarks for user:', user.email)
        
        // ✅ 안전한 데이터베이스 호출
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
        console.log('Bookmarks loaded successfully:', convertedBookmarks.length)
        
      } catch (error) {
        console.error('Failed to load bookmarks:', error)
        
        // 🚨 토큰 에러 구체적 처리
        if ((error as Error)?.message?.includes('No authorization token') || 
            (error as Error)?.message?.includes('JWT') || 
            (error as Error)?.message?.includes('authorization')) {
          console.error('Authorization token missing - user may need to re-login')
          // 선택적: 사용자에게 재로그인 안내
          // alert('Please sign in again to access your bookmarks.')
        }
        
        setBookmarks([])
      } finally {
        setIsLoading(false)
      }
    }

    loadBookmarks()
  }, [user]) // 🔧 user만 의존성으로 설정하여 무한루프 방지

  // 검색 및 필터링
  useEffect(() => {
    let filtered = bookmarks

    // 카테고리 필터
    if (selectedCategory === 'most-used') {
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

  // 🔒 인증되지 않은 사용자 처리
  if (!user) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          {/* AuthContext loading 처리 제거 - 로그인 여부는 user 상태만으로 판단 */}
          {false ? (
            <>
              {/* 로딩 스켈레톤 */}
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
            </>
          ) : (
            <div className="text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">&nbsp;</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Please sign in</h3>
              <p className="text-xs text-gray-500">Sign in to access your bookmarks</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 실제 북마크 데이터가 로딩 중인 경우
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
    <div className="flex-1">
      {/* 🎨 PERFECTION: Enhanced header */}
      <SearchHeader 
        title="Bookmarks"
        searchPlaceholder="Search bookmarks..."
        onSearch={setLocalSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actionButton={{
          label: "Add Bookmark",
          onClick: () => {
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
          },
          icon: "🔖"
        }}
      />
      
      {/* 🎨 PERFECTION: Filter pills */}
      <FilterPills 
        filters={categories}
        activeFilter={selectedCategory}
        onFilterChange={setSelectedCategory}
      />
      
      <div className="px-6 py-4">
        {/* 🎨 PERFECTION: Stats */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCategory === 'all' ? 'All saved websites' : `${categories.find(cat => cat.id === selectedCategory)?.label} bookmarks`}
                </p>
              </div>
              <div className="text-3xl">
                🔖
              </div>
            </div>
          </div>
        </div>

        {/* 🎨 PERFECTION: Enhanced content grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {bookmarks.length === 0 ? 'No bookmarks yet' : 'No bookmarks match your criteria'}
            </h3>
            <p className="text-gray-600 mb-6">
              {bookmarks.length === 0 
                ? 'Start saving your favorite websites'
                : 'Try adjusting your search or filter'
              }
            </p>
          </motion.div>
        ) : (
          <ContentGrid>
            {filteredBookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ContentCard
                  type="url"
                  title={bookmark.title}
                  description={bookmark.description}
                  thumbnail={bookmark.url}
                  metadata={{
                    domain: new URL(bookmark.url).hostname,
                    tags: bookmark.tags,
                    fileSize: bookmark.isFavorite ? '⭐ Favorite' : `Used ${bookmark.usageCount} times`
                  }}
                  onClick={() => window.open(bookmark.url, '_blank')}
                  size={viewMode === 'list' ? 'small' : 'medium'}
                  layout={viewMode}
                />
              </motion.div>
            ))}
          </ContentGrid>
        )}
      </div>
    </div>
  )
}