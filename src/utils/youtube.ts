/**
 * 유튜브 관련 유틸리티 함수들
 */

/**
 * 유튜브 URL에서 Video ID 추출
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * 유튜브 URL인지 확인
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null
}

/**
 * 유튜브 썸네일 URL 생성 (폴백 포함)
 * mqdefault.jpg를 기본으로 사용 (더 안정적)
 */
export function getYouTubeThumbnail(url: string): string | null {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null

  // mqdefault.jpg는 거의 모든 유튜브 영상에서 지원됨 (320x180)
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

/**
 * 여러 썸네일 크기 옵션 제공
 */
export function getYouTubeThumbnails(url: string) {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null

  return {
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`, // 120x90
    medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, // 320x180
    high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, // 480x360
    standard: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, // 640x480
    maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` // 1280x720 (항상 지원되지 않음)
  }
}

/**
 * 썸네일 로드 테스트 (폴백 로직)
 */
export async function getValidYouTubeThumbnail(url: string): Promise<string | null> {
  const thumbnails = getYouTubeThumbnails(url)
  if (!thumbnails) return null

  // 우선순위: medium > high > standard > default
  const priorities = [thumbnails.medium, thumbnails.high, thumbnails.standard, thumbnails.default]

  for (const thumbnailUrl of priorities) {
    try {
      const response = await fetch(thumbnailUrl, { method: 'HEAD' })
      if (response.ok) {
        return thumbnailUrl
      }
    } catch {
      continue
    }
  }

  // 모든 테스트 실패 시 medium 반환 (가장 안정적)
  return thumbnails.medium
}


/**
 * 클라이언트에서 사용할 수 있는 YouTube 제목 가져오기 함수
 */
export async function fetchYouTubeTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/youtube?url=${encodeURIComponent(url)}`)
    if (!response.ok) return null
    
    const data = await response.json()
    return data.title || null
  } catch {
    return null
  }
}

/**
 * YouTube URL에서 완전한 메타데이터를 가져오는 통합 함수
 */
export async function getYouTubeMetadata(url: string) {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null

  try {
    const response = await fetch(`/api/youtube?url=${encodeURIComponent(url)}`)
    if (!response.ok) {
      // API 실패 시 폴백 데이터 반환
      return {
        videoId,
        title: `YouTube Video ${videoId}`,
        thumbnail: getYouTubeThumbnail(url),
        url
      }
    }

    const data = await response.json()
    
    // 병렬로 썸네일 유효성 검사
    const validThumbnail = await getValidYouTubeThumbnail(url)
    
    return {
      videoId,
      title: data.title || `YouTube Video ${videoId}`,
      description: data.description,
      thumbnail: validThumbnail || data.thumbnail || getYouTubeThumbnail(url),
      channelTitle: data.channelTitle,
      duration: data.duration,
      publishedAt: data.publishedAt,
      url
    }
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error)
    return {
      videoId,
      title: `YouTube Video ${videoId}`,
      thumbnail: getYouTubeThumbnail(url),
      url
    }
  }
}