import { NextRequest, NextResponse } from 'next/server'

interface MusicRecommendation {
  id: string
  title: string
  artist: string
  thumbnail: string
  youtubeUrl: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mood = searchParams.get('mood') || 'relax'
    
    // 안정성을 위해 항상 목업 데이터 반환
    const recommendations = getMockRecommendations(mood as 'morning' | 'focus' | 'relax' | 'workout' | 'evening' | 'sleep')
    
    return NextResponse.json({
      success: true,
      recommendations,
      source: 'mock',
      message: 'Using curated music for stability'
    })

  } catch (error) {
    const mood = new URL(request.url).searchParams.get('mood') || 'relax'
    return NextResponse.json({
      success: false,
      recommendations: getMockRecommendations(mood as 'morning' | 'focus' | 'relax' | 'workout' | 'evening' | 'sleep'),
      error: 'API error, using fallback music'
    })
  }
}

// 목업 데이터 (API 키가 없거나 에러 시 사용)
function getMockRecommendations(mood: 'morning' | 'focus' | 'relax' | 'workout' | 'evening' | 'sleep'): MusicRecommendation[] {
  const mockData = {
    morning: [
      {
        id: 'dQw4w9WgXcQ',
        title: '상쾌한 아침 플레이리스트',
        artist: 'Morning Music',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: 'kJQP7kiw5Fk',
        title: '기분 좋은 아침 음악',
        artist: 'Good Morning Tunes',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
      }
    ],
    focus: [
      {
        id: 'jfKfPfyJRdk',
        title: '집중력 향상 음악',
        artist: 'Study Music',
        thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
      },
      {
        id: 'lTRiuFIWV54',
        title: '카페 분위기 집중 음악',
        artist: 'Cafe Music',
        thumbnail: 'https://img.youtube.com/vi/lTRiuFIWV54/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=lTRiuFIWV54'
      }
    ],
    relax: [
      {
        id: 'WeY-u3nL67k',
        title: '휴식 시간 잔잔한 음악',
        artist: 'Relaxing Music',
        thumbnail: 'https://img.youtube.com/vi/WeY-u3nL67k/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=WeY-u3nL67k'
      },
      {
        id: 'rUxyKA_-grg',
        title: '힐링 음악 모음',
        artist: 'Healing Songs',
        thumbnail: 'https://img.youtube.com/vi/rUxyKA_-grg/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=rUxyKA_-grg'
      }
    ],
    workout: [
      {
        id: 'fJ9rUzIMcZQ',
        title: '운동할 때 듣는 신나는 음악',
        artist: 'Workout Music',
        thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
      },
      {
        id: 'ZbZSe6N_BXs',
        title: '파워풀한 헬스장 음악',
        artist: 'Gym Music',
        thumbnail: 'https://img.youtube.com/vi/ZbZSe6N_BXs/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs'
      }
    ],
    evening: [
      {
        id: 'hT_nvWreIhg',
        title: '저녁 감성 음악',
        artist: 'Evening Mood',
        thumbnail: 'https://img.youtube.com/vi/hT_nvWreIhg/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=hT_nvWreIhg'
      },
      {
        id: 'CevxZvSJLk8',
        title: '일몰과 함께 듣는 음악',
        artist: 'Sunset Music',
        thumbnail: 'https://img.youtube.com/vi/CevxZvSJLk8/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=CevxZvSJLk8'
      }
    ],
    sleep: [
      {
        id: 'YQHsXMglC9A',
        title: '숙면을 위한 음악',
        artist: 'Sleep Music',
        thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=YQHsXMglC9A'
      },
      {
        id: '1ZYbU82GVz4',
        title: '자장가 모음',
        artist: 'Lullaby Collection',
        thumbnail: 'https://img.youtube.com/vi/1ZYbU82GVz4/mqdefault.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=1ZYbU82GVz4'
      }
    ]
  }

  return mockData[mood] || mockData.relax
}