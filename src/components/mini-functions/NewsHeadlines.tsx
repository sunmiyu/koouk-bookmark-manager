'use client'

import { useState, useEffect, useMemo } from 'react'
import { NewsItem } from '@/types/miniFunctions'

interface NewsHeadlinesProps {
  isPreviewOnly?: boolean
}

export default function NewsHeadlines({ isPreviewOnly = false }: NewsHeadlinesProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [currentRegion, setCurrentRegion] = useState<string>('kr')
  const [availableRegions, setAvailableRegions] = useState<string[]>(['kr'])


  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      setError(null)
      
      try {
        if (isPreviewOnly) {
          // For preview, fetch from API but limit results
          const response = await fetch('/api/news/rss')
          const data = await response.json()
          
          if (data.success && data.items) {
            setNews(data.items.slice(0, 2))
            setLastUpdated(data.lastUpdated)
            setCurrentRegion(data.region || 'kr')
          } else {
            setError('뉴스를 불러올 수 없습니다')
          }
          setLoading(false)
        } else {
          // Fetch real RSS news from API
          const response = await fetch('/api/news/rss')
          const data = await response.json()
          
          if (data.success && data.items) {
            setNews(data.items)
            setLastUpdated(data.lastUpdated)
            setCurrentRegion(data.region || 'kr')
            setAvailableRegions(data.availableRegions || ['kr'])
            console.log(`Loaded ${data.items.length} news items from RSS (region: ${data.region})`)
          } else {
            console.warn('RSS API failed:', data.error)
            setError('뉴스를 불러올 수 없습니다')
          }
          setLoading(false)
        }
      } catch (fetchError) {
        console.error('Failed to fetch news:', fetchError)
        setError('네트워크 오류로 뉴스를 불러올 수 없습니다')
        setLoading(false)
      }
    }

    fetchNews()
    
    // Refresh news every 30 minutes for real users
    if (!isPreviewOnly) {
      const interval = setInterval(fetchNews, 30 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isPreviewOnly])

  // Auto-rolling news headlines
  useEffect(() => {
    if (!isPreviewOnly && news.length > 8) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length)
      }, 3000) // Change every 3 seconds

      return () => clearInterval(interval)
    }
  }, [news.length, isPreviewOnly])

  const displayNews = useMemo(() => {
    if (isPreviewOnly) {
      return news.slice(0, 2)
    }
    
    if (news.length <= 8) {
      return news.slice(0, 8)
    }
    
    const endIndex = currentIndex + 8
    if (endIndex <= news.length) {
      return news.slice(currentIndex, endIndex)
    }
    
    return news.slice(currentIndex).concat(news.slice(0, endIndex - news.length))
  }, [news, currentIndex, isPreviewOnly])

  const manualRefresh = async (region?: string) => {
    if (loading) return
    
    setLoading(true)
    setError(null)
    
    try {
      const url = region ? `/api/news/rss?region=${region}` : '/api/news/rss'
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success && data.items) {
        setNews(data.items)
        setLastUpdated(data.lastUpdated)
        setCurrentRegion(data.region || 'kr')
        setAvailableRegions(data.availableRegions || ['kr'])
        console.log('Manual refresh: Loaded', data.items.length, 'news items for region', data.region)
      } else {
        setError('Failed to refresh news')
      }
    } catch (error) {
      console.error('Manual refresh failed:', error)
      setError('Refresh failed')
    } finally {
      setLoading(false)
    }
  }

  const changeRegion = (region: string) => {
    if (region !== currentRegion) {
      manualRefresh(region)
    }
  }

  // 지역명 매핑
  const regionNames: Record<string, string> = {
    kr: '🇰🇷 한국',
    us: '🇺🇸 미국',
    jp: '🇯🇵 일본',
    global: '🌍 글로벌'
  }

  if (loading) {
    return (
      <div className="text-gray-400">
        <div className="animate-pulse">Loading news...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400">
        <div>⚠️ {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header with region selector and refresh button */}
      {!isPreviewOnly && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">📰 실시간 뉴스</span>
              <span className="text-xs text-blue-400">{regionNames[currentRegion] || currentRegion}</span>
              {error && (
                <span className="text-xs text-yellow-400">⚠️</span>
              )}
            </div>
            <button
              onClick={() => manualRefresh()}
              disabled={loading}
              className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 flex items-center gap-1"
              title="뉴스 새로고침"
            >
              <span className={loading ? 'animate-spin' : ''}>↻</span>
              {loading ? '새로고침 중...' : '새로고침'}
            </button>
          </div>

          {/* Region selector */}
          <div className="flex gap-1 overflow-x-auto">
            {availableRegions.map(region => (
              <button
                key={region}
                onClick={() => changeRegion(region)}
                disabled={loading}
                className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                  region === currentRegion
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                {regionNames[region] || region}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Last updated info */}
      {!isPreviewOnly && lastUpdated && (
        <div className="text-xs text-gray-500 mb-2">
          마지막 업데이트: {new Date(lastUpdated).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}

      {/* News items */}
      {displayNews.map((item, index) => (
        <div 
          key={index}
          className={`py-1 ${
            !isPreviewOnly ? 'cursor-pointer hover:bg-gray-800 rounded px-1 transition-colors' : ''
          }`}
          onClick={() => {
            if (!isPreviewOnly && item.url !== '#') {
              window.open(item.url, '_blank')
            }
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <span className="text-white text-sm flex-shrink-0 mt-0.5">■</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white line-clamp-2 leading-relaxed">
                  {item.title}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>
                    {new Date(item.publishedAt).toLocaleDateString('ko-KR', {
                      month: 'numeric',
                      day: 'numeric'
                    })} {new Date(item.publishedAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
    </div>
  )
}

// In a real implementation, you would add this RSS fetching function:
/*
async function fetchRSSNews(): Promise<NewsItem[]> {
  try {
    // This would be implemented in an API route due to CORS restrictions
    const response = await fetch('/api/news/rss')
    const data = await response.json()
    return data.items
  } catch (error) {
    throw new Error('Failed to fetch news')
  }
}
*/