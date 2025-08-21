'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from '@/components/ui/BookmarkCard'
import { useAuth } from '@/components/auth/AuthProvider'
import { DatabaseService } from '@/lib/database'
import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Bookmarks({ 
  searchQuery = '',
  selectedFolderId 
}: { 
  searchQuery?: string
  selectedFolderId?: string
}) {
  const { user, signIn } = useAuth()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('most-used')
  const [isLoading, setIsLoading] = useState(true)
  const viewMode = 'grid'
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('')
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('')
  const [newBookmarkCategory, setNewBookmarkCategory] = useState('work')
  
  // 임시 북마크 폴더 데이터 (나중에 실제 데이터로 대체)
  const bookmarkFolders = [
    { id: '1', name: 'Development', count: 8, icon: '💻', color: '#3B82F6' },
    { id: '2', name: 'Design Resources', count: 12, icon: '🎨', color: '#EF4444' },
    { id: '3', name: 'Learning', count: 5, icon: '📚', color: '#10B981' },
    { id: '4', name: 'Tools & Utilities', count: 15, icon: '🛠️', color: '#F59E0B' },
    { id: '5', name: 'Entertainment', count: 6, icon: '🎬', color: '#8B5CF6' }
  ]
  
  const selectedFolder = bookmarkFolders.find(f => f.id === selectedFolderId)
  
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
    if (!user) {
      console.log('No user found, skipping bookmarks load')
      setIsLoading(false)
      setBookmarks([])
      return
    }

    const loadBookmarks = async () => {
      try {
        setIsLoading(true)
        console.log('Loading bookmarks for user:', user.email)
        
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
        
        if ((error as Error)?.message?.includes('No authorization token') || 
            (error as Error)?.message?.includes('JWT') || 
            (error as Error)?.message?.includes('authorization')) {
          console.error('Authorization token missing - user may need to re-login')
        }
        
        setBookmarks([])
      } finally {
        setIsLoading(false)
      }
    }

    loadBookmarks()
  }, [user])

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

    // 폴더 필터 (선택된 폴더가 있으면 해당 폴더의 북마크만 표시)
    if (selectedFolderId) {
      // 임시로 폴더 ID에 따라 북마크 필터링 (실제로는 DB에서 폴더별로 가져와야 함)
      const folderCategoryMap: { [key: string]: string } = {
        '1': 'tech',           // Development
        '2': 'personal',       // Design Resources  
        '3': 'education',      // Learning
        '4': 'work',           // Tools & Utilities
        '5': 'entertainment'   // Entertainment
      }
      const folderCategory = folderCategoryMap[selectedFolderId]
      if (folderCategory) {
        filtered = filtered.filter(bookmark => bookmark.category === folderCategory)
      }
    } else {
      // 폴더가 선택되지 않았으면 기본 카테고리 필터 적용
      if (selectedCategory === 'most-used') {
        filtered = filtered
          .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
          .slice(0, 10)
      } else if (selectedCategory !== 'all') {
        filtered = filtered.filter(bookmark => bookmark.category === selectedCategory)
      }
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
  }, [bookmarks, selectedCategory, selectedFolderId, searchQuery, localSearchQuery])

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

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      try {
        if (user) {
          await DatabaseService.deleteBookmark(bookmarkId)
        }
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
      } catch (error) {
        console.error('Failed to delete bookmark:', error)
        alert('Failed to delete bookmark')
      }
    }
  }

  const handleAddBookmark = async () => {
    if (!user) {
      alert('Please sign in to add bookmarks')
      return
    }

    if (!newBookmarkUrl.trim()) {
      alert('Please enter a URL')
      return
    }

    try {
      // Validate URL
      const validUrl = newBookmarkUrl.startsWith('http') ? newBookmarkUrl : `https://${newBookmarkUrl}`
      new URL(validUrl)

      // Create bookmark in database
      const bookmarkData = {
        url: validUrl,
        title: newBookmarkTitle.trim() || 'New Bookmark',
        description: '',
        category: newBookmarkCategory,
        tags: [],
        is_favorite: false
      }

      const dbBookmark = await DatabaseService.createBookmark(user.id, bookmarkData)
      
      // Add to local state
      const newBookmark: Bookmark = {
        id: dbBookmark.id,
        title: dbBookmark.title,
        url: dbBookmark.url,
        description: dbBookmark.description || '',
        favicon: (() => {
          try {
            const urlObj = new URL(validUrl)
            return `${urlObj.origin}/favicon.ico`
          } catch {
            return '/favicon-16x16.png'
          }
        })(),
        tags: dbBookmark.tags,
        createdAt: dbBookmark.created_at,
        updatedAt: dbBookmark.updated_at,
        category: dbBookmark.category || 'work',
        isFavorite: dbBookmark.is_favorite,
        usageCount: 0,
        lastUsedAt: dbBookmark.updated_at
      }

      setBookmarks(prev => [newBookmark, ...prev])
      
      // Reset form
      setNewBookmarkUrl('')
      setNewBookmarkTitle('')
      setNewBookmarkCategory('work')
      setShowAddModal(false)
      
      // Trigger bookmark added event
      window.dispatchEvent(new Event('bookmarkAdded'))
      
    } catch (error) {
      console.error('Failed to add bookmark:', error)
      alert('Please enter a valid URL')
    }
  }

  if (!user) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          {false ? (
            <>
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
                <span className="text-lg">🔖</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Sign in to save bookmarks</h3>
              <p className="text-xs text-gray-500 mb-4">Organize and access your saved websites from anywhere</p>
              <button
                onClick={signIn}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
              >
                <span>🚀</span>
                <span>Sign in</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
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
      {/* 헤더 - My Folder와 동일한 패턴 */}
      <div className="bg-white border-b border-gray-200 p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-gray-900">
              {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </h1>
            <p className="text-xs text-gray-500">
              {selectedFolder ? selectedFolder.name : 'My Bookmarks'}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 hover:bg-gray-100 rounded-md transition-all duration-150 active:scale-95 select-none"
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
              title={selectedFolder ? `Add bookmark to ${selectedFolder.name}` : "Add New Bookmark"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-4 py-2">
          {/* 필터 및 검색 영역 */}
          {!selectedFolder && (
            <div className="mb-6 space-y-4">
              {/* 검색바 */}
              <div className="relative max-w-sm">
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Search bookmarks..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* 카테고리 필터 */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 북마크 그리드 */}
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
              <div className="text-xl mb-3">{selectedFolder ? selectedFolder.icon : '🔖'}</div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {selectedFolder ? `No bookmarks in ${selectedFolder.name}` : 'No bookmarks yet'}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {selectedFolder ? `Add your first bookmark to ${selectedFolder.name}` : 'Save your favorite websites and organize them'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {filteredBookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg p-2.5 hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    {/* 썸네일/파비콘 */}
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                      {bookmark.favicon ? (
                        <img 
                          src={bookmark.favicon} 
                          alt=""
                          className="w-6 h-6"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="text-sm">🔗</span>';
                            }
                          }}
                        />
                      ) : (
                        <span className="text-sm">🔗</span>
                      )}
                    </div>
                    
                    {/* 콘텐츠 영역 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-medium text-gray-900 text-sm line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleOpenBookmark(bookmark)}
                          >
                            {bookmark.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {(() => {
                              try {
                                return new URL(bookmark.url.startsWith('http') ? bookmark.url : `https://${bookmark.url}`).hostname.replace('www.', '')
                              } catch {
                                return bookmark.url
                              }
                            })()}
                          </p>
                          {bookmark.description && (
                            <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                              {bookmark.description}
                            </p>
                          )}
                        </div>
                        
                        {/* 액션 버튼들 */}
                        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleFavorite(bookmark.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title={bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            <span className={`text-xs ${bookmark.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}>
                              ⭐
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteBookmark(bookmark.id)}
                            className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                            title="Delete bookmark"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      
                      {/* 메타데이터 */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {bookmark.category}
                        </span>
                        {bookmark.isFavorite && (
                          <span className="text-xs text-yellow-600">⭐ Favorite</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Bookmark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add New Bookmark
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={newBookmarkUrl}
                    onChange={(e) => setNewBookmarkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={newBookmarkTitle}
                    onChange={(e) => setNewBookmarkTitle(e.target.value)}
                    placeholder="Bookmark title..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newBookmarkCategory}
                    onChange={(e) => setNewBookmarkCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="social">Social</option>
                    <option value="shopping">Shopping</option>
                    <option value="education">Education</option>
                    <option value="tech">Technology</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBookmark}
                  className="flex-1 py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add Bookmark
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}