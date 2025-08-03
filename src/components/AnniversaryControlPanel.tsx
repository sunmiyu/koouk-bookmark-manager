'use client'

import { useState, useEffect } from 'react'

interface Anniversary {
  id: string
  title: string
  date: string // MM-DD format for yearly recurring
  year?: number // Optional original year
  category: string
  recurring: boolean
}

export default function AnniversaryControlPanel() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAnniversary, setNewAnniversary] = useState({
    title: '',
    fullDate: '', // YYYY-MM-DD for input
    category: '생일',
    recurring: true
  })

  const categories = ['생일', '결혼기념일', '연인기념일', '입사기념일', '졸업기념일', '가족', '기타']

  useEffect(() => {
    const saved = localStorage.getItem('miniFunction_anniversaries')
    if (saved) {
      setAnniversaries(JSON.parse(saved))
    }
  }, [])

  const saveToStorage = (newAnniversaries: Anniversary[]) => {
    localStorage.setItem('miniFunction_anniversaries', JSON.stringify(newAnniversaries))
    setAnniversaries(newAnniversaries)
  }

  const addAnniversary = () => {
    if (!newAnniversary.title.trim() || !newAnniversary.fullDate) return

    const fullDate = new Date(newAnniversary.fullDate)
    const month = String(fullDate.getMonth() + 1).padStart(2, '0')
    const day = String(fullDate.getDate()).padStart(2, '0')

    const anniversary: Anniversary = {
      id: Date.now().toString(),
      title: newAnniversary.title.trim(),
      date: `${month}-${day}`,
      year: fullDate.getFullYear(),
      category: newAnniversary.category,
      recurring: newAnniversary.recurring
    }

    const updated = [...anniversaries, anniversary].sort((a, b) => a.date.localeCompare(b.date))
    saveToStorage(updated)
    
    setNewAnniversary({
      title: '',
      fullDate: '',
      category: '생일',
      recurring: true
    })
    setShowAddForm(false)
  }

  const deleteAnniversary = (id: string) => {
    if (confirm('이 기념일을 삭제하시겠습니까?')) {
      const updated = anniversaries.filter(anniversary => anniversary.id !== id)
      saveToStorage(updated)
    }
  }

  const calculateNextAnniversary = (date: string, year?: number) => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const [month, day] = date.split('-').map(Number)
    
    let nextDate = new Date(currentYear, month - 1, day)
    
    if (nextDate < today) {
      nextDate = new Date(currentYear + 1, month - 1, day)
    }
    
    return {
      nextDate,
      yearsSince: year ? currentYear - year : 0
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '생일': return '🎂'
      case '결혼기념일': return '💒'
      case '연인기념일': return '💕'
      case '입사기념일': return '💼'
      case '졸업기념일': return '🎓'
      case '가족': return '👨‍👩‍👧‍👦'
      default: return '🎉'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">기념일 관리</h3>
          <p className="text-sm text-gray-600">중요한 기념일을 추가하고 관리하세요</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showAddForm ? '취소' : '+ 기념일 추가'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기념일명</label>
              <input
                type="text"
                placeholder="예: 엄마 생일, 결혼기념일"
                value={newAnniversary.title}
                onChange={(e) => setNewAnniversary(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
              <input
                type="date"
                value={newAnniversary.fullDate}
                onChange={(e) => setNewAnniversary(prev => ({ ...prev, fullDate: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={newAnniversary.category}
                onChange={(e) => setNewAnniversary(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newAnniversary.recurring}
                  onChange={(e) => setNewAnniversary(prev => ({ ...prev, recurring: e.target.checked }))}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                  매년 반복
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={addAnniversary}
            className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            기념일 저장
          </button>
        </div>
      )}

      {/* Anniversaries List */}
      <div className="space-y-3">
        {anniversaries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 설정된 기념일이 없습니다
          </div>
        ) : (
          anniversaries.map(anniversary => {
            const info = calculateNextAnniversary(anniversary.date, anniversary.year)
            const [month, day] = anniversary.date.split('-').map(Number)
            
            return (
              <div key={anniversary.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(anniversary.category)}</span>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {anniversary.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {month}월 {day}일 • {anniversary.category}
                      {info.yearsSince > 0 && ` • ${info.yearsSince}주년`}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {anniversary.recurring && (
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                          매년 반복
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        다음: {info.nextDate.getFullYear()}년 {month}월 {day}일
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteAnniversary(anniversary.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Todo Integration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Todo 연동</h4>
            <p className="text-sm text-blue-700">
              기념일이 다가오면 자동으로 Todo 리스트에 준비 사항이 추가됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}