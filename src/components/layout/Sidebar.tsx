'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Plus, Search, LogOut } from 'lucide-react'
import { FolderItem } from '@/types/folder'
import { useAuth } from '@/components/auth/AuthProvider'
import { DatabaseService } from '@/lib/database'

interface SidebarProps {
  activeTab: 'storage' | 'bookmarks' | 'marketplace'
  onTabChange: (tab: 'storage' | 'bookmarks' | 'marketplace') => void
  folders?: FolderItem[]
  selectedFolderId?: string
  onFolderSelect?: (folderId: string) => void
  onCreateFolder?: () => void
  onFolderReorder?: (reorderedFolders: FolderItem[]) => void // 🎯 폴더 순서 변경 콜백
  // Marketplace view state
  marketplaceView?: 'marketplace' | 'my-shared'
  onMarketplaceViewChange?: (view: 'marketplace' | 'my-shared') => void
}

export default function Sidebar({
  activeTab,
  onTabChange,
  folders = [],
  selectedFolderId,
  onFolderSelect,
  onCreateFolder,
  onFolderReorder,
  marketplaceView,
  onMarketplaceViewChange
}: SidebarProps) {
  const { user, signOut } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false)
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('')
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('')
  
  // 카테고리 편집 관련 state - 각 카테고리별 더미 URL 2개씩 포함
  const [bookmarkCategories, setBookmarkCategories] = useState([
    { 
      id: 'all', 
      emoji: '📋', 
      label: 'All Categories', 
      count: 10, // 전체 북마크 수 (5개 카테고리 × 2개씩)
      isEditable: false,
      urls: [] // All Categories는 모든 URL을 보여주므로 별도 저장 안함
    },
    { 
      id: 'work', 
      emoji: '💼', 
      label: 'Work', 
      count: 2, 
      isEditable: true,
      urls: [
        { title: 'Slack - Team Communication', url: 'https://slack.com' },
        { title: 'Notion - Project Management', url: 'https://notion.so' }
      ]
    },
    { 
      id: 'design', 
      emoji: '🎨', 
      label: 'Design', 
      count: 2, 
      isEditable: true,
      urls: [
        { title: 'Figma - Design Tool', url: 'https://figma.com' },
        { title: 'Dribbble - Design Inspiration', url: 'https://dribbble.com' }
      ]
    },
    { 
      id: 'development', 
      emoji: '💻', 
      label: 'Development', 
      count: 2, 
      isEditable: true,
      urls: [
        { title: 'GitHub - Code Repository', url: 'https://github.com' },
        { title: 'Stack Overflow - Developer Q&A', url: 'https://stackoverflow.com' }
      ]
    },
    { 
      id: 'learning', 
      emoji: '📚', 
      label: 'Learning', 
      count: 2, 
      isEditable: true,
      urls: [
        { title: 'Coursera - Online Courses', url: 'https://coursera.org' },
        { title: 'Khan Academy - Free Learning', url: 'https://khanacademy.org' }
      ]
    },
    { 
      id: 'entertainment', 
      emoji: '🎵', 
      label: 'Entertainment', 
      count: 2, 
      isEditable: true,
      urls: [
        { title: 'YouTube - Video Platform', url: 'https://youtube.com' },
        { title: 'Spotify - Music Streaming', url: 'https://spotify.com' }
      ]
    }
  ])
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('📁')
  
  // 🎯 Drag & Drop state for folder reordering
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartTime, setDragStartTime] = useState<number | null>(null)
  const [hasActuallyDragged, setHasActuallyDragged] = useState(false)

  // Add bookmark handler
  const handleAddBookmark = async () => {
    if (!user?.id) {
      alert('Please sign in to add bookmarks')
      return
    }
    
    const bookmarkUrl = newBookmarkUrl.trim()
    const bookmarkTitle = newBookmarkTitle.trim()
    
    if (!bookmarkUrl) {
      alert('Please enter a URL')
      return
    }
    
    // URL 유효성 검사
    try {
      new URL(bookmarkUrl.startsWith('http') ? bookmarkUrl : `https://${bookmarkUrl}`)
    } catch {
      alert('Please enter a valid URL')
      return
    }
    
    try {
      console.log('Creating bookmark:', { url: bookmarkUrl, title: bookmarkTitle })
      
      // Create bookmark in database
      const createdBookmark = await DatabaseService.createBookmark(user.id, {
        url: bookmarkUrl.startsWith('http') ? bookmarkUrl : `https://${bookmarkUrl}`,
        title: bookmarkTitle || 'Untitled Bookmark',
        description: '',
        category: 'work',
        tags: [],
        is_favorite: false,
        sort_order: 0
      })
      
      console.log('Bookmark created successfully:', createdBookmark)
      
      // Reset form and close modal
      setNewBookmarkUrl('')
      setNewBookmarkTitle('')
      setShowAddBookmarkModal(false)
      
      // Trigger bookmark refresh event
      window.dispatchEvent(new CustomEvent('bookmarkAdded'))
      
      // Show success toast instead of console.log
      alert('Bookmark added successfully!')
    } catch (error) {
      console.error('Failed to add bookmark:', error)
      alert(`Failed to add bookmark: ${error.message || 'Please try again.'}`)
    }
  }

  // 카테고리 편집 핸들러들
  const handleCategoryDoubleClick = (category: any) => {
    if (!category.isEditable) return
    setEditingCategoryId(category.id)
    setEditingCategoryName(category.label)
  }

  const handleCategoryNameSave = () => {
    if (!editingCategoryName.trim()) return
    
    setBookmarkCategories(categories => 
      categories.map(cat => 
        cat.id === editingCategoryId 
          ? { ...cat, label: editingCategoryName.trim() }
          : cat
      )
    )
    setEditingCategoryId(null)
    setEditingCategoryName('')
  }

  const handleCategoryNameCancel = () => {
    setEditingCategoryId(null)
    setEditingCategoryName('')
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    
    const newCategory = {
      id: Date.now().toString(),
      emoji: newCategoryEmoji,
      label: newCategoryName.trim(),
      count: 0,
      isEditable: true,
      urls: [] // 새 카테고리는 빈 URL 배열로 시작
    }
    
    setBookmarkCategories(categories => [...categories, newCategory])
    setNewCategoryName('')
    setNewCategoryEmoji('📁')
    setShowAddCategoryModal(false)
  }

  // 🎯 Drag & Drop handlers for folder reordering
  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    console.log('🎯 Drag start:', folderId)
    setDraggedFolder(folderId)
    setIsDragging(true)
    setDragStartTime(Date.now())
    setHasActuallyDragged(false)
    
    // 드래그 이미지 설정 (선택사항)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', folderId)
  }

  const handleDrag = (e: React.DragEvent) => {
    // 실제로 드래그가 시작되었음을 표시 (마우스 이동 감지)
    if (!hasActuallyDragged) {
      setHasActuallyDragged(true)
    }
  }

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    if (draggedFolder && draggedFolder !== folderId) {
      setDragOverFolder(folderId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // 드래그가 완전히 컨테이너를 벗어났을 때만 dragOver 상태 제거
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverFolder(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault()
    console.log('🎯 Drop:', draggedFolder, '->', targetFolderId)
    
    // 방어 로직 1: 드래그 시간이 너무 짧으면 취소 (실수 방지)
    const dragDuration = Date.now() - (dragStartTime || 0)
    const MIN_DRAG_TIME = 500 // 500ms 이상 드래그해야 함
    
    // 방어 로직 2: 실제로 드래그 동작이 있었는지 확인
    if (dragDuration < MIN_DRAG_TIME || !hasActuallyDragged) {
      console.log('🚫 Drag cancelled: too quick or no movement')
      resetDragState()
      return
    }
    
    if (draggedFolder && draggedFolder !== targetFolderId) {
      // 폴더 순서 변경 로직
      reorderFolders(draggedFolder, targetFolderId)
    }
    
    resetDragState()
  }

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('🎯 Drag end')
    resetDragState()
  }

  const resetDragState = () => {
    setDraggedFolder(null)
    setDragOverFolder(null)
    setIsDragging(false)
    setDragStartTime(null)
    setHasActuallyDragged(false)
  }

  const reorderFolders = async (sourceId: string, targetId: string) => {
    if (!folders || folders.length === 0) return
    
    const newFolders = [...folders]
    const sourceIndex = newFolders.findIndex(f => f.id === sourceId)
    const targetIndex = newFolders.findIndex(f => f.id === targetId)
    
    if (sourceIndex === -1 || targetIndex === -1) return
    
    // 배열에서 source 폴더를 제거하고 target 위치에 삽입
    const [draggedItem] = newFolders.splice(sourceIndex, 1)
    newFolders.splice(targetIndex, 0, draggedItem)
    
    try {
      // 🎯 폴더 순서 업데이트
      if (onFolderReorder) {
        // 부모 컴포넌트에서 폴더 순서 관리하는 경우
        onFolderReorder(newFolders)
      } else {
        // 직접 데이터베이스 업데이트 (향후 구현 가능)
        // 현재는 sort_order 필드를 업데이트할 수 있음
        if (user?.id) {
          // newFolders 배열의 인덱스를 sort_order로 사용
          const updatePromises = newFolders.map((folder, index) => 
            DatabaseService.updateFolder(folder.id, { sort_order: index })
          )
          await Promise.all(updatePromises)
        }
      }
      
      console.log('✅ Folders reordered:', sourceId, '->', targetId)
      
      // 성공 피드백 (alert 대신 더 부드러운 알림)
      const toastElement = document.createElement('div')
      toastElement.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce'
      toastElement.textContent = `"${draggedItem.name}" moved successfully! ✅`
      document.body.appendChild(toastElement)
      
      setTimeout(() => {
        document.body.removeChild(toastElement)
      }, 3000)
      
    } catch (error) {
      console.error('❌ Failed to reorder folders:', error)
      
      // 에러 피드백
      const errorToast = document.createElement('div')
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      errorToast.textContent = 'Failed to reorder folders. Please try again.'
      document.body.appendChild(errorToast)
      
      setTimeout(() => {
        document.body.removeChild(errorToast)
      }, 3000)
    }
  }

  // 🎨 PERFECTION FIX: Add proper icons for visual clarity
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'storage': return '📁' // Folder icon
      case 'bookmarks': return '🔖' // Bookmark icon  
      case 'marketplace': return '🎆' // Marketplace icon
      default: return '📁'
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'url': return '🔗'
      case 'image': return '🖼️'
      case 'video': return '📺'
      case 'document': return '📄'
      case 'memo': return '📝'
      default: return '📄'
    }
  }

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      
      {/* 상단 브랜드 헤더 */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onTabChange('storage')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <h1 className="text-sm font-semibold text-gray-900">
              KOOUK
            </h1>
          </button>
          <div className="text-xs text-gray-500">
            Personal Hub
          </div>
        </div>
      </div>

      {/* 🎚️ 탭 선택 - 책갈피 스타일 */}
      <div className="px-2 py-4 border-b border-gray-200">
        <div className="flex gap-0.5">
          <button 
            onClick={() => onTabChange('storage')}
            className={`flex-1 relative group min-w-0 ${
              activeTab === 'storage' ? 'z-10' : ''
            }`}
          >
            <div className={`rounded-t-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 flex items-center justify-center ${
              activeTab === 'storage'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}>
              <span className="truncate">My Folder</span>
            </div>
            {activeTab === 'storage' && (
              <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-gray-900 rounded-t-lg"></div>
            )}
          </button>
          
          <button 
            onClick={() => onTabChange('bookmarks')}
            className={`flex-1 rounded-t-lg px-3 py-2.5 text-xs font-medium transition-colors flex items-center justify-center min-w-0 ${
              activeTab === 'bookmarks'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="truncate">Bookmarks</span>
          </button>
          
          <button 
            onClick={() => onTabChange('marketplace')}
            className={`flex-1 rounded-t-lg px-3 py-2.5 text-xs font-medium transition-colors flex items-center justify-center min-w-0 ${
              activeTab === 'marketplace'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="truncate">Market Place</span>
          </button>
        </div>
      </div>

      {/* 🎯 사이드바 단순화 - 모바일 최적화 */}
      <div className="flex-1"></div>

      {/* 👤 하단 계정 버튼 (간단화) */}
      <div className="flex-shrink-0 p-2 border-t border-gray-200 bg-white">
        {user ? (
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-xs">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs font-medium text-gray-900 truncate">
                {user.user_metadata?.name || user.email?.split('@')[0]}
              </div>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        ) : (
          <div className="text-center py-2">
            <div className="text-xs text-gray-500">Please sign in</div>
          </div>
        )}
      </div>

      {/* Add Bookmark Modal */}
      {showAddBookmarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Add New Bookmark
              </h3>
              
              <div className="space-y-4">
                <input
                  type="url"
                  value={newBookmarkUrl}
                  onChange={(e) => setNewBookmarkUrl(e.target.value)}
                  placeholder="Enter URL (e.g., https://example.com)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                
                <input
                  type="text"
                  value={newBookmarkTitle}
                  onChange={(e) => setNewBookmarkTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBookmark()}
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddBookmarkModal(false)
                    setNewBookmarkUrl('')
                    setNewBookmarkTitle('')
                  }}
                  className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBookmark}
                  className="flex-1 py-2.5 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Sign out?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You'll need to sign in again to access your folders.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOut()
                    setShowLogoutConfirm(false)
                  } catch (error) {
                    console.error('Sign out failed:', error)
                  }
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Add New Category
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Shopping, Sports, etc."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCategoryEmoji}
                    onChange={(e) => setNewCategoryEmoji(e.target.value)}
                    placeholder="📁"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={2}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddCategoryModal(false)
                    setNewCategoryName('')
                    setNewCategoryEmoji('📁')
                  }}
                  className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 py-2.5 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}