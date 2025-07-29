'use client'

import { useState, useEffect } from 'react'
import { linksService, videosService, imagesService, notesService } from '@/lib/supabase-services'
import { supabase } from '@/lib/supabase'

type ContentType = 'links' | 'videos' | 'images' | 'notes'

interface ContentItem {
  id: string
  type: ContentType
  title: string
  url?: string
  content?: string
  description?: string
  thumbnail?: string
  created_at: string
}

interface ContentManagerProps {
  className?: string
}

export default function ContentManager({ className = '' }: ContentManagerProps) {
  const [activeTab, setActiveTab] = useState<ContentType>('links')
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    url: '',
    content: '',
    description: ''
  })

  useEffect(() => {
    loadUserAndContent()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadContent(activeTab)
  }, [activeTab, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const getDummyContent = (type: ContentType): ContentItem | null => {
    const now = new Date().toISOString()
    
    switch (type) {
      case 'links':
        return {
          id: 'dummy-link',
          type: 'links',
          title: '유용한 웹사이트 모음',
          url: 'https://example.com',
          description: '북마크 예시입니다. 삭제 버튼으로 제거할 수 있습니다.',
          created_at: now
        }
      case 'videos':
        return {
          id: 'dummy-video',
          type: 'videos',
          title: '추천 영상',
          url: 'https://youtube.com/watch?v=example',
          created_at: now
        }
      case 'images':
        return {
          id: 'dummy-image',
          type: 'images',
          title: '저장된 이미지',
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
          description: '아름다운 풍경 사진입니다',
          created_at: now
        }
      case 'notes':
        return {
          id: 'dummy-note',
          type: 'notes',
          title: '메모 예시',
          content: '이곳에 중요한 메모를 저장할 수 있습니다. 삭제 기능으로 제거 가능합니다.',
          created_at: now
        }
      default:
        return null
    }
  }

  const loadUserAndContent = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      
      // Always load content (will load dummy content if user is null)
      await loadContent('links')
    } catch (error) {
      console.error('Failed to load user:', error)
      // Even on error, load dummy content
      await loadContent('links')
    }
  }

  const loadContent = async (type: ContentType) => {
    try {
      setLoading(true)
      let contentItems: ContentItem[] = []

      if (user) {
        // Load real data for logged-in users
        let data: unknown[] = []

        switch (type) {
          case 'links':
            data = await linksService.getAll(user.id)
            break
          case 'videos':
            data = await videosService.getAll(user.id)
            break
          case 'images':
            data = await imagesService.getAll(user.id)
            break
          case 'notes':
            data = await notesService.getAll(user.id)
            break
        }

        contentItems = data.map((item: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          id: item.id,
          type,
          title: item.title,
          url: item.url,
          content: item.content,
          description: item.description,
          thumbnail: item.thumbnail_url || item.thumbnail,
          created_at: item.created_at
        }))
      }

      // Add dummy content if empty (for both logged-in and non-logged-in users)
      let finalItems = contentItems
      if (contentItems.length === 0) {
        const dummyItem = getDummyContent(type)
        console.log(`Loading dummy content for ${type}:`, dummyItem)
        if (dummyItem) {
          finalItems = [dummyItem]
        }
      }

      console.log(`Final items for ${type}:`, finalItems)
      setItems(finalItems)
    } catch (error) {
      console.error(`Failed to load ${type}:`, error)
      // Fallback to dummy content on error
      const dummyItem = getDummyContent(type)
      if (dummyItem) {
        setItems([dummyItem])
      } else {
        setItems([])
      }
    } finally {
      setLoading(false)
    }
  }

  const addItem = async () => {
    if (!user || !newItem.title.trim()) return

    try {
      setLoading(true)
      // let savedItem: unknown

      switch (activeTab) {
        case 'links':
          if (!newItem.url.trim()) return
          await linksService.create({
            user_id: user.id,
            title: newItem.title.trim(),
            url: newItem.url.trim(),
            description: newItem.description.trim() || null
          })
          break
        case 'videos':
          if (!newItem.url.trim()) return
          await videosService.create({
            user_id: user.id,
            title: newItem.title.trim(),
            url: newItem.url.trim(),
            platform: newItem.url.includes('youtube') ? 'youtube' : 'other'
          })
          break
        case 'images':
          if (!newItem.url.trim()) return
          await imagesService.create({
            user_id: user.id,
            title: newItem.title.trim(),
            url: newItem.url.trim()
          })
          break
        case 'notes':
          if (!newItem.content.trim()) return
          await notesService.create({
            user_id: user.id,
            title: newItem.title.trim() || 'Untitled Note',
            content: newItem.content.trim()
          })
          break
      }

      // Refresh the list
      await loadContent(activeTab)

      // Reset form
      setNewItem({ title: '', url: '', content: '', description: '' })
      setIsAdding(false)
    } catch (error) {
      console.error(`Failed to add ${activeTab}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!user) return

    try {
      switch (activeTab) {
        case 'links':
          await linksService.delete(itemId)
          break
        case 'videos':
          await videosService.delete(itemId)
          break
        case 'images':
          await imagesService.delete(itemId)
          break
        case 'notes':
          await notesService.delete(itemId)
          break
      }

      // Remove from local state
      setItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error(`Failed to delete ${activeTab}:`, error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderItem = (item: ContentItem) => {
    return (
      <div key={item.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
        {/* 이미지 타입일 때 썸네일 표시 */}
        {item.type === 'images' && item.url && (
          <div className="mb-3">
            <img 
              src={item.url} 
              alt={item.title}
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        )}
        
        {/* 비디오 타입일 때 비디오 아이콘 표시 */}
        {item.type === 'videos' && (
          <div className="mb-3 flex items-center gap-2">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* 링크 타입일 때 링크 아이콘 표시 */}
        {item.type === 'links' && (
          <div className="mb-3 flex items-center gap-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* 노트 타입일 때 노트 아이콘 표시 */}
        {item.type === 'notes' && (
          <div className="mb-3 flex items-center gap-2">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{item.title}</h3>
            {item.url && item.type !== 'images' && (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm truncate block mt-1 cursor-pointer"
              >
                {item.url}
              </a>
            )}
            {item.content && (
              <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                {item.content}
              </p>
            )}
            {item.description && (
              <p className="text-gray-400 text-sm mt-1">
                {item.description}
              </p>
            )}
            <div className="text-gray-500 text-xs mt-2">
              {formatDate(item.created_at)}
            </div>
          </div>
          {user && (
            <button
              onClick={() => deleteItem(item.id)}
              className="text-gray-400 hover:text-red-400 p-1 transition-colors flex-shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderAddForm = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
        <h3 className="font-medium text-white mb-3">Add New {activeTab.slice(0, -1)}</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newItem.title}
            onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Title"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
          />
          
          {(activeTab === 'links' || activeTab === 'videos' || activeTab === 'images') && (
            <input
              type="url"
              value={newItem.url}
              onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
              placeholder="URL"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            />
          )}
          
          {activeTab === 'notes' && (
            <textarea
              value={newItem.content}
              onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Content"
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 resize-none"
            />
          )}
          
          {activeTab === 'links' && (
            <input
              type="text"
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            />
          )}
          
          <div className="flex gap-2">
            <button
              onClick={addItem}
              disabled={loading || !newItem.title.trim() || 
                ((activeTab === 'links' || activeTab === 'videos' || activeTab === 'images') && !newItem.url.trim()) ||
                (activeTab === 'notes' && !newItem.content.trim())
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Add {activeTab.slice(0, -1)}
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewItem({ title: '', url: '', content: '', description: '' })
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="section-title">Content Manager</h2>
          {!user && (
            <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
              Preview Mode
            </span>
          )}
        </div>
        {!isAdding && user && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer"
          >
            + Add Content
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 overflow-x-auto">
        {(['links', 'videos', 'images', 'notes'] as ContentType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {isAdding && user && renderAddForm()}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-gray-400">Loading {activeTab}...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No {activeTab} yet</div>
          {user ? (
            <div className="text-gray-500 text-sm">Add your first {activeTab.slice(0, -1)} to get started</div>
          ) : (
            <div className="text-gray-500 text-sm">Login to manage your {activeTab}</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  )
}