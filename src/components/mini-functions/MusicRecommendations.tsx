'use client'

import { useState, useEffect, useMemo } from 'react'
import { MusicRecommendation } from '@/types/miniFunctions'

interface MusicRecommendationsProps {
  isPreviewOnly?: boolean
}

export default function MusicRecommendations({ isPreviewOnly = false }: MusicRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<MusicRecommendation[]>([])
  const [currentTimeSlot, setCurrentTimeSlot] = useState<string>('')

  // Static playlist data - memoized to prevent re-renders
  const musicPlaylists = useMemo(() => ({
    morning: [
      { title: "아침집중", emoji: "🌅", url: "https://youtu.be/jfKfPfyJRdk", timeSlot: 'morning' as const },
      { title: "로파이힙합", emoji: "☕", url: "https://youtu.be/5qap5aO4i9A", timeSlot: 'morning' as const },
      { title: "잔잔한재즈", emoji: "🎹", url: "https://youtu.be/kgx4WGK0oNU", timeSlot: 'morning' as const }
    ],
    afternoon: [
      { title: "카페감성", emoji: "☕", url: "https://youtu.be/2KaLnYs7r8s", timeSlot: 'afternoon' as const },
      { title: "작업BGM", emoji: "💻", url: "https://youtu.be/BeUkULvYmZ8", timeSlot: 'afternoon' as const },
      { title: "팝송모음", emoji: "🎤", url: "https://youtu.be/x4bGx1XvAWU", timeSlot: 'afternoon' as const }
    ],
    evening: [
      { title: "운동용", emoji: "💪", url: "https://youtu.be/GpC3SdQrmfk", timeSlot: 'evening' as const },
      { title: "힙합비트", emoji: "🔥", url: "https://youtu.be/frObM0U0pXY", timeSlot: 'evening' as const },
      { title: "록음악", emoji: "🎸", url: "https://youtu.be/LmGGfqWPMi0", timeSlot: 'evening' as const }
    ],
    night: [
      { title: "잠들기전", emoji: "🌙", url: "https://youtu.be/PYGODWJgR-c", timeSlot: 'night' as const },
      { title: "피아노선율", emoji: "🎹", url: "https://youtu.be/YE2iyBRmA_g", timeSlot: 'night' as const },
      { title: "자연소리", emoji: "🌊", url: "https://youtu.be/mPZkdNFkNps", timeSlot: 'night' as const }
    ]
  }), [])

  const getTimeSlot = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'  
    if (hour >= 18 && hour < 22) return 'evening'
    return 'night'
  }

  const getTimeSlotLabel = (slot: string) => {
    switch(slot) {
      case 'morning': return '아침'
      case 'afternoon': return '오후'
      case 'evening': return '저녁'
      case 'night': return '밤'
      default: return '지금'
    }
  }

  useEffect(() => {
    const timeSlot = getTimeSlot()
    setCurrentTimeSlot(timeSlot)
    
    // Get recommendations for current time
    const currentPlaylists = musicPlaylists[timeSlot as keyof typeof musicPlaylists] || musicPlaylists.morning
    setRecommendations(currentPlaylists)
  }, [musicPlaylists])

  const handlePlayMusic = (url: string, title: string) => {
    if (!isPreviewOnly) {
      window.open(url, '_blank')
      // Track music play event
      console.log(`Playing: ${title}`)
    }
  }

  const displayRecommendations = isPreviewOnly ? recommendations.slice(0, 2) : recommendations.slice(0, 3)

  return (
    <div className="space-y-1">
      <div className="text-gray-400 text-xs">
        {getTimeSlotLabel(currentTimeSlot)} 추천
      </div>
      
      <div className="space-y-1">
        {displayRecommendations.map((rec, index) => (
          <div
            key={index}
            onClick={() => handlePlayMusic(rec.url, rec.title)}
            className={`flex items-center gap-2 text-xs ${
              isPreviewOnly 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-400 hover:text-blue-300 cursor-pointer'
            }`}
            title={isPreviewOnly ? 'Preview mode' : `Play ${rec.title}`}
          >
            <span>{rec.emoji}</span>
            <span className="underline truncate">{rec.title}</span>
          </div>
        ))}
      </div>

      {isPreviewOnly && (
        <div className="text-center pt-2">
          <span className="text-gray-500 text-xs">🎵 Unlock music in Pro plan</span>
        </div>
      )}

      {!isPreviewOnly && (
        <div className="text-xs text-gray-500 mt-2">
          💡 Click to play on YouTube
        </div>
      )}
    </div>
  )
}