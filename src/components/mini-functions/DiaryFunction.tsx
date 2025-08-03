'use client'

import { useState, useEffect } from 'react'

interface DiaryEntry {
  date: string
  content: string
}

export default function DiaryFunction() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [content, setContent] = useState('')
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('miniFunction_diary')
    if (saved) {
      setEntries(JSON.parse(saved))
    }
  }, [])

  const saveToStorage = (newEntries: DiaryEntry[]) => {
    localStorage.setItem('miniFunction_diary', JSON.stringify(newEntries))
    setEntries(newEntries)
  }

  const saveEntry = () => {
    if (!selectedDate || !content.trim()) return

    const updated = entries.filter(entry => entry.date !== selectedDate)
    updated.push({ date: selectedDate, content: content.trim() })
    updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    saveToStorage(updated)
    setShowEditor(false)
    setContent('')
    setSelectedDate('')
  }

  const deleteEntry = (date: string) => {
    const updated = entries.filter(entry => entry.date !== date)
    saveToStorage(updated)
  }

  const editEntry = (date: string) => {
    const entry = entries.find(e => e.date === date)
    if (entry) {
      setSelectedDate(date)
      setContent(entry.content)
      setShowEditor(true)
    }
  }

  const startNewEntry = () => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
    setContent('')
    setShowEditor(true)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    if (diffDays === 2) return '그제'
    return `${diffDays}일 전`
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">일기 현황</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">총 일기: </span>
            <span className="text-white font-medium">{entries.length}개</span>
          </div>
          <div>
            <span className="text-gray-400">연속: </span>
            <span className="text-white font-medium">
              {entries.length > 0 ? Math.min(entries.length, 7) : 0}일
            </span>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={startNewEntry}
        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        오늘 일기 쓰기
      </button>

      {/* Editor */}
      {showEditor && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
            <span className="text-xs text-gray-400">{content.length}/500</span>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setContent(e.target.value)
              }
            }}
            placeholder="오늘 하루는 어땠나요? (500자 이내)"
            className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
          />
          
          <div className="flex gap-2">
            <button
              onClick={saveEntry}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors"
            >
              저장
            </button>
            <button
              onClick={() => {
                setShowEditor(false)
                setContent('')
                setSelectedDate('')
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {entries.slice(0, 10).map(entry => (
          <div key={entry.date} className="bg-gray-800/40 rounded border border-gray-700/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-white">
                {entry.date} ({formatDate(entry.date)})
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => editEntry(entry.date)}
                  className="text-xs text-gray-400 hover:text-blue-400"
                >
                  수정
                </button>
                <button
                  onClick={() => deleteEntry(entry.date)}
                  className="text-xs text-gray-400 hover:text-red-400"
                >
                  삭제
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-300 line-clamp-3">
              {entry.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}