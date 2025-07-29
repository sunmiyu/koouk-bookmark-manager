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

  // Real news data with actual links - memoized to prevent re-renders
  const sampleNews: NewsItem[] = useMemo(() => [
    {
      title: "삼성전자, 3분기 영업이익 9조7000억원 기록",
      url: "https://www.hankyung.com/",
      source: "한국경제",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2시간 전
    },
    {
      title: "AI 혁신으로 인한 미래 일자리 변화 전망",
      url: "https://www.joongang.co.kr/",
      source: "중앙일보",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4시간 전
    },
    {
      title: "정부, 부동산 정책 변화 발표 예정",
      url: "https://www.yna.co.kr/",
      source: "연합뉴스",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6시간 전
    },
    {
      title: "K-콘텐츠 해외 수출 역대 최고 기록",
      url: "https://www.chosun.com/",
      source: "조선일보",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8시간 전
    },
    {
      title: "신재생에너지 투자 확대 계획 발표",
      url: "https://www.mk.co.kr/",
      source: "매일경제",
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() // 10시간 전
    },
    {
      title: "전기차 배터리 기술 혁신 성과",
      url: "https://www.sedaily.com/",
      source: "서울경제",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12시간 전
    },
    {
      title: "반도체 업계 글로벌 경쟁력 강화",
      url: "https://www.etnews.com/",
      source: "전자신문",
      publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() // 14시간 전
    },
    {
      title: "바이오헬스 산업 성장세 지속",
      url: "https://www.ajunews.com/",
      source: "아주경제",
      publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString() // 16시간 전
    },
    {
      title: "스타트업 투자 시장 회복 조짐",
      url: "https://www.dt.co.kr/",
      source: "디지털타임스",
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() // 18시간 전
    },
    {
      title: "메타버스 플랫폼 이용자 급증",
      url: "https://www.zdnet.co.kr/",
      source: "ZDNet Korea",
      publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() // 20시간 전
    }
  ], [])

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
          // For now, use sample data with longer list (10 news items)
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
          {/* 제목만 표시 (메인 카드용) */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-white truncate flex-1">
              {item.title}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0 ml-2">
              <span>{item.source}</span>
              <span>•</span>
              <span>
                {new Date(item.publishedAt).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
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