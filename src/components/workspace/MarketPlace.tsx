'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Download, Eye, Search, Filter, Star } from 'lucide-react'
import { SharedContent } from '@/types/core'

// Mock data for demo
const MOCK_SHARED_CONTENT: SharedContent[] = [
  {
    id: '1',
    originalContentId: 'content-1',
    title: 'Complete Web Development Resources',
    description: 'Curated collection of the best web development tutorials, tools, and resources for beginners and professionals.',
    category: 'learning',
    tags: ['webdev', 'programming', 'resources', 'tutorials'],
    authorId: 'user-1',
    authorName: 'DevMaster',
    isPublic: true,
    stats: { views: 1250, likes: 89, downloads: 234 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    originalContentId: 'content-2',
    title: 'Productivity Hacks Collection',
    description: 'Time-tested productivity techniques and tools that actually work. Boost your efficiency with these proven methods.',
    category: 'productivity',
    tags: ['productivity', 'efficiency', 'tools', 'habits'],
    authorId: 'user-2',
    authorName: 'ProductivityGuru',
    isPublic: true,
    stats: { views: 890, likes: 67, downloads: 145 },
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    originalContentId: 'content-3',
    title: 'Design System Resources',
    description: 'Essential resources for building consistent and scalable design systems. Perfect for designers and developers.',
    category: 'design',
    tags: ['design', 'ui', 'ux', 'systems', 'components'],
    authorId: 'user-3',
    authorName: 'DesignWizard',
    isPublic: true,
    stats: { views: 2100, likes: 156, downloads: 378 },
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-08T09:15:00Z'
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'learning', name: 'Learning' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'design', name: 'Design' },
  { id: 'business', name: 'Business' },
  { id: 'lifestyle', name: 'Lifestyle' },
  { id: 'tech', name: 'Technology' }
]

interface MarketPlaceProps {
  searchQuery?: string
}

export default function MarketPlace({ searchQuery = '' }: MarketPlaceProps) {
  const [sharedContent, setSharedContent] = useState<SharedContent[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'downloads'>('popular')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setSharedContent(MOCK_SHARED_CONTENT)
      setLoading(false)
    }
    
    loadData()
  }, [])

  const filteredContent = sharedContent
    .filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.stats.likes - a.stats.likes
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'downloads':
          return b.stats.downloads - a.stats.downloads
        default:
          return 0
      }
    })

  const handleImport = (item: SharedContent) => {
    // In a real app, this would import the content to user's workspace
    console.log('Importing:', item.title)
    alert(`"${item.title}" has been added to your workspace!`)
  }

  const handleLike = (itemId: string) => {
    // In a real app, this would make an API call
    setSharedContent(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, stats: { ...item.stats, likes: item.stats.likes + 1 } }
          : item
      )
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-secondary">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary mb-2">Market Place</h1>
        <p className="text-secondary">
          Discover and import curated content from the community
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input text-sm w-48"
          >
            {CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="input text-sm w-40"
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Most Recent</option>
            <option value="downloads">Most Downloaded</option>
          </select>
        </div>

        <div className="text-sm text-secondary">
          {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">No items found</h3>
          <p className="text-secondary">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map(item => (
            <SharedContentCard
              key={item.id}
              item={item}
              onImport={handleImport}
              onLike={handleLike}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SharedContentCard({ 
  item, 
  onImport, 
  onLike 
}: { 
  item: SharedContent
  onImport: (item: SharedContent) => void
  onLike: (itemId: string) => void
}) {
  return (
    <div className="content-card group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs px-2 py-1 bg-surface rounded-full capitalize text-secondary">
          {item.category}
        </span>
        <div className="flex items-center text-xs text-muted">
          <Eye className="w-3 h-3 mr-1" />
          {item.stats.views}
        </div>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-primary mb-2 line-clamp-2">
        {item.title}
      </h3>
      
      <p className="text-sm text-secondary line-clamp-3 mb-4">
        {item.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {item.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 bg-surface rounded text-muted"
          >
            #{tag}
          </span>
        ))}
        {item.tags.length > 3 && (
          <span className="text-xs text-muted">
            +{item.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted mb-4">
        <span>by {item.authorName}</span>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Heart className="w-3 h-3 mr-1" />
            {item.stats.likes}
          </div>
          <div className="flex items-center">
            <Download className="w-3 h-3 mr-1" />
            {item.stats.downloads}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onImport(item)}
          className="btn-primary flex-1 text-sm py-2"
        >
          Import
        </button>
        <button
          onClick={() => onLike(item.id)}
          className="btn-secondary p-2"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}