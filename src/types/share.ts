// 공유 폴더 시스템 타입 정의
import { FolderItem, createFolder } from './folder'

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
    avatar: string
    verified: boolean
  }
  isPublic: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  stats: {
    views: number
    likes: number
    helpful: number
    notHelpful: number
    shares: number
    downloads: number
  }
  folder: FolderItem
  thumbnail?: string
  featured?: boolean
  verified?: boolean
}

export const categoryMetadata = {
  lifestyle: { label: 'Lifestyle', color: '#6366F1', icon: '🌟' },
  food: { label: 'Food & Recipe', color: '#F59E0B', icon: '🍽️' },
  travel: { label: 'Travel', color: '#10B981', icon: '✈️' },
  study: { label: 'Study & Learning', color: '#3B82F6', icon: '📚' },
  parenting: { label: 'Parenting', color: '#F472B6', icon: '👶' },
  investment: { label: 'Investment', color: '#059669', icon: '💰' },
  work: { label: 'Work & Career', color: '#6B7280', icon: '💼' },
  entertainment: { label: 'Entertainment', color: '#8B5CF6', icon: '🎬' },
  health: { label: 'Health & Fitness', color: '#EF4444', icon: '❤️' },
  tech: { label: 'Technology', color: '#0891B2', icon: '💻' }
}

export function createDummySharedFolders(): SharedFolder[] {
  
  return [
    {
      id: '1',
      title: '서울 카페 투어 완벽 가이드',
      description: '3년간 서울 전 지역을 다니며 발견한 숨은 명소 카페들',
      category: 'lifestyle',
      author: {
        id: 'cafe-mania-kim',
        name: '카페마니아김씨',
        avatar: '☕',
        verified: true
      },
      isPublic: true,
      tags: ['카페', '서울', '디저트', '분위기', '데이트'],
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      stats: {
        views: 1250,
        likes: 324,
        helpful: 289,
        notHelpful: 15,
        shares: 67,
        downloads: 156
      },
      folder: createFolder('서울 카페 투어 완벽 가이드'),
      featured: true,
      verified: true
    },
    {
      id: '2',
      title: '초보 투자자를 위한 ETF 포트폴리오',
      description: '5년간의 투자 경험을 바탕으로 한 안전한 ETF 투자 전략',
      category: 'investment',
      author: {
        id: 'realistic-investor',
        name: '현실적투자자',
        avatar: '📈',
        verified: true
      },
      isPublic: true,
      tags: ['ETF', '투자', '포트폴리오', '초보', '장기투자'],
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-25T16:45:00Z',
      stats: {
        views: 2100,
        likes: 512,
        helpful: 467,
        notHelpful: 23,
        shares: 134,
        downloads: 289
      },
      folder: createFolder('초보 투자자를 위한 ETF 포트폴리오'),
      featured: true,
      verified: true
    },
    {
      id: '3',
      title: '아이와 함께하는 주말 나들이 코스',
      description: '2세~7세 아이들과 즐겁게 보낼 수 있는 서울 근교 나들이 장소',
      category: 'parenting',
      author: {
        id: 'two-kids-mom',
        name: '두아이엄마',
        avatar: '👶',
        verified: true
      },
      isPublic: true,
      tags: ['육아', '나들이', '주말', '아이', '가족'],
      createdAt: '2024-01-12T11:00:00Z',
      updatedAt: '2024-01-22T13:20:00Z',
      stats: {
        views: 890,
        likes: 267,
        helpful: 234,
        notHelpful: 8,
        shares: 45,
        downloads: 134
      },
      folder: createFolder('아이와 함께하는 주말 나들이 코스'),
      featured: false,
      verified: true
    }
  ]
}