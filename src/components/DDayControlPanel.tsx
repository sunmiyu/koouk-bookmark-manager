'use client'

import { useState, useEffect } from 'react'

interface DDayEvent {
  id: string
  title: string
  date: string
  category: string
  color: string
}

export default function DDayControlPanel() {
  const [events, setEvents] = useState<DDayEvent[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    category: '개인',
    color: 'blue'
  })

  const categories = ['개인', '업무', '학업', '기념일', '의료', '여행', '운동', '기타']
  const colors = [
    { name: 'blue', label: '파랑', class: 'bg-blue-500' },
    { name: 'red', label: '빨강', class: 'bg-red-500' },
    { name: 'green', label: '초록', class: 'bg-green-500' },
    { name: 'purple', label: '보라', class: 'bg-purple-500' },
    { name: 'yellow', label: '노랑', class: 'bg-yellow-500' },
    { name: 'pink', label: '분홍', class: 'bg-pink-500' }
  ]

  useEffect(() => {
    const saved = localStorage.getItem('miniFunction_dday')
    if (saved) {
      setEvents(JSON.parse(saved))
    }
  }, [])

  const saveToStorage = (newEvents: DDayEvent[]) => {
    localStorage.setItem('miniFunction_dday', JSON.stringify(newEvents))
    setEvents(newEvents)
  }

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return

    const event: DDayEvent = {
      id: Date.now().toString(),
      title: newEvent.title.trim(),
      date: newEvent.date,
      category: newEvent.category,
      color: newEvent.color
    }

    const updated = [...events, event].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    saveToStorage(updated)
    
    setNewEvent({
      title: '',
      date: '',
      category: '개인',
      color: 'blue'
    })
    setShowAddForm(false)
  }

  const deleteEvent = (id: string) => {
    if (confirm('이 D-Day 이벤트를 삭제하시겠습니까?')) {
      const updated = events.filter(event => event.id !== id)
      saveToStorage(updated)
    }
  }

  const calculateDDay = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    
    today.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)
    
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const formatDDay = (days: number) => {
    if (days === 0) return 'D-Day!'
    if (days > 0) return `D-${days}`
    return `D+${Math.abs(days)}`
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-200 bg-red-50'
      case 'blue': return 'border-blue-200 bg-blue-50'
      case 'green': return 'border-green-200 bg-green-50'
      case 'purple': return 'border-purple-200 bg-purple-50'
      case 'yellow': return 'border-yellow-200 bg-yellow-50'
      case 'pink': return 'border-pink-200 bg-pink-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">D-Day 관리</h3>
          <p className="text-sm text-gray-600">중요한 날짜를 추가하고 관리하세요</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showAddForm ? '취소' : '+ D-Day 추가'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이벤트명</label>
              <input
                type="text"
                placeholder="예: 생일, 시험, 여행"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setNewEvent(prev => ({ ...prev, color: color.name }))}
                    className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                      newEvent.color === color.name ? 'border-gray-900 scale-110' : 'border-gray-300'
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={addEvent}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            D-Day 저장
          </button>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 설정된 D-Day 이벤트가 없습니다
          </div>
        ) : (
          events.map(event => {
            const dDay = calculateDDay(event.date)
            return (
              <div key={event.id} className={`border rounded-lg p-4 ${getColorClass(event.color)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {event.title}
                      </span>
                      <span className={`text-2xl font-bold ${
                        dDay === 0 ? 'text-red-600' : 
                        dDay > 0 && dDay <= 7 ? 'text-orange-600' : 
                        dDay > 0 ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {formatDDay(dDay)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.date} • {event.category}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}