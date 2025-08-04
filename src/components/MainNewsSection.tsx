'use client'

import { useState, useEffect } from 'react'
import { cachedFetch, cacheKeys } from '@/utils/apiCache'

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

  // Fetch news with caching
  const fetchNews = async (force = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await cachedFetch.news(
        cacheKeys.news('global'),
        async () => {
          console.log('🔄 Fetching fresh news data...')
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)
          
          const response = await fetch('/api/news/rss', {
            signal: controller.signal
          })
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          
          const responseData = await response.json()
          
          if (!responseData.success || !responseData.items) {
            throw new Error(responseData.error || 'No news data available')
          }
          
          return responseData
        },
        force
      )
      
      setNews(data.items.slice(0, 10))
      setLastUpdated(data.lastUpdated)
      setRegion(data.region || 'kr')
      setSource(data.source || 'fallback')
      console.log(`✅ Loaded ${data.items.length} news items from ${data.source} (region: ${data.region})`)
      
    } catch (err) {
      console.error('❌ News fetch error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      // Try to provide fallback international news links
      const fallbackNews = [
        {
          title: "BBC News - Latest World News",
          url: "https://www.bbc.com/news",
          source: "BBC",
          publishedAt: new Date().toISOString()
        },
        {
          title: "CNN - Breaking News and Latest Updates",
          url: "https://www.cnn.com",
          source: "CNN", 
          publishedAt: new Date().toISOString()
        },
        {
          title: "Reuters - Business and Financial News",
          url: "https://www.reuters.com",
          source: "Reuters",
          publishedAt: new Date().toISOString()
        },
        {
          title: "Associated Press - Latest News",
          url: "https://apnews.com",
          source: "AP News",
          publishedAt: new Date().toISOString()
        },
        {
          title: "The Guardian - International Edition",
          url: "https://www.theguardian.com/international",
          source: "The Guardian",
          publishedAt: new Date().toISOString()
        }
      ]
      
      setNews(fallbackNews)
      setError(`API Error: ${errorMessage}`)
      setSource('fallback_links')
      setRegion('international')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const handleRefresh = () => {
    fetchNews(true)
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${
              loading 
                ? 'text-yellow-400 bg-yellow-400/10'
                : source === 'naver'
                ? 'text-green-400 bg-green-400/10'
                : source === 'international_links' || source === 'fallback_links' || source === 'fallback_international' || source === 'fallback_error'
                ? 'text-blue-400 bg-blue-400/10'
                : error
                ? 'text-red-400 bg-red-400/10'
                : 'text-gray-400 bg-gray-400/10'
            }`}>
              {loading
                ? 'Loading...'
                : source === 'naver' 
                ? '실시간' 
                : source === 'international_links' || source === 'fallback_links' || source === 'fallback_international' || source === 'fallback_error'
                ? 'Global Links'
                : error
                ? 'Fallback'
                : source || 'Cached'}
            </span>
            {error && (
              <span className="text-xs text-yellow-400" title={error}>⚠️</span>
            )}
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh news"
        >
          <svg 
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Loading State */}
      {loading && news.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded mb-2"></div>
              <div className="h-3 bg-gray-700/30 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error && news.length === 0 ? (
        /* Error State */
        <div className="text-center py-8 text-gray-400">
          <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="mb-2">Failed to load news</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        /* News List */
        <div className="space-y-4">
          {news.slice(0, 8).map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group hover:bg-gray-800/30 rounded-lg p-3 -m-3 transition-colors"
            >
              <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-1">
                {item.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{item.source}</span>
                <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-4 pt-4 border-t border-gray-800/50">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}