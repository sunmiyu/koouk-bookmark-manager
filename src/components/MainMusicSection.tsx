'use client'

import { useState, useEffect, useCallback } from 'react'
import { MusicRecommendation, MoodType } from '@/types/miniFunctions'
import Image from 'next/image'

const MOOD_OPTIONS: { value: MoodType; label: string; emoji: string }[] = [
  { value: 'morning', label: 'Morning', emoji: '☀️' },
  { value: 'focus', label: 'Focus', emoji: '🎯' },
  { value: 'relax', label: 'Relax', emoji: '😌' },
  { value: 'workout', label: 'Workout', emoji: '💪' },
  { value: 'evening', label: 'Evening', emoji: '🌅' },
  { value: 'sleep', label: 'Sleep', emoji: '😴' }
]

// 썸네일 이미지 컴포넌트 (오류 처리용)
function MusicThumbnail({ src, alt, title }: { src: string; alt: string; title: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('https://img.youtube.com/vi/default/mqdefault.jpg')
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      onError={handleError}
      title={title}
    />
  )
}

export default function MainMusicSection() {
  const [recommendations, setRecommendations] = useState<MusicRecommendation[]>([])
  const [selectedMood, setSelectedMood] = useState<MoodType>('relax')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 음악 추천 API 호출
  const fetchRecommendations = useCallback(async (mood: MoodType) => {
    setLoading(true)
    setError(null)

    try {
      // 타임아웃 추가
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8초 타임아웃
      
      const response = await fetch(`/api/music-recommendations?mood=${mood}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()

      if (data.success && data.recommendations) {
        // 메인 페이지에서는 4개만 표시
        setRecommendations(data.recommendations.slice(0, 4))
        console.log('Music API loaded:', data.recommendations.length, 'tracks')
      } else {
        throw new Error('Failed to fetch music recommendations')
      }
    } catch (err) {
      console.error('Music recommendations error:', err)
      setError('Using sample music (API unavailable)')
      // 폴백 데이터
      setRecommendations([
        {
          id: 'fallback1',
          title: 'Relaxing Piano Music',
          artist: 'Peaceful Sounds',
          thumbnail: 'https://img.youtube.com/vi/WeY-u3nL67k/mqdefault.jpg',
          youtubeUrl: 'https://www.youtube.com/watch?v=WeY-u3nL67k',
          spotifyUrl: 'https://open.spotify.com/search/relaxing%20piano'
        },
        {
          id: 'fallback2',
          title: 'Ambient Study Music',
          artist: 'Focus Music',
          thumbnail: 'https://img.youtube.com/vi/rUxyKA_-grg/mqdefault.jpg',
          youtubeUrl: 'https://www.youtube.com/watch?v=rUxyKA_-grg',
          spotifyUrl: 'https://open.spotify.com/search/ambient%20study'
        },
        {
          id: 'fallback3',
          title: 'Nature Sounds',
          artist: 'Relaxation Music',
          thumbnail: 'https://img.youtube.com/vi/36YnV9STBqc/mqdefault.jpg',
          youtubeUrl: 'https://www.youtube.com/watch?v=36YnV9STBqc',
          spotifyUrl: 'https://open.spotify.com/search/nature%20sounds'
        },
        {
          id: 'fallback4',
          title: 'Lofi Hip Hop',
          artist: 'Chill Beats',
          thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg',
          youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
          spotifyUrl: 'https://open.spotify.com/search/lofi%20hip%20hop'
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  // 컴포넌트 마운트 시 및 mood 변경 시 추천 음악 로드
  useEffect(() => {
    fetchRecommendations(selectedMood)
  }, [selectedMood, fetchRecommendations])

  // Mood 변경 핸들러
  const handleMoodChange = (mood: MoodType) => {
    setSelectedMood(mood)
  }

  // 새로고침 핸들러
  const handleRefresh = () => {
    fetchRecommendations(selectedMood)
  }

  // Spotify 검색 URL 생성
  const getSpotifyUrl = (music: MusicRecommendation) => {
    if (music.spotifyUrl) {
      return music.spotifyUrl
    }
    // Spotify URL이 없으면 검색 URL 생성
    const query = encodeURIComponent(`${music.title} ${music.artist}`)
    return `https://open.spotify.com/search/${query}`
  }

  return (
    <div className="mb-4">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800/50">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-white">Music for You</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
                {MOOD_OPTIONS.find(m => m.value === selectedMood)?.emoji} {MOOD_OPTIONS.find(m => m.value === selectedMood)?.label}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-gray-400 hover:text-gray-300 disabled:opacity-50 transition-colors"
            title="Get new recommendations"
          >
            <svg 
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Mood Selection */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodChange(mood.value)}
                disabled={loading}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedMood === mood.value
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                } disabled:opacity-50`}
              >
                {mood.emoji} {mood.label}
              </button>
            ))}
          </div>
        </div>

        {/* Music Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-16 h-12 bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error && recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-red-400 mb-2">{error}</div>
            <button
              onClick={handleRefresh}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((music) => (
              <div key={music.id} className="group bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-all duration-200">
                <div className="flex items-center gap-4">
                  {/* 썸네일 */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-12 rounded-lg overflow-hidden relative shadow-lg">
                      <MusicThumbnail
                        src={music.thumbnail}
                        alt={music.title}
                        title={music.title}
                      />
                    </div>
                  </div>
                  
                  {/* 음악 정보 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1">
                      {music.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {music.artist}
                    </p>
                  </div>
                  
                  {/* 플레이 버튼들 */}
                  <div className="flex items-center gap-2">
                    {/* YouTube 버튼 */}
                    <a
                      href={music.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 group/yt"
                      title="Play on YouTube"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                    
                    {/* Spotify 버튼 */}
                    <a
                      href={getSpotifyUrl(music)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 bg-green-600/20 hover:bg-green-600/40 text-green-400 hover:text-green-300 rounded-lg transition-all duration-200 group/spotify"
                      title="Open in Spotify"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View More Link */}
        {!loading && recommendations.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-600/30">
            <button
              onClick={() => {
                // Navigate to mini-functions music page
                window.location.href = '/mini-functions?function=music'
              }}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              Discover more music
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}