import { NextRequest, NextResponse } from 'next/server'

// Mood별 검색 키워드 매핑
const MOOD_KEYWORDS = {
  morning: ['아침 음악', 'morning playlist', '상쾌한 음악', 'wake up songs'],
  focus: ['집중 음악', 'study music', '카페 음악', 'concentration music'], 
  relax: ['휴식 음악', 'chill music', '잔잔한 음악', 'relaxing playlist'],
  workout: ['운동 음악', 'workout music', '신나는 음악', 'energetic music'],
  evening: ['저녁 음악', 'evening playlist', '감성 음악', 'mood music'],
  sleep: ['잠잘 때 듣는 음악', 'sleep music', '자장가', 'bedtime music']
}

interface YouTubeVideo {
  id: { videoId: string }
  snippet: {
    title: string
    channelTitle: string
    thumbnails: {
      default: { url: string }
      medium: { url: string }
      high: { url: string }
    }
  }
}

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
    
    if (!process.env.YOUTUBE_API_KEY) {
      console.log('YouTube API key not found, returning mock data')
      return NextResponse.json({
        success: true,
        recommendations: getMockRecommendations(mood as keyof typeof MOOD_KEYWORDS)
      })
    }

    // 해당 mood의 키워드 중 랜덤 선택
    const keywords = MOOD_KEYWORDS[mood as keyof typeof MOOD_KEYWORDS] || MOOD_KEYWORDS.relax
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]

    // YouTube API 호출
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(randomKeyword)}&` +
      `type=video&` +
      `videoCategoryId=10&` + // Music category
      `maxResults=20&` +
      `order=relevance&` +
      `key=${process.env.YOUTUBE_API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: getMockRecommendations(mood as keyof typeof MOOD_KEYWORDS)
      })
    }

    // 랜덤으로 2개 선택
    const shuffled = data.items.sort(() => 0.5 - Math.random())
    const selectedVideos = shuffled.slice(0, 2)

    const recommendations: MusicRecommendation[] = selectedVideos.map((video: YouTubeVideo) => ({
      id: video.id.videoId,
      title: video.snippet.title,
      artist: video.snippet.channelTitle,
      thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`
    }))

    return NextResponse.json({
      success: true,
      recommendations
    })

  } catch (error) {
    console.error('Music recommendations API error:', error)
    
    // 에러 시 목업 데이터 반환
    const mood = new URL(request.url).searchParams.get('mood') || 'relax'
    return NextResponse.json({
      success: true,
      recommendations: getMockRecommendations(mood as keyof typeof MOOD_KEYWORDS)
    })
  }
}

// 목업 데이터 (API 키가 없거나 에러 시 사용)
function getMockRecommendations(mood: keyof typeof MOOD_KEYWORDS): MusicRecommendation[] {
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