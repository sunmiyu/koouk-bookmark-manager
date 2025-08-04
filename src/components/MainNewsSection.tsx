'use client'

import { useState, useEffect } from 'react'
// Types
interface NewsItem {
  title: string
  url: string
  source: string
  publishedAt: string
}

export default function MainNewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [region, setRegion] = useState<string>('kr')
  const [source, setSource] = useState<string>('fallback')


  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Try to fetch real RSS news from API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch('/api/news/rss', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.items) {
          setNews(data.items.slice(0, 10)) // Main page shows top 10 latest news
          setLastUpdated(data.lastUpdated)
          setRegion(data.region || 'kr')
          setSource(data.source || 'fallback')
          console.log(`Loaded ${data.items.length} news items from ${data.source} (region: ${data.region})`)
        } else {
          // API failed but don't use sample news - show actual API response
          console.warn('RSS API failed:', data.error)
          setNews(data.items || [])
          setLastUpdated(data.lastUpdated || new Date().toISOString())
          setRegion(data.region || 'kr')
          setSource(data.source || 'error')
        }
      } catch (fetchError) {
        console.error('Failed to fetch news:', fetchError)
        // Show empty state on fetch error
        setNews([])
        setLastUpdated(new Date().toISOString())
        setError('Failed to fetch news - check your connection')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    
    // Refresh news every 30 minutes
    const interval = setInterval(fetchNews, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const manualRefresh = async () => {
    if (loading) return
    
    setLoading(true)
    setError(null)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout for manual refresh
      
      const response = await fetch('/api/news/rss', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.items) {
        setNews(data.items.slice(0, 10))
        setLastUpdated(data.lastUpdated)
        setRegion(data.region || 'kr')
        setSource(data.source || 'fallback')
        console.log('Manual refresh: Loaded', data.items.length, 'news items from', data.source)
      } else {
        setError('Failed to refresh news')
        setNews(data.items || [])
        setLastUpdated(data.lastUpdated || new Date().toISOString())
        setRegion(data.region || 'kr')
        setSource(data.source || 'error')
      }
    } catch (error) {
      console.error('Manual refresh failed:', error)
      setError('Refresh failed - check your connection')
      setNews([])
      setLastUpdated(new Date().toISOString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-4">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800/50">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              {region === 'international' ? 'International News' : 'Today&apos;s News'}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${
                source === 'naver' 
                  ? 'text-green-400 bg-green-400/10' 
                  : source === 'international_links'
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-gray-400 bg-gray-400/10'
              }`}>
                {source === 'naver' 
                  ? '네이버 실시간' 
                  : source === 'international_links'
                  ? 'Global Links'
                  : 'Cached'}
              </span>
              {error && (
                <span className="text-xs text-yellow-400" title={error}>⚠️</span>
              )}
            </div>
          </div>
          
          <button
            onClick={manualRefresh}
            disabled={loading}
            className="text-gray-400 hover:text-gray-300 disabled:opacity-50 transition-colors"
            title="Refresh news"
          >
            <svg 
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Last updated info */}
        {lastUpdated && (
          <div className="text-xs text-gray-500 mb-4">
            Last updated: {new Date(lastUpdated).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}

        {/* News Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No news available at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <div 
                key={index}
                className="group cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-200"
                onClick={() => {
                  if (item.url && item.url !== '#') {
                    if (region === 'international') {
                      // 해외 사용자는 새 탭에서 링크 열기
                      window.open(item.url, '_blank', 'noopener,noreferrer')
                    } else {
                      // 한국 사용자는 같은 탭에서 뉴스 읽기 (뒤로가기 가능)
                      window.location.href = item.url
                    }
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {/* News Icon or Flag */}
                  <div className="flex-shrink-0 mt-1">
                    {region === 'international' ? (
                      <div className="w-6 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-sm flex items-center justify-center">
                        <span className="text-xs text-white font-bold">🌍</span>
                      </div>
                    ) : (
                      <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-blue-300 transition-colors"></div>
                    )}
                  </div>
                  
                  {/* News Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors line-clamp-2 leading-relaxed mb-2">
                      {item.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium">{item.source}</span>
                      {region !== 'international' && (
                        <>
                          <span>•</span>
                          <span>
                            {new Date(item.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })} {new Date(item.publishedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })}
                          </span>
                        </>
                      )}
                      {region === 'international' && (
                        <>
                          <span>•</span>
                          <span>Click to visit</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Navigate Icon */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}