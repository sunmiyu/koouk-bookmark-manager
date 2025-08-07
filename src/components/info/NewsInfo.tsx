'use client'

import { useState } from 'react'

type NewsArticle = {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  category: string
}

export default function NewsInfo() {
  const [articles] = useState<NewsArticle[]>([
    {
      id: '1',
      title: 'AI 기술의 새로운 돌파구, 차세대 언어모델 발표',
      summary: '최신 AI 연구에서 획기적인 성과를 발표했습니다. 이번 기술은 기존 모델보다 효율성이 크게 향상되었습니다.',
      url: 'https://example.com/news1',
      source: 'Tech News',
      publishedAt: new Date().toISOString(),
      category: '기술'
    },
    {
      id: '2',
      title: '글로벌 경제 전망, 2024년 성장률 예측',
      summary: '전문가들이 내년 경제 성장률을 예측했습니다. 주요 경제 지표들을 종합적으로 분석한 결과입니다.',
      url: 'https://example.com/news2',
      source: 'Economic Times',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      category: '경제'
    },
    {
      id: '3',
      title: '새로운 친환경 에너지 솔루션 개발',
      summary: '재생 가능 에너지 분야에서 혁신적인 기술이 개발되었습니다. 환경 보호와 경제성을 동시에 만족시킵니다.',
      url: 'https://example.com/news3',
      source: 'Green Tech',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      category: '환경'
    }
  ])

  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [refreshing, setRefreshing] = useState(false)

  const categories = ['전체', '기술', '경제', '정치', '사회', '문화', '스포츠', '환경']

  const filteredArticles = selectedCategory === '전체' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory)

  const refreshNews = async () => {
    setRefreshing(true)
    // 실제로는 뉴스 API 호출
    setTimeout(() => {
      console.log('뉴스 새로고침 완료')
      setRefreshing(false)
    }, 1000)
  }

  const openArticle = (url: string) => {
    window.open(url, '_blank')
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const publishedDate = new Date(dateString)
    const diffInMs = now.getTime() - publishedDate.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

    if (diffInHours < 1) {
      return `${diffInMinutes}분 전`
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}일 전`
    }
  }

  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">📰</span>
            <h1 style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: '700', 
              color: 'var(--text-primary)' 
            }}>
              뉴스
            </h1>
          </div>
          
          <button
            onClick={refreshNews}
            disabled={refreshing}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {refreshing ? '새로고침 중...' : '🔄 새로고침'}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg border p-4 mb-6" style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)'
      }}>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedCategory === category ? 'var(--accent)' : 'var(--bg-secondary)',
                color: selectedCategory === category ? 'white' : 'var(--text-secondary)'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* News Articles */}
      <div className="space-y-4">
        {filteredArticles.map(article => (
          <div key={article.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer" 
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-light)'
            }}
            onClick={() => openArticle(article.url)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                  {article.category}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {article.source}
                </span>
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatTimeAgo(article.publishedAt)}
              </span>
            </div>
            
            <h3 className="font-semibold mb-2 hover:text-blue-600 transition-colors" style={{ 
              color: 'var(--text-primary)',
              fontSize: 'var(--text-lg)'
            }}>
              {article.title}
            </h3>
            
            <p className="mb-4 line-clamp-2" style={{ 
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-sm)'
            }}>
              {article.summary}
            </p>
            
            <div className="flex justify-between items-center">
              <span className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                기사 읽기 →
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('북마크:', article.title)
                  }}
                  className="text-yellow-500 hover:text-yellow-600"
                  title="북마크"
                >
                  ⭐
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('공유:', article.title)
                  }}
                  className="text-gray-500 hover:text-gray-600"
                  title="공유"
                >
                  📤
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-lg mb-4">📰</div>
            <h3 style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)'
            }}>
              {selectedCategory} 뉴스가 없습니다
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              다른 카테고리를 선택해보세요.
            </p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => console.log('더 많은 뉴스 로드')}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          style={{
            borderColor: 'var(--border-light)',
            color: 'var(--text-secondary)'
          }}
        >
          더 많은 뉴스 보기
        </button>
      </div>
    </div>
  )
}