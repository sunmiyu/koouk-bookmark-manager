'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearch, SearchFilter } from '@/contexts/SearchContext'
import { trackEvents } from '@/lib/analytics'
import { useLanguage } from '@/contexts/LanguageContext'

interface SearchBarProps {
  placeholder?: string
  showAdvancedFilters?: boolean
  compactMode?: boolean
  className?: string
}

export default function SearchBar({ 
  placeholder, 
  showAdvancedFilters = true,
  compactMode = false,
  className
}: SearchBarProps) {
  const { t } = useLanguage()
  const {
    searchFilter,
    searchResults,
    isSearching,
    searchHistory,
    search,
    clearSearch,
    addToHistory,
    getSuggestions,
    getSearchStats
  } = useSearch()
  
  const defaultPlaceholder = placeholder || t('search_everything')
  
  const [query, setQuery] = useState(searchFilter.query || '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  const stats = getSearchStats()
  
  // 검색 제안 업데이트
  useEffect(() => {
    if (query.trim()) {
      const newSuggestions = getSuggestions(query)
      setSuggestions(newSuggestions)
    } else {
      setSuggestions(searchHistory.slice(0, 5))
    }
  }, [query, searchHistory, getSuggestions])
  
  // 외부 클릭 시 제안 숨기기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // 검색 실행
  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) {
      clearSearch()
      return
    }
    
    try {
      addToHistory(searchQuery)
      await search(searchQuery)
      setShowSuggestions(false)
      trackEvents.search(searchQuery)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }
  
  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }
  
  // 제안 클릭
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }
  
  // 필터 변경
  const handleFilterChange = (updates: Partial<SearchFilter>) => {
    if (query.trim()) {
      search(query, updates)
    }
  }
  
  // 검색 초기화
  const handleClear = () => {
    setQuery('')
    clearSearch()
    inputRef.current?.focus()
  }

  return (
    <div className={`relative ${compactMode ? 'w-full' : 'w-full max-w-4xl mx-auto'} ${className || ''}`}>
      {/* 메인 검색바 */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search everything"
            className={`w-full ${
              compactMode ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'
            } bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-20`}
          />
          
          {/* 검색/로딩 아이콘 */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {isSearching ? (
              <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            ) : (
              <>
                {query && (
                  <button
                    onClick={handleClear}
                    className="text-gray-400 hover:text-white transition-colors"
                    title={t('clear_search')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleSearch()}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title={t('search')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* 검색 제안 */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 고급 필터 */}
      {showAdvancedFilters && !compactMode && (
        <div className="mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            {t('advanced_filters')}
            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-800 border border-gray-600 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 타입 필터 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">{t('content_type')}</label>
                  <select
                    value={searchFilter.type || 'all'}
                    onChange={(e) => handleFilterChange({ type: e.target.value as SearchFilter['type'] })}
                    className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="all">{t('all_types')}</option>
                    <option value="note">{t('notes')}</option>
                    <option value="link">{t('links')}</option>
                    <option value="video">{t('videos')}</option>
                    <option value="image">{t('images')}</option>
                    <option value="todo">{t('todos')}</option>
                  </select>
                </div>
                
                {/* 카테고리 필터 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">{t('category')}</label>
                  <select
                    value={searchFilter.category || ''}
                    onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                    className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="">{t('all_categories')}</option>
                    {stats.categories.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 정렬 방식 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">{t('sort_by')}</label>
                  <select
                    value={searchFilter.sortBy || 'relevance'}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as SearchFilter['sortBy'] })}
                    className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="relevance">{t('relevance')}</option>
                    <option value="date">{t('date')}</option>
                    <option value="title">{t('title')}</option>
                    <option value="priority">{t('priority')}</option>
                  </select>
                </div>
                
                {/* 정렬 순서 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">{t('order')}</label>
                  <select
                    value={searchFilter.sortOrder || 'desc'}
                    onChange={(e) => handleFilterChange({ sortOrder: e.target.value as SearchFilter['sortOrder'] })}
                    className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="desc">{t('descending')}</option>
                    <option value="asc">{t('ascending')}</option>
                  </select>
                </div>
              </div>
              
              {/* Todo 전용 필터 */}
              {(searchFilter.type === 'todo' || searchFilter.type === 'all') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-600">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">{t('priority')}</label>
                    <select
                      value={searchFilter.priority || ''}
                      onChange={(e) => handleFilterChange({ priority: (e.target.value as SearchFilter['priority']) || undefined })}
                      className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="">{t('all_priorities')}</option>
                      <option value="high">{t('high')}</option>
                      <option value="medium">{t('medium')}</option>
                      <option value="low">{t('low')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">{t('status')}</label>
                    <select
                      value={searchFilter.completed === undefined ? '' : searchFilter.completed.toString()}
                      onChange={(e) => handleFilterChange({ 
                        completed: e.target.value === '' ? undefined : e.target.value === 'true'
                      })}
                      className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="">{t('all_status')}</option>
                      <option value="false">{t('incomplete')}</option>
                      <option value="true">{t('completed')}</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* 태그 필터 */}
              {stats.tags.length > 0 && (
                <div className="pt-4 border-t border-gray-600">
                  <label className="block text-xs text-gray-400 mb-2">{t('popular_tags')}</label>
                  <div className="flex flex-wrap gap-2">
                    {stats.tags.slice(0, 15).map(tag => (
                      <button
                        key={tag.name}
                        onClick={() => {
                          const currentTags = searchFilter.tags || []
                          const newTags = currentTags.includes(tag.name)
                            ? currentTags.filter(t => t !== tag.name)
                            : [...currentTags, tag.name]
                          handleFilterChange({ tags: newTags })
                        }}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          searchFilter.tags?.includes(tag.name)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        #{tag.name} ({tag.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* 검색 결과 요약 */}
      {searchResults && (
        <div className="mt-4 text-sm text-gray-400">
          {searchResults.totalCount}{t('found_results')} in {searchResults.searchTime}ms
          {searchResults.matchedTerms.length > 0 && (
            <span className="ml-2">
              for: {searchResults.matchedTerms.map(term => (
                <span key={term} className="inline-block bg-yellow-800 text-yellow-200 px-2 py-0.5 rounded ml-1">
                  {term}
                </span>
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  )
}