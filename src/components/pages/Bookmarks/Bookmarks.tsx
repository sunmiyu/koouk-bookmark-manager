'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from '@/components/ui/BookmarkCard'
import CategoryFilter from '@/components/ui/CategoryFilter'
import { useAuth } from '@/components/auth/AuthProvider'
import { DatabaseService } from '@/lib/database'
// 🎯 UNIFIED: Use single card component
import EnhancedContentCard, { ContentGrid } from '@/components/ui/EnhancedContentCard'
// FilterPills removed
import { motion } from 'framer-motion'

export default function Bookmarks({ searchQuery = '' }: { searchQuery?: string }) {
  const { user } = useAuth() // loading 의존성 제거
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('most-used')
  const [isLoading, setIsLoading] = useState(true)
  // 🎨 PERFECTION: Enhanced state
  // 🎨 MOBILE-FIRST: Default to list view on mobile, grid on desktop  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'list' : 'grid'
    }
    return 'grid'
  })
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)

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

  // Listen for bookmark added events
  useEffect(() => {
    const handleBookmarkAdded = () => {
      // Reload bookmarks when a new one is added
      if (user) {
        const loadBookmarks = async () => {
          try {
            const dbBookmarks = await DatabaseService.getUserBookmarks(user.id)
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
              usageCount: 0,
              lastUsedAt: dbBookmark.updated_at
            }))
            setBookmarks(convertedBookmarks)
          } catch (error) {
            console.error('Failed to reload bookmarks:', error)
          }
        }
        loadBookmarks()
      }
    }

    window.addEventListener('bookmarkAdded', handleBookmarkAdded)
    return () => window.removeEventListener('bookmarkAdded', handleBookmarkAdded)
  }, [user])

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

    // 검색 필터 (props searchQuery 또는 localSearchQuery 사용)
    const effectiveSearchQuery = localSearchQuery || searchQuery
    if (effectiveSearchQuery.trim()) {
      const query = effectiveSearchQuery.toLowerCase()
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description?.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredBookmarks(filtered)
  }, [bookmarks, selectedCategory, searchQuery, localSearchQuery])

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
    <div className="flex flex-col min-h-screen pb-20">
      {/* 📱 MOBILE-OPTIMIZED Header with search */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900">Bookmarks</h1>
            
            {/* 📱 Mobile search toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* View mode toggle - smaller on mobile */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 📱 Mobile search bar - shows when active */}
        {showMobileSearch && (
          <div className="mt-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                placeholder="Search bookmarks..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                onClick={() => {
                  setLocalSearchQuery('')
                  setShowMobileSearch(false)
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4">
        {/* 🎨 PERFECTION: Stats */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCategory === 'all' ? 'All saved websites' : `${categories.find(cat => cat.id === selectedCategory)?.label} bookmarks`}
                </p>
              </div>
              <div className="text-lg md:text-xl">
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
            <div className="text-2xl md:text-3xl mb-4">🔖</div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
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
          <ContentGrid layout={viewMode}>
            {filteredBookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <EnhancedContentCard
                  type="url"
                  title={bookmark.title}
                  description={bookmark.description}
                  thumbnail={bookmark.thumbnail}
                  url={bookmark.url}
                  metadata={{
                    domain: new URL(bookmark.url).hostname.replace('www.', ''),
                    tags: bookmark.tags,
                    fileSize: bookmark.isFavorite ? '⭐ Favorite' : `Used ${bookmark.usageCount} times`,
                    platform: bookmark.category
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
      
      {/* 📱 MOBILE: Floating Add Bookmark Button */}
      <div className="fixed bottom-4 right-4 md:hidden z-40">
        <button
          onClick={() => {
            // Simple mobile-friendly bookmark input (could be replaced with modal)
            const url = prompt('🔗 Enter URL (e.g., https://example.com):')
            if (url && url.trim()) {
              try {
                new URL(url.trim()) // Validate URL
                const title = prompt('🏷️ Enter title (optional):') || 'New Bookmark'
                
                const newBookmark: Bookmark = {
                  id: Date.now().toString(),
                  title: title.trim(),
                  url: url.trim(),
                  description: '',
                  favicon: `${new URL(url.trim()).origin}/favicon.ico`,
                  tags: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  category: 'work',
                  isFavorite: false,
                  usageCount: 0,
                  lastUsedAt: new Date().toISOString()
                }
                setBookmarks(prev => [newBookmark, ...prev])
              } catch {
                alert('⚠️ Please enter a valid URL (e.g., https://example.com)')
              }
            }
          }}
          className="w-14 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}