/**
 * 썸네일 처리를 위한 유틸리티 함수들
 */

import { ContentMetadata } from './titleUtils'

/**
 * 효과적인 썸네일 찾기
 */
export function getEffectiveThumbnail(
  primaryThumbnail?: string,
  metadata?: ContentMetadata
): string | null {
  // 직접 제공된 썸네일 우선
  if (primaryThumbnail) {
    return primaryThumbnail
  }
  
  // 메타데이터의 썸네일
  if (metadata?.thumbnail) {
    return metadata.thumbnail
  }
  
  return null
}

/**
 * 폴더의 대표 이미지 찾기
 */
export function getFolderRepresentativeImage(metadata?: any): string | null {
  // 폴더 메타데이터에서 자식 요소들 확인
  const folderChildren = metadata?.children || metadata?.items || []
  
  // 첫 번째 썸네일이 있는 아이템 찾기
  for (const child of folderChildren) {
    if (child.thumbnail) return child.thumbnail
    if (child.type === 'image' && child.content) return child.content
    if (child.type === 'video' && child.metadata?.thumbnail) return child.metadata.thumbnail
    if (child.type === 'url' && child.metadata?.thumbnail) return child.metadata.thumbnail
  }
  
  return null
}

/**
 * 도메인 기반 색상 생성
 */
export function generateDomainColor(domain: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
    'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-teal-500'
  ]
  const hash = domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

/**
 * 도메인 정보 추출
 */
export function getDomainInfo(url?: string) {
  if (!url) return null
  
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    return {
      domain,
      domainInitial: domain.charAt(0).toUpperCase(),
      domainColor: generateDomainColor(domain)
    }
  } catch {
    return null
  }
}