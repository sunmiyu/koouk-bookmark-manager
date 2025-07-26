'use client'

import { useState } from 'react'
import { useContent } from '@/contexts/ContentContext'

interface SearchBarProps {
  className?: string
}

export default function SearchBar({ className }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const { videos, links, images, notes } = useContent()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (query.trim() === '') {
      setSearchResults([])
      setShowResults(false)
      return
    }

    // Search across all content types
    const allContent = [...videos, ...links, ...images, ...notes]
    const filtered = allContent.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content?.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    )

    setSearchResults(filtered)
    setShowResults(true)
  }

  const handleItemClick = (item: any) => {
    if (item.type === 'link' || item.type === 'video') {
      window.open(item.url, '_blank')
    }
    // TODO: Handle image and note clicks
    setShowResults(false)
    setSearchQuery('')
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder="Search contents here"
        className="w-full px-4 py-2 text-sm bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 pr-8 text-center"
      />
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      
      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {searchResults.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleItemClick(item)}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  item.type === 'video' ? 'bg-red-600' :
                  item.type === 'image' ? 'bg-green-600' :
                  item.type === 'link' ? 'bg-blue-600' : 'bg-purple-600'
                } text-white`}>
                  {item.type}
                </span>
                <span className="text-white text-sm truncate">{item.title}</span>
              </div>
              {item.description && (
                <p className="text-xs text-gray-400 mt-1 truncate">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* No Results */}
      {showResults && searchQuery && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 p-4 text-center">
          <p className="text-gray-400 text-sm">No results found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  )
}