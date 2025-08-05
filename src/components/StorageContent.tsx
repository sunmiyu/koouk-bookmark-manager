'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import InfoInputSection from '@/components/InfoInputSection'
import LinkSection from '@/components/LinkSection'
import VideoSection from '@/components/VideoSection'
import NotesSection from '@/components/NotesSection'
import ImageSection from '@/components/ImageSection'
import { useContent } from '@/contexts/ContentContext'
import { useWorkspacePersonalization } from '@/hooks/useWorkspacePersonalization'
import { useToastActions } from '@/contexts/ToastContext'
import { useFeedbackSystem, FeedbackContainer } from '@/components/FeedbackSystem'

type StorageCategory = 'all' | 'links' | 'videos' | 'notes' | 'images'

export default function StorageContent() {
  const [activeCategory, setActiveCategory] = useState<StorageCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [viewMode, setViewMode] = useState<'buttons' | 'dropdown'>('buttons')
  const [isMobile, setIsMobile] = useState(false)
  const [showPersonalizationHints, setShowPersonalizationHints] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollPositions, setScrollPositions] = useState<{ [key: string]: number }>({})
  const [previousCategory, setPreviousCategory] = useState<StorageCategory>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Get actual content counts from context
  const { links, videos, notes, images } = useContent()
  
  // Workspace personalization
  const {
    trackSectionVisit,
    trackSectionLeave,
    trackInteraction,
    getLayoutSuggestions,
    getUsageAnalytics,
    toggleFavorite,
    isFavorite,
    getFavorites
  } = useWorkspacePersonalization()
  
  // Toast notifications
  const { success, info, warning } = useToastActions()
  
  // Animated feedback system
  const {
    inlineFeedbacks,
    showSuccess: showAnimatedSuccess,
    showError: showAnimatedError,
    showWarning: showAnimatedWarning,
    showInfo: showAnimatedInfo,
    clearInlineFeedback
  } = useFeedbackSystem()
  
  // Get personalization suggestions
  const layoutSuggestions = getLayoutSuggestions()
  const usageAnalytics = getUsageAnalytics()
  const favorites = getFavorites()
  
  const baseCategories = [
    { 
      id: 'all', 
      label: 'All', 
      icon: '📂', 
      count: links.length + videos.length + notes.length + images.length,
      color: 'text-gray-400'
    },
    { 
      id: 'links', 
      label: 'Links', 
      icon: '🔗', 
      count: links.length, 
      color: 'text-blue-400' 
    },
    { 
      id: 'videos', 
      label: 'Videos', 
      icon: '🎥', 
      count: videos.length, 
      color: 'text-red-400' 
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: '📝', 
      count: notes.length, 
      color: 'text-purple-400' 
    },
    { 
      id: 'images', 
      label: 'Images', 
      icon: '🖼️', 
      count: images.length, 
      color: 'text-green-400' 
    }
  ]
  
  // Sort categories with favorites first, then by usage patterns
  const categories = [
    baseCategories[0], // Always keep 'all' first
    ...baseCategories.slice(1).sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id)
      const bIsFavorite = favorites.includes(b.id)
      
      // Favorites first
      if (aIsFavorite && !bIsFavorite) return -1
      if (!aIsFavorite && bIsFavorite) return 1
      
      // If both are favorites or both are not favorites, sort by usage patterns
      if (layoutSuggestions?.prioritizedSections) {
        const aIndex = layoutSuggestions.prioritizedSections.indexOf(a.id)
        const bIndex = layoutSuggestions.prioritizedSections.indexOf(b.id)
        
        // If both are in prioritized list, sort by priority
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        }
        // If only one is prioritized, prioritized comes first
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1
      }
      
      // Maintain original order if no other criteria apply
      return 0
    })
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showDropdown])

  // Auto-switch to dropdown on mobile for better UX
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640 // sm breakpoint
      setIsMobile(mobile)
      if (mobile && categories.length > 3) {
        setViewMode('dropdown')
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [categories.length])

  // Save current scroll position before changing category
  const saveScrollPosition = useCallback(() => {
    if (contentRef.current) {
      const scrollTop = contentRef.current.scrollTop || window.pageYOffset
      setScrollPositions(prev => ({
        ...prev,
        [activeCategory]: scrollTop
      }))
    }
  }, [activeCategory])

  // Save scroll position when component unmounts or category changes
  useEffect(() => {
    return () => {
      saveScrollPosition()
    }
  }, [saveScrollPosition])

  // Handle scroll position saving on scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const scrollTop = contentRef.current.scrollTop || window.pageYOffset
        setScrollPositions(prev => ({
          ...prev,
          [activeCategory]: scrollTop
        }))
      }
    }

    const scrollElement = contentRef.current || window
    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [activeCategory])

  // Track section visits for personalization
  useEffect(() => {
    if (activeCategory !== 'all') {
      trackSectionVisit(activeCategory)
      return () => {
        trackSectionLeave(activeCategory)
      }
    }
  }, [activeCategory, trackSectionVisit, trackSectionLeave])

  // Restore scroll position after category change
  const restoreScrollPosition = useCallback((categoryId: StorageCategory) => {
    setTimeout(() => {
      const savedPosition = scrollPositions[categoryId] || 0
      if (contentRef.current) {
        contentRef.current.scrollTop = savedPosition
      } else {
        window.scrollTo(0, savedPosition)
      }
    }, 150) // Wait for transition to start
  }, [scrollPositions])

  // Handle category change with interaction tracking and animations
  const handleCategoryChange = (categoryId: StorageCategory) => {
    if (categoryId === activeCategory) return
    
    // Save current scroll position
    saveScrollPosition()
    
    // Start transition animation
    setIsTransitioning(true)
    setPreviousCategory(activeCategory)
    trackInteraction(categoryId, 'click')
    
    // Show feedback for category switch
    const category = baseCategories.find(c => c.id === categoryId)
    if (category && categoryId !== 'all') {
      info(
        `Switched to ${category.label}`,
        `Now viewing ${category.count} ${category.label.toLowerCase()}`,
        { duration: 2000 }
      )
    }
    
    // Change category after a short delay for animation
    setTimeout(() => {
      setActiveCategory(categoryId)
    }, 150)
    
    // End transition and restore scroll position
    setTimeout(() => {
      setIsTransitioning(false)
      restoreScrollPosition(categoryId)
    }, 300)
  }

  // Handle favorite toggle
  const handleFavoriteToggle = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent category selection
    const wasFavorite = isFavorite(categoryId)
    toggleFavorite(categoryId)
    trackInteraction(categoryId, 'add') // Track as add/remove action
    
    // Show toast notification
    const category = baseCategories.find(c => c.id === categoryId)
    if (category) {
      if (wasFavorite) {
        info(
          'Removed from Favorites',
          `${category.label} has been removed from your favorites`,
          { duration: 3000 }
        )
      } else {
        success(
          'Added to Favorites',
          `${category.label} has been added to your favorites`,
          { duration: 3000 }
        )
      }
    }
  }

  // Handle search with interaction tracking
  const handleSearchChange = (query: string) => {
    if (query) {
      trackInteraction('search', 'search')
      if (query.length >= 3) {
        info(
          'Searching Content',
          `Searching for "${query}" across all your content`,
          { duration: 2000 }
        )
      }
    }
    setSearchQuery(query)
  }

  return (
    <div className="space-y-6">
      {/* Storage Header & Add Content */}
      <div className="bg-black rounded-xl p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Storage</h2>
          
          {/* Category Filter Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Filter by Type</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('buttons')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'buttons'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                  }`}
                  title="Button view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('dropdown')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'dropdown'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                  }`}
                  title="Dropdown view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Button View */}
            {viewMode === 'buttons' && (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id as StorageCategory)}
                    className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg ring-2 ring-blue-500/30 transform scale-105'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/70 hover:to-gray-600/70 hover:text-white hover:shadow-md'
                    } ${
                      isTransitioning && activeCategory === category.id
                        ? 'animate-pulse'
                        : ''
                    }`}
                  >
                    <span className="text-base">{category.icon}</span>
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      activeCategory === category.id 
                        ? 'bg-blue-500/30 text-blue-100'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}>
                      {category.count}
                    </span>
                    {/* Favorite Star */}
                    {category.id !== 'all' && (
                      <button
                        onClick={(e) => handleFavoriteToggle(category.id, e)}
                        className={`ml-1 transition-all duration-200 ${
                          isFavorite(category.id)
                            ? 'text-yellow-400 opacity-100'
                            : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-yellow-400'
                        }`}
                        title={isFavorite(category.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <svg className="w-4 h-4" fill={isFavorite(category.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Dropdown View */}
            {viewMode === 'dropdown' && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowDropdown(false)
                    }
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-expanded={showDropdown}
                  aria-haspopup="listbox"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{categories.find(c => c.id === activeCategory)?.icon}</span>
                    <div>
                      <span className="text-white font-medium">
                        {categories.find(c => c.id === activeCategory)?.label}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        ({categories.find(c => c.id === activeCategory)?.count} items)
                      </span>
                    </div>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      showDropdown ? 'rotate-180' : 'rotate-0'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl z-50 overflow-hidden">
                    {categories.map((category, index) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          handleCategoryChange(category.id as StorageCategory)
                          setShowDropdown(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 hover:bg-gray-700/50 hover:transform hover:scale-[1.02] ${
                          activeCategory === category.id
                            ? 'bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-blue-400 border-l-2 border-blue-500'
                            : 'text-gray-300 hover:text-white'
                        } ${
                          isTransitioning && activeCategory === category.id
                            ? 'animate-pulse'
                            : ''
                        } ${
                          index < categories.length - 1 ? 'border-b border-gray-700/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activeCategory === category.id
                              ? 'bg-blue-500/30 text-blue-200'
                              : 'bg-gray-700/50 text-gray-400'
                          }`}>
                            {category.count}
                          </span>
                          {/* Favorite Star in Dropdown */}
                          {category.id !== 'all' && (
                            <button
                              onClick={(e) => handleFavoriteToggle(category.id, e)}
                              className={`transition-colors ${
                                isFavorite(category.id)
                                  ? 'text-yellow-400'
                                  : 'text-gray-500 hover:text-yellow-400'
                              }`}
                              title={isFavorite(category.id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <svg className="w-4 h-4" fill={isFavorite(category.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                          )}
                          {activeCategory === category.id && (
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400">⭐</span>
                <h3 className="text-sm font-medium text-gray-300">Favorites</h3>
                <span className="text-xs text-gray-500">({favorites.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {favorites.map((favoriteId) => {
                  const category = baseCategories.find(c => c.id === favoriteId)
                  if (!category || category.id === 'all') return null
                  return (
                    <button
                      key={favoriteId}
                      onClick={() => handleCategoryChange(favoriteId as StorageCategory)}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                        activeCategory === favoriteId
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white ring-2 ring-yellow-500/30'
                          : 'bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-500/20 text-yellow-300 hover:from-yellow-600/20 hover:to-orange-600/20'
                      }`}
                    >
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-base">{category.icon}</span>
                      <span>{category.label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        activeCategory === favoriteId 
                          ? 'bg-yellow-500/30 text-yellow-100'
                          : 'bg-yellow-700/30 text-yellow-300'
                      }`}>
                        {category.count}
                      </span>
                      <button
                        onClick={(e) => handleFavoriteToggle(favoriteId, e)}
                        className="ml-1 opacity-0 group-hover:opacity-100 text-yellow-400 hover:text-yellow-300 transition-opacity"
                        title="Remove from favorites"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Personalization Hints */}
          {layoutSuggestions && layoutSuggestions.layoutSuggestions.length > 0 && (
            <div className="mb-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">💡</span>
                  <span className="text-sm font-medium text-white">Personalization Tip</span>
                </div>
                <button
                  onClick={() => setShowPersonalizationHints(!showPersonalizationHints)}
                  className="text-purple-400 hover:text-purple-300 text-xs"
                >
                  {showPersonalizationHints ? 'Hide' : 'Show'}
                </button>
              </div>
              {showPersonalizationHints && (
                <div className="mt-2 space-y-1">
                  {layoutSuggestions.layoutSuggestions.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="text-xs text-gray-300 flex items-start gap-1">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Quick Access to Most Used Sections */}
          {layoutSuggestions?.quickAccessRecommendations && layoutSuggestions.quickAccessRecommendations.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-300">Quick Access</span>
                <span className="text-xs text-gray-500">(Based on your usage)</span>
              </div>
              <div className="flex gap-2">
                {layoutSuggestions.quickAccessRecommendations.map((sectionId) => {
                  const category = categories.find(c => c.id === sectionId)
                  if (!category) return null
                  return (
                    <button
                      key={sectionId}
                      onClick={() => handleCategoryChange(sectionId as StorageCategory)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                        activeCategory === sectionId
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                      <span className="bg-gray-700/50 text-gray-400 px-1 py-0.5 rounded text-xs">
                        {category.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Toast Demo (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-purple-600/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-400">🎯</span>
                <span className="text-sm font-medium text-white">Toast Notifications Demo</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    success('Success Toast', 'This is a success notification')
                    showAnimatedSuccess('Animated Success!', 'This is an animated success message', { showToast: false, showInline: true })
                  }}
                  className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-xs transition-colors"
                >
                  Success
                </button>
                <button
                  onClick={() => {
                    info('Info Toast', 'This is an informational message')
                    showAnimatedInfo('Animated Info!', 'This is an animated info message', { showToast: false, showInline: true })
                  }}
                  className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors"
                >
                  Info
                </button>
                <button
                  onClick={() => {
                    warning('Warning Toast', 'This is a warning message')
                    showAnimatedWarning('Animated Warning!', 'This is an animated warning message', { showToast: false, showInline: true })
                  }}
                  className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded text-xs transition-colors"
                >
                  Warning
                </button>
                <button
                  onClick={() => {
                    showAnimatedError('Animated Error!', 'This is an animated error message with shake effect', { showToast: true, showInline: true })
                  }}
                  className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition-colors"
                >
                  Error + Animation
                </button>
              </div>
            </div>
          )}

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
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search your stored content..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 hover:bg-gray-800/70 focus:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50 focus:border-blue-500/50 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
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

      {/* Usage Analytics Display (Development) */}
      {process.env.NODE_ENV === 'development' && usageAnalytics && (
        <div className="mb-6 bg-gray-900/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Workspace Analytics</h3>
            <div className="text-xs text-gray-400">
              Total visits: {usageAnalytics.totalVisits} • Top: {usageAnalytics.topSection || 'None'}
            </div>
          </div>
          {usageAnalytics.sectionAnalytics.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {usageAnalytics.sectionAnalytics.slice(0, 4).map((section) => (
                <div key={section.section} className="bg-gray-800/50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-300 capitalize">{section.section}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      section.engagementLevel === 'high' ? 'bg-green-600/20 text-green-400' :
                      section.engagementLevel === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {section.engagementLevel}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {section.visitPercentage.toFixed(1)}% of visits
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Animated Feedback Container */}
      <FeedbackContainer
        inlineFeedbacks={inlineFeedbacks}
        onClearFeedback={clearInlineFeedback}
        position="top"
        className="mb-6"
      />

      {/* Content Display with Animation */}
      <div className="relative overflow-hidden">
        <div 
          ref={contentRef}
          key={activeCategory} // Force re-render for each category
          className={`transition-all duration-300 ease-in-out transform ${
            isTransitioning 
              ? 'opacity-0 translate-y-4 scale-95' 
              : 'opacity-100 translate-y-0 scale-100'
          }`}
          style={{
            transitionDelay: isTransitioning ? '0ms' : '50ms'
          }}
        >
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
        
        {/* Loading Overlay during Transition */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/80 rounded-full border border-gray-700/50">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-300 font-medium">
                {getTransitionMessage(previousCategory, activeCategory)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get transition messages
function getTransitionMessage(from: StorageCategory, to: StorageCategory): string {
  const categoryLabels: { [key in StorageCategory]: string } = {
    all: 'All Content',
    links: 'Links',
    videos: 'Videos', 
    notes: 'Notes',
    images: 'Images'
  }
  
  return `Switching to ${categoryLabels[to]}...`
}