'use client'

import { useState } from 'react'
import InfoInputSection from '@/components/InfoInputSection'
import LinkSection from '@/components/LinkSection'
import VideoSection from '@/components/VideoSection'
import NotesSection from '@/components/NotesSection'
import ImageSection from '@/components/ImageSection'

type StorageCategory = 'all' | 'links' | 'videos' | 'notes' | 'images'

export default function StorageContent() {
  const [activeCategory, setActiveCategory] = useState<StorageCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', label: 'All', icon: '📂', count: 32 },
    { id: 'links', label: 'Links', icon: '🔗', count: 8, color: 'text-blue-400' },
    { id: 'videos', label: 'Videos', icon: '🎥', count: 5, color: 'text-green-400' },
    { id: 'notes', label: 'Notes', icon: '📝', count: 12, color: 'text-purple-400' },
    { id: 'images', label: 'Images', icon: '🖼️', count: 7, color: 'text-yellow-400' }
  ]

  return (
    <div className="space-y-6">
      {/* Storage Header & Add Content */}
      <div className="bg-black rounded-xl p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Storage</h2>
          
          {/* Category Filter Buttons */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as StorageCategory)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-base">{category.icon}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeCategory === category.id 
                      ? 'bg-blue-500/30 text-blue-100'
                      : 'bg-gray-700/50 text-gray-400'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your stored content..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 hover:bg-gray-800/70 focus:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50 focus:border-blue-500/50 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-xs text-gray-400">
                Searching for: <span className="text-blue-400 font-medium">&quot;{searchQuery}&quot;</span>
              </div>
            )}
          </div>
          
          {/* Add Content Section - Only show when 'all' is selected */}
          {activeCategory === 'all' && (
            <div className="border-t border-gray-800/50 pt-6">
              <InfoInputSection />
            </div>
          )}
        </div>
      </div>

      {/* Content Display */}
      {activeCategory === 'all' && (
        <div className="space-y-6">
          {/* All Content in Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <LinkSection searchQuery={searchQuery} />
            <VideoSection searchQuery={searchQuery} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <NotesSection searchQuery={searchQuery} />
            <ImageSection searchQuery={searchQuery} />
          </div>
        </div>
      )}

      {activeCategory === 'links' && (
        <div className="space-y-4">
          <LinkSection fullWidth={true} searchQuery={searchQuery} />
        </div>
      )}

      {activeCategory === 'videos' && (
        <div className="space-y-4">
          <VideoSection fullWidth={true} searchQuery={searchQuery} />
        </div>
      )}

      {activeCategory === 'notes' && (
        <div className="space-y-4">
          <NotesSection fullWidth={true} searchQuery={searchQuery} />
        </div>
      )}

      {activeCategory === 'images' && (
        <div className="space-y-4">
          <ImageSection fullWidth={true} searchQuery={searchQuery} />
        </div>
      )}
    </div>
  )
}