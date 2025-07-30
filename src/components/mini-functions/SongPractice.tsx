'use client'

import { useState, useEffect } from 'react'

interface Song {
  id: string
  title: string
  artist: string
  createdAt: string
}

interface SongPracticeProps {
  isPreviewOnly?: boolean
}

export default function SongPractice({ isPreviewOnly = false }: SongPracticeProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [newSong, setNewSong] = useState({ title: '', artist: '' })
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (isPreviewOnly) {
      // Sample data for preview
      setSongs([
        { id: '1', title: 'Dynamite', artist: 'BTS', createdAt: new Date().toISOString() },
        { id: '2', title: 'Butter', artist: 'BTS', createdAt: new Date().toISOString() },
        { id: '3', title: 'Spring Day', artist: 'BTS', createdAt: new Date().toISOString() }
      ])
      return
    }

    // Load from localStorage or API
    const saved = localStorage.getItem('koouk_song_practice')
    if (saved) {
      setSongs(JSON.parse(saved))
    }
  }, [isPreviewOnly])

  const addSong = () => {
    if (!newSong.title.trim() || !newSong.artist.trim()) return
    
    const song: Song = {
      id: Date.now().toString(),
      title: newSong.title.trim(),
      artist: newSong.artist.trim(),
      createdAt: new Date().toISOString()
    }
    
    const updatedSongs = [...songs, song]
    setSongs(updatedSongs)
    
    if (!isPreviewOnly) {
      localStorage.setItem('koouk_song_practice', JSON.stringify(updatedSongs))
    }
    
    setNewSong({ title: '', artist: '' })
    setIsAdding(false)
  }

  const deleteSong = (id: string) => {
    const updatedSongs = songs.filter(song => song.id !== id)
    setSongs(updatedSongs)
    
    if (!isPreviewOnly) {
      localStorage.setItem('koouk_song_practice', JSON.stringify(updatedSongs))
    }
  }

  return (
    <div className="space-y-3">
      {/* Summary for preview */}
      {isPreviewOnly ? (
        <div className="text-gray-300 text-sm">
          <div className="mb-2">연습 곡목: {songs.length}곡</div>
          {songs.slice(0, 2).map((song) => (
            <div key={song.id} className="text-xs text-gray-400">
              • {song.title} - {song.artist}
            </div>
          ))}
          {songs.length > 2 && <div className="text-xs text-gray-400">...외 {songs.length - 2}곡</div>}
        </div>
      ) : (
        <>
          {/* Full content */}
          <div className="space-y-2">
            {songs.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {songs.map((song) => (
                  <div key={song.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{song.title}</div>
                      <div className="text-gray-400 text-xs">{song.artist}</div>
                    </div>
                    <button
                      onClick={() => deleteSong(song.id)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                연습할 노래를 추가해보세요
              </div>
            )}
          </div>

          {/* Add new song */}
          {isAdding ? (
            <div className="space-y-2 p-3 bg-gray-800 rounded">
              <input
                type="text"
                value={newSong.title}
                onChange={(e) => setNewSong(prev => ({ ...prev, title: e.target.value }))}
                placeholder="노래 제목"
                className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
              />
              <input
                type="text"
                value={newSong.artist}
                onChange={(e) => setNewSong(prev => ({ ...prev, artist: e.target.value }))}
                placeholder="가수명"
                className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={addSong}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setNewSong({ title: '', artist: '' })
                  }}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2 border border-dashed border-gray-600 rounded text-gray-400 hover:text-gray-300 hover:border-gray-500 text-sm transition-colors"
            >
              + 새 노래 추가
            </button>
          )}
        </>
      )}
    </div>
  )
}