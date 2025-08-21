'use client'

import { Search, Grid, List } from 'lucide-react'
import { useMarketplaceState } from './MarketplaceStateManager'

/**
 * MarketPlace 검색/필터링 UI 컴포넌트
 * 카테고리 필터, 검색, 정렬, 뷰 모드 변경 포함
 */
export function MarketplaceFilters() {
  const {
    categories,
    selectedCategory,
    sortOrder,
    localSearchQuery,
    viewMode,
    showMobileSearch,
    isMobile,
    setSelectedCategory,
    setSortOrder,
    setLocalSearchQuery,
    setViewMode,
    setShowMobileSearch
  } = useMarketplaceState()

  return (
    <>
      {/* 🔍 검색 및 필터 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          
          {/* 데스크톱 검색 바 */}
          {!isMobile && (
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Search collections..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                {/* 정렬 선택 */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popular">Popular</option>
                  <option value="recent">Recent</option>
                  <option value="helpful">Most Helpful</option>
                </select>
                
                {/* 뷰 모드 토글 */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'} transition-colors`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'} transition-colors`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 모바일 검색 바 */}
          {isMobile && (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'} transition-colors`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'} transition-colors`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {showMobileSearch && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    placeholder="Search collections..."
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* 카테고리 필터 pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}