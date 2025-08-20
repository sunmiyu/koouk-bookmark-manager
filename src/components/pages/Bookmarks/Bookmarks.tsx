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
  // 기본 그리드 뷰로 고정
  const viewMode = 'grid'
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
          favicon: (() => {
            try {
              const validUrl = new URL(dbBookmark.url.startsWith('http') ? dbBookmark.url : `https://${dbBookmark.url}`)
              return `${validUrl.origin}/favicon.ico`
            } catch {
              return '/favicon-16x16.png' // 기본 파비콘 사용
            }
          })(),
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
              favicon: (() => {
            try {
              const validUrl = new URL(dbBookmark.url.startsWith('http') ? dbBookmark.url : `https://${dbBookmark.url}`)
              return `${validUrl.origin}/favicon.ico`
            } catch {
              return '/favicon-16x16.png' // 기본 파비콘 사용
            }
          })(),
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
    <div className="flex flex-col h-full">
      {/* 🎯 모바일 최적화 헤더 */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* 🎯 카테고리 드롭다운 */}
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
            {/* 검색 버튼 */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
              title="Search"
            >
              🔍
            </button>
            
            {/* 새 북마크 버튼 */}
            <button
              onClick={() => {
                const url = prompt('🔗 Enter URL:')
                if (url && url.trim()) {
                  try {
                    new URL(url.trim())
                    const title = prompt('🏷️ Enter title (optional):') || 'New Bookmark'
                    
                    const newBookmark: Bookmark = {
                      id: Date.now().toString(),
                      title: title.trim(),
                      url: url.trim(),
                      description: '',
                      favicon: (() => {
                        try {
                          const validUrl = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`)
                          return `${validUrl.origin}/favicon.ico`
                        } catch {
                          return '/favicon-16x16.png'
                        }
                      })(),
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
                    alert('⚠️ Please enter a valid URL')
                  }
                }
              }}
              className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
              title="Add bookmark"
            >
              ➕
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
                placeholder="Search bookmarks..."
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
        {/* 🎯 바로 콘텐츠 카드들만 표시 - 중복 제목/설명 제거 */}
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-xl mb-3">🔖</div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                No bookmarks yet
              </h3>
              <button
                onClick={() => {
                  const url = prompt('🔗 Enter URL:')
                  if (url && url.trim()) {
                    try {
                      new URL(url.trim())
                      const title = prompt('🏷️ Enter title:') || 'New Bookmark'
                      
                      const newBookmark: Bookmark = {
                        id: Date.now().toString(),
                        title: title.trim(),
                        url: url.trim(),
                        description: '',
                        favicon: (() => {
                        try {
                          const validUrl = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`)
                          return `${validUrl.origin}/favicon.ico`
                        } catch {
                          return '/favicon-16x16.png'
                        }
                      })(),
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
                      alert('⚠️ Please enter a valid URL')
                    }
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <span>🔖</span>
                <span>Add First Bookmark</span>
              </button>
            </motion.div>
          ) : (
            /* 🎯 바로 콘텐츠 카드들만 표시 - 중복 제목 제거 */
            <ContentGrid layout={viewMode}>
              {filteredBookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <EnhancedContentCard
                    type="url"
                    title={bookmark.title}
                    description={bookmark.description}
                    thumbnail={bookmark.thumbnail}
                    url={bookmark.url}
                    metadata={{
                      domain: (() => {
                        try {
                          return new URL(bookmark.url.startsWith('http') ? bookmark.url : `https://${bookmark.url}`).hostname.replace('www.', '')
                        } catch {
                          return 'invalid-url'
                        }
                      })(),
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
      </div>
    </div>
  )
}