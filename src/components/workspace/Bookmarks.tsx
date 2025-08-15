'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Plus
} from 'lucide-react'
import BookmarkCard, { Bookmark } from '../ui/BookmarkCard'
import CategoryFilter from '../ui/CategoryFilter'
import { useAuth } from '../auth/AuthContext'
import { DatabaseService } from '@/lib/database'

export default function Bookmarks({ searchQuery = '' }: { searchQuery?: string }) {
  const { user, loading } = useAuth() // 🔧 loading 추가
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

  // 데이터베이스에서 북마크 로드 - 개선된 버전
  useEffect(() => {
    // 🔒 핵심: 사용자 인증 및 로딩 상태 체크
    if (!user) {
      console.log('👤 No user found, skipping bookmarks load')
      setIsLoading(false)
      setBookmarks([])
      return
    }

    if (loading) {
      console.log('⏳ Auth still loading, waiting for bookmarks...')
      return
    }

    const loadBookmarks = async () => {
      try {
        setIsLoading(true)
        console.log('📚 Loading bookmarks for user:', user.email)
        
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
        console.log('✅ Bookmarks loaded successfully:', convertedBookmarks.length)
        
      } catch (error) {
        console.error('❌ Failed to load bookmarks:', error)
        
        // 🚨 토큰 에러 구체적 처리
        if (error.message?.includes('No authorization token') || 
            error.message?.includes('JWT') || 
            error.message?.includes('authorization')) {
          console.error('🚨 Authorization token missing - user may need to re-login')
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

  // 🔒 로딩 또는 인증되지 않은 사용자 처리
  if (loading || !user) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          {loading ? (
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
                <Search className="w-6 h-6 text-gray-400" />
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