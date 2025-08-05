'use client'

import { useState } from 'react'
import { useContent } from '@/contexts/ContentContext'
import InfoInputSection from '@/components/InfoInputSection'
import LinkSection from '@/components/LinkSection'
import VideoSection from '@/components/VideoSection'
import NotesSection from '@/components/NotesSection'
import ImageSection from '@/components/ImageSection'

type CategoryType = 'links' | 'images' | 'videos' | 'notes'

export default function SimpleStorageContent() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('links')
  const { links, videos, notes, images } = useContent()

  const categories = [
    { 
      id: 'links' as CategoryType, 
      label: 'Links', 
      icon: '🔗', 
      count: links.length,
      color: 'text-blue-400 border-blue-400/30 bg-blue-600/10'
    },
    { 
      id: 'images' as CategoryType, 
      label: 'Images', 
      icon: '🖼️', 
      count: images.length,
      color: 'text-green-400 border-green-400/30 bg-green-600/10'
    },
    { 
      id: 'videos' as CategoryType, 
      label: 'Videos', 
      icon: '🎥', 
      count: videos.length,
      color: 'text-red-400 border-red-400/30 bg-red-600/10'
    },
    { 
      id: 'notes' as CategoryType, 
      label: 'Notes', 
      icon: '📝', 
      count: notes.length,
      color: 'text-purple-400 border-purple-400/30 bg-purple-600/10'
    }
  ]

  const renderContent = () => {
    switch (activeCategory) {
      case 'links':
        return <LinkSection />
      case 'images':
        return <ImageSection />
      case 'videos':
        return <VideoSection />
      case 'notes':
        return <NotesSection />
      default:
        return <LinkSection />
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Content Section */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-semibold text-white mb-4">Add Content</h2>
        <InfoInputSection />
      </div>

      {/* Category Navigation */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`storage-category-btn flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                activeCategory === category.id
                  ? category.color
                  : 'text-gray-400 border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600/50'
              }`}
            >
              <span className="text-2xl mb-2">{category.icon}</span>
              <span className="font-medium text-sm">{category.label}</span>
              <span className={`storage-count-badge text-xs mt-1 px-2 py-1 rounded-full ${
                activeCategory === category.id
                  ? 'bg-white/20'
                  : 'bg-gray-700/50'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 min-h-[400px]">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">
              {categories.find(c => c.id === activeCategory)?.icon}
            </span>
            <h2 className="text-xl font-semibold text-white">
              {categories.find(c => c.id === activeCategory)?.label}
            </h2>
            <span className="storage-count-badge text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300">
              {categories.find(c => c.id === activeCategory)?.count} items
            </span>
          </div>
          
          {/* Dynamic Content */}
          <div className="storage-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}