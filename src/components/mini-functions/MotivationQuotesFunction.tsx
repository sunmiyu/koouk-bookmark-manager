'use client'

import { useState, useEffect } from 'react'

interface Quote {
  id: string
  text: string
  author: string
  category: string
  isFavorite: boolean
  dateAdded: string
}

interface QuoteSettings {
  dailyQuote: boolean
  categories: string[]
  showAuthor: boolean
  language: 'ko' | 'en'
}

export default function MotivationQuotesFunction() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [settings, setSettings] = useState<QuoteSettings | null>(null)
  const [todayQuote, setTodayQuote] = useState<Quote | null>(null)

  useEffect(() => {
    const savedQuotes = localStorage.getItem('miniFunction_quotes')
    const savedSettings = localStorage.getItem('miniFunction_quoteSettings')
    
    if (savedQuotes) setQuotes(JSON.parse(savedQuotes))
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [])

  useEffect(() => {
    if (quotes.length > 0 && settings?.dailyQuote) {
      // Get today's quote (same quote for the same day)
      const today = new Date().toISOString().split('T')[0]
      const seed = today.split('-').join('')
      const index = parseInt(seed) % quotes.length
      setTodayQuote(quotes[index])
    }
  }, [quotes, settings])

  const getFavoriteQuotes = () => {
    return quotes.filter(quote => quote.isFavorite).slice(0, 3)
  }

  const getRecentQuotes = () => {
    return quotes
      .filter(quote => {
        const quoteDate = new Date(quote.dateAdded)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return quoteDate >= weekAgo
      })
      .slice(0, 3)
  }

  const getCategoryStats = () => {
    const categoryCount: { [key: string]: number } = {}
    quotes.forEach(quote => {
      categoryCount[quote.category] = (categoryCount[quote.category] || 0) + 1
    })
    return Object.entries(categoryCount).sort((a, b) => b[1] - a[1])
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '성공': return '🏆'
      case '동기부여': return '💪'
      case '인생': return '🌟'
      case '사랑': return '❤️'
      case '지혜': return '🧠'
      case '행복': return '😊'
      case '도전': return '🚀'
      case '꿈': return '💭'
      default: return '✨'
    }
  }

  const favoriteQuotes = getFavoriteQuotes()
  const recentQuotes = getRecentQuotes()
  const categoryStats = getCategoryStats()

  return (
    <div className="space-y-4">
      {/* Today's Quote */}
      {todayQuote && (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/30 rounded-lg p-4">
          <div className="text-sm text-purple-400 mb-2 flex items-center gap-1">
            <span>✨</span>
            <span>오늘의 명언</span>
          </div>
          <div className="text-white text-sm font-medium mb-2 leading-relaxed">
            &quot;{todayQuote.text}&quot;
          </div>
          {settings?.showAuthor && (
            <div className="text-xs text-gray-400 text-right">
              - {todayQuote.author}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className={`px-2 py-1 text-xs rounded-full bg-purple-600/20 text-purple-400`}>
              {todayQuote.category}
            </span>
            {todayQuote.isFavorite && (
              <span className="text-yellow-400 text-sm">⭐</span>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">명언 현황</div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-gray-400">전체 명언: </span>
            <span className="text-white font-medium">{quotes.length}개</span>
          </div>
          <div>
            <span className="text-gray-400">즐겨찾기: </span>
            <span className="text-white font-medium">{favoriteQuotes.length}개</span>
          </div>
          <div>
            <span className="text-gray-400">카테고리: </span>
            <span className="text-white font-medium">{categoryStats.length}개</span>
          </div>
        </div>
      </div>

      {/* Settings Info */}
      <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
        <div className="text-sm text-green-400 mb-1">동기부여 글귀 설정</div>
        <div className="text-xs text-gray-300">
          톱니바퀴 → Mini Function Control에서 명언을 추가하고 카테고리를 관리할 수 있습니다.
        </div>
      </div>

      {/* Favorite Quotes */}
      {favoriteQuotes.length > 0 && (
        <div>
          <div className="text-sm font-medium text-white mb-2">즐겨찾기 명언</div>
          <div className="space-y-2">
            {favoriteQuotes.map(quote => (
              <div key={quote.id} className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                <div className="text-sm text-white mb-1 leading-relaxed">
                  &quot;{quote.text}&quot;
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(quote.category)}</span>
                    <span className="text-xs text-gray-400">{quote.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {settings?.showAuthor && quote.author && (
                      <span className="text-xs text-gray-400">- {quote.author}</span>
                    )}
                    <span className="text-yellow-400 text-sm">⭐</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Quotes */}
      {recentQuotes.length > 0 && favoriteQuotes.length !== recentQuotes.length && (
        <div>
          <div className="text-sm font-medium text-white mb-2">최근 추가된 명언</div>
          <div className="space-y-2">
            {recentQuotes.filter(quote => !quote.isFavorite).slice(0, 2).map(quote => (
              <div key={quote.id} className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-3">
                <div className="text-sm text-white mb-1 leading-relaxed">
                  &quot;{quote.text}&quot;
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(quote.category)}</span>
                    <span className="text-xs text-gray-400">{quote.category}</span>
                  </div>
                  {settings?.showAuthor && quote.author && (
                    <span className="text-xs text-gray-400">- {quote.author}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Stats */}
      {categoryStats.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
          <div className="text-sm text-blue-400 mb-2">카테고리별 통계</div>
          <div className="grid grid-cols-2 gap-2">
            {categoryStats.slice(0, 4).map(([category, count]) => (
              <div key={category} className="flex items-center gap-2">
                <span className="text-lg">{getCategoryIcon(category)}</span>
                <div className="flex-1">
                  <div className="text-xs text-white">{category}</div>
                  <div className="text-xs text-gray-400">{count}개</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Random Inspiration */}
      <div className="bg-gradient-to-r from-pink-900/20 to-orange-900/20 border border-pink-700/30 rounded-lg p-3">
        <div className="text-sm text-pink-400 mb-2">💡 일일 영감</div>
        <div className="text-xs text-gray-300">
          {quotes.length > 0 
            ? `${quotes.length}개의 명언이 당신의 동기부여를 위해 준비되어 있습니다.`
            : '첫 번째 명언을 추가해서 매일 영감을 받아보세요!'
          }
        </div>
      </div>

      {/* Empty State */}
      {quotes.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          아직 추가된 명언이 없습니다
        </div>
      )}
    </div>
  )
}