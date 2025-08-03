'use client'

import { useState, useEffect } from 'react'

interface SongNote {
  id: string
  date: string
  song: string
  artist: string
  note: string
  rating?: number
}

export default function SongPracticeFunction() {
  const [notes, setNotes] = useState<SongNote[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNote, setNewNote] = useState({
    song: '',
    artist: '',
    note: '',
    rating: 3
  })

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('miniFunction_songPractice')
    if (saved) {
      setNotes(JSON.parse(saved))
    }
  }, [])

  const saveToStorage = (newNotes: SongNote[]) => {
    localStorage.setItem('miniFunction_songPractice', JSON.stringify(newNotes))
    setNotes(newNotes)
  }

  const addNote = () => {
    if (!newNote.song.trim() || !newNote.note.trim()) return

    const note: SongNote = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      song: newNote.song.trim(),
      artist: newNote.artist.trim() || '알 수 없음',
      note: newNote.note.trim(),
      rating: newNote.rating
    }

    const updated = [note, ...notes]
    saveToStorage(updated)
    
    setNewNote({
      song: '',
      artist: '',
      note: '',
      rating: 3
    })
    setShowAddForm(false)
  }

  const deleteNote = (id: string) => {
    const updated = notes.filter(note => note.id !== id)
    saveToStorage(updated)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    return `${diffDays}일 전`
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}>
        ★
      </span>
    ))
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">연습 현황</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">총 연습곡: </span>
            <span className="text-white font-medium">{notes.length}곡</span>
          </div>
          <div>
            <span className="text-gray-400">이번 주: </span>
            <span className="text-white font-medium">
              {notes.filter(note => {
                const noteDate = new Date(note.date)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return noteDate >= weekAgo
              }).length}곡
            </span>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {showAddForm ? '취소' : '+ 연습 노트 추가'}
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder="노래 제목"
            value={newNote.song}
            onChange={(e) => setNewNote(prev => ({ ...prev, song: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          />
          
          <input
            type="text"
            placeholder="가수명 (선택)"
            value={newNote.artist}
            onChange={(e) => setNewNote(prev => ({ ...prev, artist: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          />
          
          <div>
            <div className="text-xs text-gray-400 mb-2">연습 만족도</div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setNewNote(prev => ({ ...prev, rating: i + 1 }))}
                  className={`text-lg ${i < newNote.rating ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <textarea
            placeholder="연습 내용, 느낀 점, 개선할 점 등을 적어보세요..."
            value={newNote.note}
            onChange={(e) => setNewNote(prev => ({ ...prev, note: e.target.value }))}
            className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
          />
          
          <button
            onClick={addNote}
            className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm font-medium transition-colors"
          >
            저장
          </button>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {notes.slice(0, 10).map(note => (
          <div key={note.id} className="bg-gray-800/40 rounded border border-gray-700/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {note.song}
                </div>
                <div className="text-xs text-gray-400">
                  {note.artist} • {note.date} ({formatDate(note.date)})
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {renderStars(note.rating || 0)}
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-gray-500 hover:text-red-400 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-300 line-clamp-2">
              {note.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}