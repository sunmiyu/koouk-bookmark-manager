'use client'

import { useSearch, SearchableContent } from '@/contexts/SearchContext'
import { trackEvents } from '@/lib/analytics'
import { useLanguage, formatRelativeTime } from '@/contexts/LanguageContext'

export default function SearchResults() {
  const { searchResults, searchFilter, highlightText, clearSearch } = useSearch()
  const { t, language } = useLanguage()
  
  if (!searchResults) return null
  
  const handleItemClick = (item: SearchableContent) => {
    if (item.type === 'link' || item.type === 'video') {
      window.open(item.url, '_blank')
      trackEvents.clickExternalLink(item.url || '')
    }
    // TODO: Handle other item types (image, note, todo)
  }
  
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'note':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'link':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2 4H7a2 2 0 01-2-2V8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2z" />
          </svg>
        )
      case 'image':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'todo':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'bg-purple-600'
      case 'link': return 'bg-blue-600'
      case 'video': return 'bg-red-600'
      case 'image': return 'bg-green-600'
      case 'todo': return 'bg-orange-600'
      default: return 'bg-gray-600'
    }
  }
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }
  
  const formatDate = (dateStr: string) => {
    return formatRelativeTime(dateStr, language)
  }

  return (
    <div className="space-y-6">
      {/* 검색 결과 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {t('search_results')}
        </h2>
        <button
          onClick={clearSearch}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          {t('clear_search')}
        </button>
      </div>
      
      {/* 필터 요약 */}
      {(searchFilter.type !== 'all' || searchFilter.category || searchFilter.tags?.length) && (
        <div className="flex flex-wrap gap-2">
          {searchFilter.type !== 'all' && (
            <span className="px-3 py-1 bg-blue-900/30 text-blue-300 text-sm rounded-full">
              {t('content_type')}: {searchFilter.type}
            </span>
          )}
          {searchFilter.category && (
            <span className="px-3 py-1 bg-green-900/30 text-green-300 text-sm rounded-full">
              {t('category')}: {searchFilter.category}
            </span>
          )}
          {searchFilter.tags?.map(tag => (
            <span key={tag} className="px-3 py-1 bg-purple-900/30 text-purple-300 text-sm rounded-full">
              #{tag}
            </span>
          ))}
          {searchFilter.priority && (
            <span className={`px-3 py-1 text-sm rounded-full ${
              searchFilter.priority === 'high' ? 'bg-red-900/30 text-red-300' :
              searchFilter.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
              'bg-green-900/30 text-green-300'
            }`}>
              {t('priority')}: {searchFilter.priority}
            </span>
          )}
          {searchFilter.completed !== undefined && (
            <span className="px-3 py-1 bg-gray-900/30 text-gray-300 text-sm rounded-full">
              {t('status')}: {searchFilter.completed ? t('completed') : t('incomplete')}
            </span>
          )}
        </div>
      )}
      
      {/* 검색 결과 */}
      {searchResults.totalCount === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">{t('no_results_found')}</div>
          <div className="text-gray-500 text-sm">
            {t('try_adjusting_search')}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {searchResults.items.map((item, index) => (
            <div
              key={`${item.type}-${item.id}-${index}`}
              onClick={() => handleItemClick(item)}
              className={`bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all duration-200 ${
                item.type === 'link' || item.type === 'video' ? 'cursor-pointer hover:bg-gray-750' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* 아이콘 및 타입 */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 ${getTypeColor(item.type)} rounded-lg flex items-center justify-center text-white`}>
                    {getItemIcon(item.type)}
                  </div>
                </div>
                
                {/* 콘텐츠 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* 제목 */}
                      <h3 
                        className="text-lg font-medium text-white mb-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightText(item.title, searchFilter.query || '') 
                        }}
                      />
                      
                      {/* 설명 */}
                      {(item.content || item.description) && (
                        <p 
                          className="text-gray-300 text-sm line-clamp-3 mb-2"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(
                              item.content || item.description || '', 
                              searchFilter.query || ''
                            ) 
                          }}
                        />
                      )}
                      
                      {/* 메타 정보 */}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className={`px-2 py-1 ${getTypeColor(item.type)} text-white rounded`}>
                          {item.type.toUpperCase()}
                        </span>
                        <span>{item.category}</span>
                        <span>{formatDate(item.createdAt)}</span>
                        
                        {/* Todo 전용 정보 */}
                        {item.type === 'todo' && (
                          <>
                            {item.priority && (
                              <span className={`font-medium ${getPriorityColor(item.priority)}`}>
                                {item.priority.toUpperCase()}
                              </span>
                            )}
                            {item.completed !== undefined && (
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                item.completed 
                                  ? 'bg-green-900/30 text-green-300' 
                                  : 'bg-yellow-900/30 text-yellow-300'
                              }`}>
                                {item.completed ? t('completed').toUpperCase() : t('incomplete').toUpperCase()}
                              </span>
                            )}
                            {item.dueDate && (
                              <span className={`${
                                new Date(item.dueDate) < new Date() ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {t('due')}: {formatDate(item.dueDate)}
                              </span>
                            )}
                          </>
                        )}
                        
                        {/* URL 정보 */}
                        {item.url && (
                          <span className="text-blue-400 hover:text-blue-300">
                            {new URL(item.url).hostname}
                          </span>
                        )}
                      </div>
                      
                      {/* 태그 */}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 5).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 5 && (
                            <span className="text-gray-500 text-xs">
                              +{item.tags.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* 외부 링크 아이콘 */}
                    {(item.type === 'link' || item.type === 'video') && item.url && (
                      <div className="flex-shrink-0 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 카테고리 및 태그 통계 */}
      {(searchResults.categories.length > 0 || searchResults.tags.length > 0) && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 카테고리 분포 */}
          {searchResults.categories.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-3">{t('categories')}</h3>
              <div className="space-y-2">
                {searchResults.categories.slice(0, 8).map(category => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{category.name}</span>
                    <span className="text-gray-400 text-sm">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 태그 클라우드 */}
          {searchResults.tags.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-3">{t('popular_tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {searchResults.tags.slice(0, 12).map(tag => (
                  <span 
                    key={tag.name} 
                    className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                  >
                    #{tag.name} ({tag.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}