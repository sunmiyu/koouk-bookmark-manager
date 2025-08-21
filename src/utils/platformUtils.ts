/**
 * 플랫폼 감지 및 스타일링을 위한 유틸리티 함수들
 */

export interface PlatformInfo {
  type: string
  name: string
  color: string
  icon: string
  logo: string
}

/**
 * URL로부터 플랫폼 정보 추출
 */
export function getPlatformInfo(url?: string, metadata?: any): PlatformInfo | null {
  if (!url) return null
  
  try {
    const domain = new URL(url).hostname.toLowerCase()
    
    // YouTube - Red background with play icon
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return {
        type: 'youtube',
        name: 'YouTube',
        color: 'bg-red-500',
        icon: '▶️',
        logo: '🎬'
      }
    }
    
    // Reddit - Orange background with Reddit logo
    if (domain.includes('reddit.com')) {
      return {
        type: 'reddit',
        name: 'Reddit',
        color: 'bg-orange-500',
        icon: '🅡',
        logo: '📱'
      }
    }
    
    // Naver - Green background
    if (domain.includes('naver.com')) {
      return {
        type: 'naver',
        name: 'Naver',
        color: 'bg-green-500',
        icon: 'N',
        logo: '📰'
      }
    }
    
    // News sites - Blue background
    if (domain.includes('news') || domain.includes('뉴스') || 
        ['yna.co.kr', 'chosun.com', 'joins.com', 'hankyung.com'].some(news => domain.includes(news))) {
      return {
        type: 'news',
        name: 'News',
        color: 'bg-blue-600',
        icon: '📰',
        logo: '📺'
      }
    }
    
    // Blog - Purple background
    if (domain.includes('blog') || domain.includes('tistory')) {
      return {
        type: 'blog',
        name: 'Blog',
        color: 'bg-purple-500',
        icon: '✍️',
        logo: '📝'
      }
    }
    
    // Community/Forums - Indigo background
    if (domain.includes('cafe') || domain.includes('forum') || domain.includes('community')) {
      return {
        type: 'community',
        name: 'Community',
        color: 'bg-indigo-500',
        icon: '👥',
        logo: '💬'
      }
    }
    
    // GitHub - Gray background
    if (domain.includes('github.com')) {
      return {
        type: 'github',
        name: 'GitHub',
        color: 'bg-gray-900',
        icon: '⚡',
        logo: '👨‍💻'
      }
    }
    
    // Stack Overflow - Orange background
    if (domain.includes('stackoverflow.com')) {
      return {
        type: 'stackoverflow',
        name: 'Stack Overflow',
        color: 'bg-orange-600',
        icon: '❓',
        logo: '💻'
      }
    }
    
    // Medium - Black background
    if (domain.includes('medium.com')) {
      return {
        type: 'medium',
        name: 'Medium',
        color: 'bg-black',
        icon: 'M',
        logo: '📖'
      }
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * 콘텐츠 타입별 아이콘 반환
 */
export function getTypeIcon(type: string): string {
  switch (type) {
    case 'url': return '🔗'
    case 'image': return '🖼️'
    case 'video': return '📺'
    case 'document': return '📄'
    case 'memo': return '📝'
    case 'folder': return '📁'
    default: return '📄'
  }
}

/**
 * 콘텐츠 타입 감지 (URL 기반)
 */
export function detectContentType(url?: string): 'url' | 'image' | 'video' | 'document' {
  if (!url) return 'url'
  
  try {
    const domain = new URL(url).hostname.toLowerCase()
    const pathname = new URL(url).pathname.toLowerCase()
    
    // Video platforms
    if (domain.includes('youtube.com') || domain.includes('youtu.be') || 
        domain.includes('vimeo.com') || domain.includes('dailymotion.com')) {
      return 'video'
    }
    
    // Image file extensions
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(pathname)) {
      return 'image'
    }
    
    // Document file extensions
    if (/\.(pdf|doc|docx|txt|md|rtf)$/i.test(pathname)) {
      return 'document'
    }
    
    return 'url'
  } catch {
    return 'url'
  }
}