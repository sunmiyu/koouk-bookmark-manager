'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, TrendingUp, Globe, FileText, Folder, Share2 } from 'lucide-react'
import { searchEngine } from '@/lib/search-engine'
import { useAnalytics } from '@/hooks/useAnalytics'

interface SearchResult {
  id: string
  name: string
  content: string
  type: 'folder' | 'storage' | 'shared'
  category?: string
  tags: string[]
  folderId?: string
  description?: string
}

interface SearchInterfaceProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onResultSelect?: (result: SearchResult) => void
  placeholder?: string
  showSuggestions?: boolean
  searchScope?: 'my-folder' | 'market-place' | 'bookmarks' | 'all'
  language?: 'ko' | 'en'
}

export default function SearchInterface({
  searchQuery,
  onSearchChange,
  onResultSelect,
  placeholder = 'Search...',
  showSuggestions = true,
  searchScope = 'all',
  language = 'ko'
}: SearchInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { trackSearch, trackContentInteraction } = useAnalytics()

  // Execute search
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)

      try {
        // Search scope filtering
        const searchOptions = {
          type: searchScope === 'my-folder' ? ('storage' as const) : 
                searchScope === 'market-place' ? ('shared' as const) : 
                undefined,
          limit: 10
        }

        const searchResults = searchEngine.search(searchQuery, searchOptions)
        setResults(searchResults)
        
        // GA4 검색 이벤트 추적
        trackSearch(searchQuery, searchResults.length, {
          search_scope: searchScope,
          language: language
        })

        // Translation feature removed to improve performance
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, searchScope, language])

  // Auto-complete suggestions
  useEffect(() => {
    if (searchQuery.trim() && showSuggestions) {
      const newSuggestions = searchEngine.getSuggestions(searchQuery, 5)
      setSuggestions(newSuggestions)
    } else {
      setSuggestions([])
    }
  }, [searchQuery, showSuggestions])

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5))
    }
  }, [])

  // Handle search selection
  const handleSearchSelect = (query: string) => {
    onSearchChange(query)
    
    // Add to recent searches
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent-searches', JSON.stringify(updated))
    
    setIsOpen(false)
    inputRef.current?.blur()
  }

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    // GA4 컨텐츠 상호작용 추적
    trackContentInteraction('result_click', result.type, result.id)
    
    onResultSelect?.(result)
    handleSearchSelect(searchQuery)
  }

  // Handle clicks outside search box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Icon mapping
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder className="w-4 h-4" />
      case 'storage': return <FileText className="w-4 h-4" />
      case 'shared': return <Share2 className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const popularQueries = searchEngine.getPopularQueries()

  return (
    <div className="relative" ref={searchRef}>
      {/* Search input field */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-40 sm:w-72 pl-4 pr-11 py-2 h-8 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange('')
              setResults([])
              setShowTranslation(false)
            }}
            className="absolute right-9 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Search dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Translation suggestions */}
            {showTranslation && (
              <div className="p-3 border-b border-gray-100">
                <button
                  onClick={handleTranslatedSearch}
                  className="w-full flex items-center gap-2 p-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Globe className="w-4 h-4" />
                  <span className="flex-1">
                    Search: &ldquo;<span className="font-medium">{translatedQuery}</span>&rdquo;
                  </span>
                </button>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto">
              {/* Loading while searching */}
              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="ml-2 text-sm text-gray-500">Searching...</span>
                </div>
              )}

              {/* Search results */}
              {!isSearching && results.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Search Results ({results.length})
                  </div>
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultSelect(result)}
                      className="w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="mt-1 text-gray-400">
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {result.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {result.description || result.content}
                        </div>
                        {result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Auto-complete suggestions */}
              {!isSearching && searchQuery && suggestions.length > 0 && (
                <div className="py-2 border-t border-gray-100">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Suggested Searches
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSelect(suggestion)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Search className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* No search results */}
              {!isSearching && searchQuery && results.length === 0 && (
                <div className="py-8 text-center">
                  <div className="text-sm text-gray-500 mb-2">
                    No search results found
                  </div>
                  <div className="text-xs text-gray-400">
                    Try searching with different keywords
                  </div>
                </div>
              )}

              {/* Recent searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSelect(search)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular searches */}
              {!searchQuery && popularQueries.length > 0 && (
                <div className="py-2 border-t border-gray-100">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Popular Searches
                  </div>
                  {popularQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSelect(query)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-700">{query}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}