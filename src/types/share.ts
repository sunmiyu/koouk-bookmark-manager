// Share Place 관련 타입 정의

import { FolderItem } from './folder'

export type ShareCategory = 
  | 'lifestyle' 
  | 'food' 
  | 'travel' 
  | 'study' 
  | 'parenting' 
  | 'investment'
  | 'work'
  | 'entertainment'
  | 'health'
  | 'tech'

export interface SharedFolder {
  id: string
  title: string
  description: string
  category: ShareCategory
  author: {
    id: string
    name: string
    avatar?: string
    verified?: boolean
  }
  folder: FolderItem
  stats: {
    views: number
    likes: number
    helpful: number
    notHelpful: number
    shares: number
    downloads: number
  }
  tags: string[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
  isPremium?: boolean
  price?: number
  thumbnail?: string
}

export interface ShareRating {
  id: string
  sharedFolderId: string
  userId: string
  type: 'like' | 'helpful' | 'not_helpful'
  createdAt: string
}

export interface ShareComment {
  id: string
  sharedFolderId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  updatedAt: string
}

// 카테고리 메타데이터
export const categoryMetadata: Record<ShareCategory, {
  label: string
  icon: string
  color: string
  description: string
}> = {
  lifestyle: {
    label: '라이프스타일',
    icon: '🌟',
    color: '#EC4899',
    description: '일상생활 팁과 라이프 해킹'
  },
  food: {
    label: '맛집 & 레시피',
    icon: '🍽️',
    color: '#F59E0B',
    description: '맛집 정보와 요리 레시피'
  },
  travel: {
    label: '여행',
    icon: '✈️',
    color: '#3B82F6',
    description: '여행지 정보와 여행 팁'
  },
  study: {
    label: '학습 & 교육',
    icon: '📚',
    color: '#8B5CF6',
    description: '공부법과 교육 자료'
  },
  parenting: {
    label: '육아 & 교육',
    icon: '👶',
    color: '#10B981',
    description: '육아 정보와 교육 자료'
  },
  investment: {
    label: '투자 & 재테크',
    icon: '💰',
    color: '#F59E0B',
    description: '투자 정보와 재테크 팁'
  },
  work: {
    label: '직장 & 커리어',
    icon: '💼',
    color: '#6B7280',
    description: '직장 생활과 커리어 개발'
  },
  entertainment: {
    label: '엔터테인먼트',
    icon: '🎮',
    color: '#EF4444',
    description: '게임, 영화, 음악 등'
  },
  health: {
    label: '건강 & 운동',
    icon: '💪',
    color: '#059669',
    description: '건강 관리와 운동 정보'
  },
  tech: {
    label: '기술 & IT',
    icon: '💻',
    color: '#1E40AF',
    description: '기술 정보와 IT 도구'
  }
}

// 더미 데이터 생성 함수
export const createDummySharedFolders = (): SharedFolder[] => [
  {
    id: 'shared_1',
    title: '서울 힙한 카페 베스트 30',
    description: '인스타 감성 넘치는 서울의 숨은 카페들을 직접 다녀와서 정리했어요! 각 카페별 시그니처 메뉴와 분위기, 주차 정보까지 꼼꼼히 담았습니다.',
    category: 'food',
    author: {
      id: 'user_1',
      name: '카페탐험가',
      avatar: '☕',
      verified: true
    },
    folder: {
      id: 'folder_cafe_seoul',
      name: '서울 힙카페 모음',
      type: 'folder',
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: '#8B5CF6',
      icon: 'Coffee'
    },
    stats: {
      views: 1247,
      likes: 89,
      helpful: 156,
      notHelpful: 8,
      shares: 234,
      downloads: 445
    },
    tags: ['카페', '서울', '힙플레이스', '데이트', '인스타'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    isPublic: true,
    thumbnail: '🏙️'
  },
  {
    id: 'shared_2', 
    title: '신혼부부 첫 아기용품 체크리스트',
    description: '첫 아이를 맞이하는 부모들을 위한 완벽한 준비물 가이드입니다. 정말 필요한 것들만 골라서 예산별로 정리했어요.',
    category: 'parenting',
    author: {
      id: 'user_2',
      name: '육아맘',
      avatar: '👶'
    },
    folder: {
      id: 'folder_baby_items',
      name: '신생아 용품 체크리스트',
      type: 'folder', 
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: '#10B981',
      icon: 'Baby'
    },
    stats: {
      views: 892,
      likes: 67,
      helpful: 123,
      notHelpful: 3,
      shares: 178,
      downloads: 334
    },
    tags: ['육아', '신생아', '용품', '체크리스트', '예산'],
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
    isPublic: true,
    thumbnail: '👶'
  },
  {
    id: 'shared_3',
    title: '개발자 취업 완벽 가이드 2024',
    description: '현직 개발자가 직접 정리한 취업 성공 로드맵! 코딩테스트 준비부터 면접 질문, 이력서 작성법까지 모든 것을 담았습니다.',
    category: 'study',
    author: {
      id: 'user_3',
      name: '시니어개발자',
      avatar: '💻',
      verified: true
    },
    folder: {
      id: 'folder_dev_career',
      name: '개발자 취업 가이드',
      type: 'folder',
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: '#3B82F6',
      icon: 'Code'
    },
    stats: {
      views: 2341,
      likes: 234,
      helpful: 456,
      notHelpful: 12,
      shares: 567,
      downloads: 1023
    },
    tags: ['개발자', '취업', '코딩테스트', '면접', '이력서'],
    createdAt: '2024-01-05T14:20:00Z',
    updatedAt: '2024-01-25T16:30:00Z',
    isPublic: true,
    thumbnail: '💻'
  },
  {
    id: 'shared_4',
    title: '부산 2박3일 완벽 여행코스',
    description: '현지인이 추천하는 부산의 진짜 맛집과 숨은 명소들! 대중교통 이용법과 예산 계획까지 상세하게 정리했어요.',
    category: 'travel',
    author: {
      id: 'user_4',
      name: '부산토박이',
      avatar: '🌊'
    },
    folder: {
      id: 'folder_busan_travel',
      name: '부산 여행 가이드',
      type: 'folder',
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: '#06B6D4',
      icon: 'MapPin'
    },
    stats: {
      views: 1567,
      likes: 134,
      helpful: 267,
      notHelpful: 7,
      shares: 345,
      downloads: 678
    },
    tags: ['부산', '여행', '맛집', '명소', '대중교통'],
    createdAt: '2024-01-12T08:45:00Z',
    updatedAt: '2024-01-22T12:15:00Z',
    isPublic: true,
    thumbnail: '🏖️'
  }
]