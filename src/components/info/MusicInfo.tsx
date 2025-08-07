'use client'

import { useState } from 'react'

type MusicItem = {
  id: string
  title: string
  artist: string
  genre: string
  mood: string
  spotifyUrl?: string
  youtubeUrl?: string
  description: string
  createdAt: string
}

export default function MusicInfo() {
  const [music, setMusic] = useState<MusicItem[]>([
    {
      id: '1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      genre: 'Pop',
      mood: '신나는',
      spotifyUrl: 'https://open.spotify.com/track/0VjIjW4GlULA8aXiGEAOzV',
      youtubeUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
      description: '드라이브할 때 듣기 좋은 곡',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Stay',
      artist: 'The Kid LAROI, Justin Bieber',
      genre: 'Pop',
      mood: '감성적',
      youtubeUrl: 'https://www.youtube.com/watch?v=kTJczUoc26U',
      description: '요즘 자주 듣는 곡',
      createdAt: new Date().toISOString()
    }
  ])

  const [newMusic, setNewMusic] = useState({
    title: '',
    artist: '',
    genre: '',
    mood: '',
    spotifyUrl: '',
    youtubeUrl: '',
    description: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const genres = ['Pop', 'Rock', 'Hip-hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Folk', 'Country']
  const moods = ['신나는', '감성적', '차분한', '슬픈', '행복한', '집중', '운동', '휴식']

  const addMusic = () => {
    if (newMusic.title && newMusic.artist) {
      const musicItem: MusicItem = {
        id: Date.now().toString(),
        ...newMusic,
        createdAt: new Date().toISOString()
      }
      setMusic(prev => [musicItem, ...prev])
      setNewMusic({
        title: '',
        artist: '',
        genre: '',
        mood: '',
        spotifyUrl: '',
        youtubeUrl: '',
        description: ''
      })
      setShowAddForm(false)
    }
  }

  const deleteMusic = (id: string) => {
    setMusic(prev => prev.filter(item => item.id !== id))
  }

  const openLink = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="h-full" style={{ 
      padding: 'var(--space-10) var(--space-8)',
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '1.125rem' }}>🎵</span>
            <div>
              <h1 style={{ 
                fontSize: 'var(--text-lg)',
                fontWeight: '300',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
                marginBottom: 'var(--space-2)'
              }}>
                음악 추천
              </h1>
              <p style={{ 
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                fontWeight: '400',
                lineHeight: '1.5'
              }}>
                좋아하는 음악들을 저장하고 관리하세요
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="transition-all duration-200 ease-out"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-card)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              letterSpacing: '0.01em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--text-secondary)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--text-primary)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            + 음악 추가
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-8 transition-all duration-300 ease-out animate-smooth-slideIn" style={{ 
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <h3 style={{ 
            fontSize: 'var(--text-xl)',
            fontWeight: '500',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            letterSpacing: '-0.01em'
          }}>
            새 음악 추가
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="곡 제목"
              value={newMusic.title}
              onChange={(e) => setNewMusic(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="아티스트"
              value={newMusic.artist}
              onChange={(e) => setNewMusic(prev => ({ ...prev, artist: e.target.value }))}
              required
            />
            <select
              value={newMusic.genre}
              onChange={(e) => setNewMusic(prev => ({ ...prev, genre: e.target.value }))}
              style={{
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3) var(--space-4)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-md)',
                outline: 'none'
              }}
            >
              <option value="">장르 선택</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <select
              value={newMusic.mood}
              onChange={(e) => setNewMusic(prev => ({ ...prev, mood: e.target.value }))}
              style={{
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3) var(--space-4)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-md)',
                outline: 'none'
              }}
            >
              <option value="">분위기 선택</option>
              {moods.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
            <input
              type="url"
              placeholder="Spotify URL (선택)"
              value={newMusic.spotifyUrl}
              onChange={(e) => setNewMusic(prev => ({ ...prev, spotifyUrl: e.target.value }))}
            />
            <input
              type="url"
              placeholder="YouTube URL (선택)"
              value={newMusic.youtubeUrl}
              onChange={(e) => setNewMusic(prev => ({ ...prev, youtubeUrl: e.target.value }))}
            />
          </div>
          
          <textarea
            placeholder="메모나 설명"
            value={newMusic.description}
            onChange={(e) => setNewMusic(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full mb-4"
          />

          <div className="flex gap-3">
            <button
              onClick={addMusic}
              className="transition-all duration-200 ease-out"
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-card)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-6)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500'
              }}
            >
              저장
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="transition-all duration-200 ease-out"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-6)',
                fontSize: 'var(--text-sm)',
                fontWeight: '400'
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Music Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {music.map(musicItem => (
          <div 
            key={musicItem.id} 
            className="group transition-all duration-300 ease-out"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-subtle)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 style={{ 
                  fontSize: 'var(--text-xl)',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-1)',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.3'
                }}>
                  {musicItem.title}
                </h3>
                <p style={{ 
                  fontSize: 'var(--text-md)',
                  color: 'var(--text-secondary)',
                  fontWeight: '400'
                }}>
                  {musicItem.artist}
                </p>
              </div>
              <button
                onClick={() => deleteMusic(musicItem.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  color: 'var(--text-tertiary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 'var(--space-1)',
                  fontSize: 'var(--text-lg)'
                }}
              >
                ×
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              {musicItem.genre && (
                <span style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--text-xs)',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '500'
                }}>
                  {musicItem.genre}
                </span>
              )}
              {musicItem.mood && (
                <span style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--text-xs)',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '500'
                }}>
                  {musicItem.mood}
                </span>
              )}
            </div>

            {musicItem.description && (
              <p style={{ 
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                marginBottom: 'var(--space-4)'
              }}>
                {musicItem.description}
              </p>
            )}

            <div className="flex gap-2">
              {musicItem.spotifyUrl && (
                <button
                  onClick={() => openLink(musicItem.spotifyUrl!)}
                  className="transition-all duration-200 ease-out"
                  style={{
                    backgroundColor: '#1DB954',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '500'
                  }}
                >
                  Spotify
                </button>
              )}
              {musicItem.youtubeUrl && (
                <button
                  onClick={() => openLink(musicItem.youtubeUrl!)}
                  className="transition-all duration-200 ease-out"
                  style={{
                    backgroundColor: '#FF0000',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '500'
                  }}
                >
                  YouTube
                </button>
              )}
            </div>

            <div style={{ 
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              marginTop: 'var(--space-4)'
            }}>
              {new Date(musicItem.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}