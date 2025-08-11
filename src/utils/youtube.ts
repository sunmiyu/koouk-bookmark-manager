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
    } catch (error) {
      continue
    }
  }

  // 모든 테스트 실패 시 medium 반환 (가장 안정적)
  return thumbnails.medium
}