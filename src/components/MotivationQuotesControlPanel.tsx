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

export default function MotivationQuotesControlPanel() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [settings, setSettings] = useState<QuoteSettings>({
    dailyQuote: true,
    categories: ['성공', '동기부여', '인생', '사랑', '지혜', '행복', '도전', '꿈'],
    showAuthor: true,
    language: 'ko'
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuote, setNewQuote] = useState({
    text: '',
    author: '',
    category: '동기부여'
  })

  const defaultCategories = ['성공', '동기부여', '인생', '사랑', '지혜', '행복', '도전', '꿈', '우정', '가족', '일', '창의성']

  const inspirationalQuotes = [
    { text: "성공은 준비된 자에게 기회가 왔을 때 이루어진다.", author: "루이 파스퇴르", category: "성공" },
    { text: "꿈을 포기하지 마라. 꿈이 없으면 희망도 없고, 희망이 없으면 인생도 없다.", author: "할리우드", category: "꿈" },
    { text: "최고가 되려고 하지 말고, 유일한 존재가 되어라.", author: "워렌 버핏", category: "성공" },
    { text: "행복은 습관이다. 그것을 몸에 지니라.", author: "허버드", category: "행복" },
    { text: "실패는 성공의 어머니다.", author: "토머스 에디슨", category: "도전" },
    { text: "지혜는 경험의 딸이다.", author: "레오나르도 다 빈치", category: "지혜" },
    { text: "사랑은 마음의 눈으로 보는 것이다.", author: "셰익스피어", category: "사랑" },
    { text: "인생은 가까이서 보면 비극이지만, 멀리서 보면 희극이다.", author: "찰리 채플린", category: "인생" },
    { text: "위대한 일을 하려면 두 가지가 필요하다: 계획과 충분하지 않은 시간.", author: "레오나드 번스타인", category: "동기부여" },
    { text: "변화를 원한다면 스스로 그 변화가 되어라.", author: "마하트마 간디", category: "동기부여" }
  ]

  useEffect(() => {
    const savedQuotes = localStorage.getItem('miniFunction_quotes')
    const savedSettings = localStorage.getItem('miniFunction_quoteSettings')
    
    if (savedQuotes) {
      setQuotes(JSON.parse(savedQuotes))
    } else {
      // Add some default quotes
      const defaultQuotes = inspirationalQuotes.map((quote, index) => ({
        id: (index + 1).toString(),
        ...quote,
        isFavorite: index < 3, // First 3 as favorites
        dateAdded: new Date().toISOString()
      }))
      setQuotes(defaultQuotes)
      localStorage.setItem('miniFunction_quotes', JSON.stringify(defaultQuotes))
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    } else {
      localStorage.setItem('miniFunction_quoteSettings', JSON.stringify(settings))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveQuotes = (newQuotes: Quote[]) => {
    localStorage.setItem('miniFunction_quotes', JSON.stringify(newQuotes))
    setQuotes(newQuotes)
  }

  const saveSettings = (newSettings: QuoteSettings) => {
    localStorage.setItem('miniFunction_quoteSettings', JSON.stringify(newSettings))
    setSettings(newSettings)
  }

  const addQuote = () => {
    if (!newQuote.text.trim()) return

    const quote: Quote = {
      id: Date.now().toString(),
      text: newQuote.text.trim(),
      author: newQuote.author.trim() || '익명',
      category: newQuote.category,
      isFavorite: false,
      dateAdded: new Date().toISOString()
    }

    const updated = [...quotes, quote]
    saveQuotes(updated)
    
    setNewQuote({
      text: '',
      author: '',
      category: '동기부여'
    })
    setShowAddForm(false)
  }

  const toggleFavorite = (id: string) => {
    const updated = quotes.map(quote =>
      quote.id === id ? { ...quote, isFavorite: !quote.isFavorite } : quote
    )
    saveQuotes(updated)
  }

  const deleteQuote = (id: string) => {
    if (confirm('이 명언을 삭제하시겠습니까?')) {
      const updated = quotes.filter(quote => quote.id !== id)
      saveQuotes(updated)
    }
  }

  const addInspirationalQuote = (inspirational: typeof inspirationalQuotes[0]) => {
    const quote: Quote = {
      id: Date.now().toString(),
      text: inspirational.text,
      author: inspirational.author,
      category: inspirational.category,
      isFavorite: false,
      dateAdded: new Date().toISOString()
    }

    const updated = [...quotes, quote]
    saveQuotes(updated)
  }

  const updateSettings = (key: keyof QuoteSettings, value: string | boolean | string[]) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
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
      case '우정': return '🤝'
      case '가족': return '👨‍👩‍👧‍👦'
      case '일': return '💼'
      case '창의성': return '🎨'
      default: return '✨'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">동기부여 글귀 관리</h3>
          <p className="text-sm text-gray-600">영감을 주는 명언을 추가하고 관리하세요</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showAddForm ? '취소' : '+ 명언 추가'}
        </button>
      </div>

      {/* Settings */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
        <h4 className="text-md font-medium text-gray-900">설정</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="dailyQuote"
              checked={settings.dailyQuote}
              onChange={(e) => updateSettings('dailyQuote', e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="dailyQuote" className="text-sm text-gray-700">
              매일 새로운 명언 표시
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showAuthor"
              checked={settings.showAuthor}
              onChange={(e) => updateSettings('showAuthor', e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="showAuthor" className="text-sm text-gray-700">
              작가 이름 표시
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">언어 설정</label>
          <select
            value={settings.language}
            onChange={(e) => updateSettings('language', e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <h4 className="text-md font-medium text-gray-900">새 명언 추가</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">명언 내용</label>
            <textarea
              placeholder="영감을 주는 명언을 입력하세요..."
              value={newQuote.text}
              onChange={(e) => setNewQuote(prev => ({ ...prev, text: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">작가 (선택사항)</label>
              <input
                type="text"
                placeholder="예: 스티브 잡스, 아인슈타인"
                value={newQuote.author}
                onChange={(e) => setNewQuote(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={newQuote.category}
                onChange={(e) => setNewQuote(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
              >
                {defaultCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={addQuote}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            명언 저장
          </button>
        </div>
      )}

      {/* Inspirational Quotes */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">추천 명언</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {inspirationalQuotes.filter(inspirational => 
            !quotes.some(quote => quote.text === inspirational.text)
          ).slice(0, 6).map((inspirational, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="text-sm text-gray-900 mb-2 leading-relaxed">
                &quot;{inspirational.text}&quot;
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  - {inspirational.author}
                </div>
                <button
                  onClick={() => addInspirationalQuote(inspirational)}
                  className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quotes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-900">나의 명언 ({quotes.length}개)</h4>
        </div>
        
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 추가된 명언이 없습니다
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {quotes.map(quote => (
              <div key={quote.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 mb-2 leading-relaxed">
                      &quot;{quote.text}&quot;
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(quote.category)}</span>
                      <span className="text-xs text-gray-500">{quote.category}</span>
                      {quote.isFavorite && (
                        <span className="text-yellow-500 text-sm">⭐</span>
                      )}
                    </div>
                    {quote.author && (
                      <div className="text-xs text-gray-500">
                        - {quote.author}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(quote.dateAdded).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleFavorite(quote.id)}
                      className={`p-2 rounded transition-colors ${
                        quote.isFavorite 
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={quote.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    >
                      <svg className="w-4 h-4" fill={quote.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteQuote(quote.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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