/**
 * 제목 처리를 위한 유틸리티 함수들
 */

export interface ContentMetadata {
  title?: string
  description?: string
  platform?: string
  channelTitle?: string
  domain?: string
  fileName?: string
  fileType?: string
  thumbnail?: string
}

/**
 * 콘텐츠의 효과적인 제목을 반환
 */
export function getEffectiveTitle(
  primaryTitle: string,
  type: 'url' | 'image' | 'video' | 'document' | 'memo' | 'folder',
  metadata?: ContentMetadata
): string {
  // YouTube 영상의 경우 실제 제목 우선
  if (type === 'video' && metadata?.title) {
    return metadata.title
  }
  
  // URL의 경우 메타데이터 제목 우선
  if (type === 'url' && metadata?.title) {
    return metadata.title
  }
  
  // 제목이 암호화된 ID 같은 경우 (YouTube ID 패턴)
  if (primaryTitle && /^[A-Za-z0-9_-]{8,15}$/.test(primaryTitle)) {
    if (metadata?.title) {
      return metadata.title
    }
    return 'Untitled'
  }
  
  // 제목이 없거나 의미없는 경우
  if (!primaryTitle || primaryTitle.trim() === '' || primaryTitle === 'undefined' || primaryTitle === 'null') {
    // 파일명이 있으면 사용
    if (metadata?.fileName) {
      return metadata.fileName
    }
    
    // 플랫폼/도메인 정보로 대체
    if (metadata?.platform) {
      return `${metadata.platform} Content`
    }
    
    if (metadata?.domain) {
      return `${metadata.domain} Link`
    }
    
    return 'Untitled'
  }
  
  // Document에서 제목이 애매한 경우
  if (type === 'document' && (primaryTitle.length < 3 || /^[0-9-]+$/.test(primaryTitle))) {
    if (metadata?.fileName) {
      return metadata.fileName
    }
    return 'Untitled Document'
  }
  
  // Image에서 제목이 없는 경우
  if (type === 'image' && (primaryTitle.includes('blob:') || primaryTitle.includes('data:') || primaryTitle.startsWith('Pasted Image'))) {
    if (metadata?.fileName) {
      return metadata.fileName
    }
    return 'Untitled Image'
  }
  
  // 폴더의 경우 간단히 처리
  if (type === 'folder' && (!primaryTitle || primaryTitle.length < 2)) {
    return 'New Folder'
  }
  
  return primaryTitle
}

/**
 * 제목을 적절한 길이로 자르기
 */
export function truncateTitle(title: string, maxLength: number = 50): string {
  if (title.length <= maxLength) {
    return title
  }
  
  return title.substring(0, maxLength - 3) + '...'
}

/**
 * 설명 텍스트 생성
 */
export function generateDescription(
  type: 'url' | 'image' | 'video' | 'document' | 'memo' | 'folder',
  metadata?: ContentMetadata
): string {
  switch (type) {
    case 'video':
      if (metadata?.channelTitle) {
        return `${metadata.channelTitle} • ${metadata.platform || 'Video'}`
      }
      return metadata?.platform || 'Video'
      
    case 'url':
      return metadata?.domain || 'Web Link'
      
    case 'document':
      return metadata?.fileType ? `${metadata.fileType.toUpperCase()} Document` : 'Document'
      
    case 'image':
      return metadata?.fileType ? `${metadata.fileType.toUpperCase()} Image` : 'Image'
      
    case 'folder':
      return 'Folder'
      
    case 'memo':
      return 'Personal Note'
      
    default:
      return 'Content'
  }
}