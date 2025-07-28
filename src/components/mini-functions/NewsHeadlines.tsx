'use client'

import { useState, useEffect } from 'react'
import { NewsItem } from '@/types/miniFunctions'

interface NewsHeadlinesProps {
  isPreviewOnly?: boolean
}

export default function NewsHeadlines({ isPreviewOnly = false }: NewsHeadlinesProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sample news data for preview/demo
  const sampleNews: NewsItem[] = [
    {
      title: "삼성전자 주가 3% 상승, 반도체 업황 개선 기대감",
      url: "#",
      source: "한국경제",
      publishedAt: new Date().toISOString()
    },
    {
      title: "AI 기술 발전으로 새로운 일자리 창출 전망",
      url: "#", 
      source: "중앙일보",
      publishedAt: new Date().toISOString()
    },
    {
      title: "코로나19 신규 확진자 수 지속 감소세",
      url: "#",
      source: "연합뉴스",
      publishedAt: new Date().toISOString()
    }
  ]

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        if (isPreviewOnly) {
          // For preview, use sample data
          setTimeout(() => {
            setNews(sampleNews.slice(0, 2))
            setLoading(false)
          }, 1000)
        } else {
          // For real implementation, this would fetch from RSS or API
          // For now, use sample data with longer list
          setTimeout(() => {
            setNews(sampleNews)
            setLoading(false)
          }, 1500)
        }
      } catch {
        setError('Failed to load news')
        setLoading(false)
      }
    }

    fetchNews()
  }, [isPreviewOnly, sampleNews])

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

  const displayNews = isPreviewOnly ? news.slice(0, 2) : news.slice(0, 3)

  return (
    <div className="space-y-2">
      {displayNews.map((item, index) => (
        <div 
          key={index}
          className={`flex items-start gap-2 ${
            !isPreviewOnly ? 'cursor-pointer hover:text-blue-400' : ''
          }`}
          onClick={() => {
            if (!isPreviewOnly && item.url !== '#') {
              window.open(item.url, '_blank')
            }
          }}
        >
          <span className="text-blue-400 text-xs mt-0.5">•</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs leading-relaxed line-clamp-2">
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-xs">{item.source}</span>
              <span className="text-gray-600 text-xs">
                {new Date(item.publishedAt).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {isPreviewOnly && (
        <div className="text-center pt-2">
          <span className="text-gray-500 text-xs">+ more news in Pro plan</span>
        </div>
      )}
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