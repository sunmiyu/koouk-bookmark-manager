'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/components/LandingPage'
import LoadingSpinner from '@/components/LoadingSpinner'
import BigNoteCard from '@/components/cards/BigNoteCard'
import QuickNoteCard from '@/components/cards/QuickNoteCard'
import BigNoteModal from '@/components/modals/BigNoteModal'
import QuickNoteModal from '@/components/modals/QuickNoteModal'
import SimpleToast, { useSimpleToast } from '@/components/SimpleToast'
import { storageUtils } from '@/utils/storage'

// 새로운 데이터 타입 정의
export type StorageItemType = 'url' | 'image' | 'video' | 'big_note' | 'quick_note' | 'restaurant' | 'travel'

export type StorageItem = {
  id: string
  type: StorageItemType
  title: string
  content: string
  url?: string
  thumbnail?: string
  tags: string[]
  description?: string
  createdAt: string
  updatedAt: string
  wordCount?: number // BigNote용 단어 수
}

function HomeContent() {
  // 인증 상태
  const { user, loading: authLoading } = useAuth()
  const isAuthenticated = !!user

  // 앱 상태
  const [storageItems, setStorageItems] = useState<StorageItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<StorageItemType | 'all'>('all')
  const [isLoading, setIsLoading] = useState(false)
  
  // 모달 상태
  const [bigNoteModalOpen, setBigNoteModalOpen] = useState(false)
  const [quickNoteModalOpen, setQuickNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<StorageItem | null>(null)
  
  // Toast
  const { toast, showToast, hideToast } = useSimpleToast()

  // 초기 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      const items = storageUtils.loadItems()
      setStorageItems(items)
    }
  }, [isAuthenticated])

  // 검색 필터링된 아이템들
  const filteredItems = storageItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter
    
    return matchesSearch && matchesFilter
  })

  // 새 아이템 추가
  const addStorageItem = (item: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newItem = storageUtils.addItem(item)
      setStorageItems(prev => [newItem, ...prev])
      showToast('Saved successfully!', 'success')
    } catch (error) {
      console.error('Failed to add item:', error)
      showToast('Failed to save item', 'error')
    }
  }

  // 아이템 업데이트
  const updateStorageItem = (id: string, updates: Partial<Omit<StorageItem, 'id' | 'createdAt'>>) => {
    try {
      const updatedItem = storageUtils.updateItem(id, updates)
      if (updatedItem) {
        setStorageItems(prev => prev.map(item => item.id === id ? updatedItem : item))
        showToast('Updated successfully!', 'success')
      }
    } catch (error) {
      console.error('Failed to update item:', error)
      showToast('Failed to update item', 'error')
    }
  }

  // 아이템 삭제
  const deleteStorageItem = (id: string) => {
    try {
      const success = storageUtils.deleteItem(id)
      if (success) {
        setStorageItems(prev => prev.filter(item => item.id !== id))
        showToast('Deleted successfully!', 'success')
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      showToast('Failed to delete item', 'error')
    }
  }

  // 편집 모드 시작
  const startEditing = (item: StorageItem) => {
    setEditingNote(item)
    if (item.type === 'big_note') {
      setBigNoteModalOpen(true)
    } else if (item.type === 'quick_note') {
      setQuickNoteModalOpen(true)
    }
  }

  // 모달 닫기
  const closeModals = () => {
    setBigNoteModalOpen(false)
    setQuickNoteModalOpen(false)
    setEditingNote(null)
  }

  // Note 저장/업데이트
  const handleNoteSave = (noteData: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      updateStorageItem(editingNote.id, noteData)
    } else {
      addStorageItem(noteData)
    }
  }

  // URL 붙여넣기 처리
  const handlePaste = async (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    
    if (pastedText && isValidUrl(pastedText)) {
      setIsLoading(true)
      try {
        const metadata = await storageUtils.extractUrlMetadata(pastedText)
        
        addStorageItem({
          type: metadata.type,
          title: metadata.title,
          content: pastedText,
          url: pastedText,
          thumbnail: metadata.thumbnail,
          tags: metadata.tags,
          description: metadata.description
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  // URL 유효성 검사
  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  // 이미지 업로드 처리
  const handleImageUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          addStorageItem({
            type: 'image',
            title: file.name,
            content: result,
            thumbnail: result,
            tags: ['upload', 'image'],
            description: `Uploaded image: ${file.name}`
          })
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // 드래그앤드롭 이벤트
  const [isDragging, setIsDragging] = useState(false)
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageUpload(files)
    }
  }

  // 인증 로딩
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading KOOUK..." />
      </div>
    )
  }

  // 비인증 사용자
  if (!isAuthenticated) {
    return <LandingPage />
  }

  return (
    <div 
      className="min-h-screen relative" 
      style={{ backgroundColor: 'var(--bg-primary)' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-40 bg-blue-500 bg-opacity-20 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-2xl">
            <div className="text-6xl mb-4">⚫</div>
            <h3 className="text-xl font-semibold mb-2">Drop images here</h3>
            <p className="text-gray-600">Release to upload your images</p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-10" style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <h1 style={{ 
                fontSize: 'var(--text-xl)', 
                fontWeight: '300', 
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}>
                koouk
              </h1>
              <span style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
                padding: '0.125rem 0.5rem',
                borderRadius: 'var(--radius-full)'
              }}>
                {storageItems.length} items
              </span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <input
                type="text"
                placeholder="Search everything... (Ctrl+V to paste URL)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPaste={handlePaste}
                className="w-full transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-primary)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                }}
              />
            </div>

            {/* Add Buttons & User Menu */}
            <div className="flex items-center gap-3">
              {isLoading && <LoadingSpinner size="sm" />}
              
              {/* Add New Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setBigNoteModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span>⚫</span> Document
                </button>
                <button
                  onClick={() => setQuickNoteModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span>⚫</span> Memo
                </button>
                <label className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span>⚫</span> Image
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xs">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
            {([
              { key: 'all', icon: '⚫', label: 'All' },
              { key: 'url', icon: '⚫', label: 'Links' },
              { key: 'video', icon: '⚫', label: 'Videos' },
              { key: 'image', icon: '⚫', label: 'Images' },
              { key: 'big_note', icon: '⚫', label: 'Documents' },
              { key: 'quick_note', icon: '⚫', label: 'Memos' },
              { key: 'restaurant', icon: '⚫', label: 'Food' },
              { key: 'travel', icon: '⚫', label: 'Travel' }
            ] as const).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className="transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap"
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: activeFilter === key ? 'var(--text-primary)' : 'var(--bg-card)',
                  color: activeFilter === key ? 'var(--bg-card)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: '500'
                }}
              >
                <span style={{ fontSize: '10px' }}>{icon}</span>
                {label}
                {key !== 'all' && (
                  <span className="ml-1 opacity-70">
                    {storageItems.filter(item => item.type === key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Empty State */}
        {storageItems.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚫</div>
            <h2 style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: '500', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)'
            }}>
              Your storage is empty
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: 'var(--text-base)',
              marginBottom: 'var(--space-6)'
            }}>
              Paste URLs (Ctrl+V), drag images, or create notes to get started
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto text-xs">
              <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-light)' }}>
                ⚫ YouTube
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-light)' }}>
                ⚫ Instagram
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-light)' }}>
                ⚫ Websites
              </div>
              <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-light)' }}>
                ⚫ Notes
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-6">
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: 'var(--text-sm)'
            }}>
              Found {filteredItems.length} results for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Items Grid - Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            // Big Note와 Quick Note는 전용 컴포넌트 사용
            if (item.type === 'big_note') {
              return (
                <BigNoteCard
                  key={item.id}
                  note={item}
                  onEdit={() => startEditing(item)}
                  onDelete={deleteStorageItem}
                />
              )
            }
            
            if (item.type === 'quick_note') {
              return (
                <QuickNoteCard
                  key={item.id}
                  note={item}
                  onEdit={() => startEditing(item)}
                  onDelete={deleteStorageItem}
                />
              )
            }

            // 기타 아이템들은 기본 카드 사용 (흑백 아이콘)
            const getTypeIcon = (type: StorageItemType) => {
              switch (type) {
                case 'url': return '⚫'
                case 'video': return '⚫'
                case 'image': return '⚫'
                case 'restaurant': return '⚫'
                case 'travel': return '⚫'
                default: return '⚫'
              }
            }

            const getTypeLabel = (type: StorageItemType) => {
              switch (type) {
                case 'url': return 'Link'
                case 'video': return 'Video'
                case 'image': return 'Image'
                case 'restaurant': return 'Food'
                case 'travel': return 'Travel'
                default: return type
              }
            }

            return (
              <div
                key={item.id}
                className="group relative rounded-lg border transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-light)',
                  borderRadius: '16px'
                }}
              >
                {/* Thumbnail */}
                {item.thumbnail && (
                  <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '12px' }}>{getTypeIcon(item.type)}</span>
                      <span className="px-2 py-1 text-xs rounded-full" style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)'
                      }}>
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => deleteStorageItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                      style={{ color: '#EF4444' }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <h3 className="font-medium mb-2 line-clamp-2" style={{ 
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs line-clamp-2 mb-3" style={{ 
                      color: 'var(--text-secondary)' 
                    }}>
                      {item.description}
                    </p>
                  )}

                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded"
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs" style={{ 
                    color: 'var(--text-muted)' 
                  }}>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Open →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* No Search Results */}
        {searchQuery && filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⚫</div>
            <h3 style={{ 
              fontSize: 'var(--text-lg)', 
              fontWeight: '500', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)'
            }}>
              No results found
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search or filter
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      <BigNoteModal 
        isOpen={bigNoteModalOpen}
        onClose={closeModals}
        onSave={handleNoteSave}
        editNote={editingNote?.type === 'big_note' ? editingNote : null}
      />
      
      <QuickNoteModal 
        isOpen={quickNoteModalOpen}
        onClose={closeModals}
        onSave={handleNoteSave}
        editNote={editingNote?.type === 'quick_note' ? editingNote : null}
      />

      {/* Toast */}
      <SimpleToast 
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={hideToast}
      />
    </div>
  )
}

export default function Home() {
  return <HomeContent />
}