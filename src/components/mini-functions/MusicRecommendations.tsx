'use client'

import { useState, useEffect, useCallback } from 'react'
import { MusicRecommendation, MoodType } from '@/types/miniFunctions'
import Image from 'next/image'

interface MusicRecommendationsProps {
  isPreviewOnly?: boolean
}

const MOOD_OPTIONS: { value: MoodType; label: string; emoji: string }[] = [
  { value: 'morning', label: '상쾌한 아침', emoji: '☀️' },
  { value: 'focus', label: '집중 모드', emoji: '🎯' },
  { value: 'relax', label: '휴식 시간', emoji: '😌' },
  { value: 'workout', label: '운동할 때', emoji: '💪' },
  { value: 'evening', label: '저녁 감성', emoji: '🌅' },
  { value: 'sleep', label: '잠들기 전', emoji: '😴' }
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

export default function MusicRecommendations({ isPreviewOnly = false }: MusicRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<MusicRecommendation[]>([])
  const [selectedMood, setSelectedMood] = useState<MoodType>('relax')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiSource, setApiSource] = useState<'youtube' | 'fallback'>('fallback')

  // 음악 추천 API 호출
  const fetchRecommendations = useCallback(async (mood: MoodType) => {
    if (isPreviewOnly) {
      // 프리뷰 모드에서는 목업 데이터 사용
      setRecommendations([
        {
          id: 'preview1',
          title: '휴식 시간 잔잔한 음악',
          artist: 'Relaxing Music',
          thumbnail: 'https://img.youtube.com/vi/WeY-u3nL67k/mqdefault.jpg',
          youtubeUrl: 'https://www.youtube.com/watch?v=WeY-u3nL67k'
        },
        {
          id: 'preview2', 
          title: '힐링 음악 모음',
          artist: 'Healing Songs',
          thumbnail: 'https://img.youtube.com/vi/rUxyKA_-grg/mqdefault.jpg',
          youtubeUrl: 'https://www.youtube.com/watch?v=rUxyKA_-grg'
        }
      ])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/music-recommendations?mood=${mood}`)
      const data = await response.json()

      if (data.success) {
        setRecommendations(data.recommendations)
        setApiSource(data.source || 'fallback')
        console.log('Music API source:', data.source)
      } else {
        throw new Error('음악 추천을 가져오는데 실패했습니다')
      }
    } catch (err) {
      console.error('Music recommendations error:', err)
      setError('음악 추천을 불러올 수 없습니다')
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }, [isPreviewOnly])

  // 컴포넌트 마운트 시 및 mood 변경 시 추천 음악 로드
  useEffect(() => {
    fetchRecommendations(selectedMood)
  }, [selectedMood, isPreviewOnly, fetchRecommendations])

  // Mood 변경 핸들러
  const handleMoodChange = (mood: MoodType) => {
    setSelectedMood(mood)
  }

  // 새로고침 핸들러
  const handleRefresh = () => {
    fetchRecommendations(selectedMood)
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
        <div className="text-sm text-gray-400">음악을 찾고 있어요...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-400 text-sm mb-2">{error}</div>
        <button
          onClick={handleRefresh}
          className="text-purple-400 hover:text-purple-300 text-sm underline cursor-pointer"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* API 상태 및 Mood 선택 */}
      {!isPreviewOnly && (
        <div className="space-y-2">
          {/* API 상태 표시 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🎵 음악 추천</span>
              {apiSource === 'youtube' ? (
                <span className="text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  YouTube API 연결됨
                </span>
              ) : (
                <span className="text-yellow-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  샘플 데이터 사용 중
                </span>
              )}
            </div>
          </div>

          {/* YouTube API 키 안내 */}
          {apiSource === 'fallback' && (
            <div className="text-xs text-gray-500 bg-gray-800/50 p-2 rounded">
              💡 <strong>실시간 음악 추천</strong>을 위해 YouTube API 키를 설정하세요
              <br />• 환경 변수: <code className="text-blue-400">YOUTUBE_API_KEY</code>
              <br />• 설정 후 더 다양한 음악 추천이 가능합니다
            </div>
          )}

          {/* Mood 선택 */}
          <div className="flex flex-wrap gap-1">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodChange(mood.value)}
                className={`px-2 py-1 rounded-full text-xs transition-colors ${
                  selectedMood === mood.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mood.emoji} {mood.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 음악 추천 목록 */}
      <div className="space-y-2">
        {recommendations.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            🎵 추천 음악을 불러오는 중...
          </div>
        ) : (
          recommendations.map((music) => (
            <div key={music.id} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors">
              <div className="flex items-center gap-3">
                {/* 썸네일 */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-9 rounded overflow-hidden relative">
                    <MusicThumbnail
                      src={music.thumbnail}
                      alt={music.title}
                      title={music.title}
                    />
                  </div>
                </div>
                
                {/* 음악 정보 */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium truncate">
                    {music.title}
                  </h4>
                  <p className="text-gray-400 text-xs truncate">
                    {music.artist}
                  </p>
                </div>
                
                {/* 재생 버튼 */}
                <a
                  href={music.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white bg-gray-700/50 rounded hover:bg-gray-600/50 transition-colors cursor-pointer text-sm"
                  title="YouTube에서 재생"
                >
                  ▶
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 새로고침 버튼 */}
      {!isPreviewOnly && recommendations.length > 0 && (
        <button
          onClick={handleRefresh}
          className="w-full py-2 text-purple-400 hover:text-purple-300 text-sm transition-colors cursor-pointer"
        >
          🔄 다른 음악 추천받기
        </button>
      )}
    </div>
  )
}