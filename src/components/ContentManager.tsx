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
    if (user) {
      loadContent(activeTab)
    }
  }, [activeTab, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserAndContent = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      
      if (authUser) {
        await loadContent('links')
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }

  const loadContent = async (type: ContentType) => {
    if (!user) return

    try {
      setLoading(true)
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

      const contentItems: ContentItem[] = data.map((item: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: item.id,
        type,
        title: item.title,
        url: item.url,
        content: item.content,
        description: item.description,
        thumbnail: item.thumbnail_url || item.thumbnail,
        created_at: item.created_at
      }))

      setItems(contentItems)
    } catch (error) {
      console.error(`Failed to load ${type}:`, error)
      setItems([])
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
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{item.title}</h3>
            {item.url && (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm truncate block mt-1"
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
          <button
            onClick={() => deleteItem(item.id)}
            className="text-gray-400 hover:text-red-400 p-1 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {activeTab.slice(0, -1)}
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewItem({ title: '', url: '', content: '', description: '' })
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">Content Management</div>
          <div className="text-gray-500 text-sm">Please log in to manage your content</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Content Manager</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
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
            className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
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
      {isAdding && renderAddForm()}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-gray-400">Loading {activeTab}...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No {activeTab} yet</div>
          <div className="text-gray-500 text-sm">Add your first {activeTab.slice(0, -1)} to get started</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  )
}