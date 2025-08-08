// 폴더 기반 스토리지 시스템 타입 정의

export interface FolderItem {
  id: string
  name: string
  type: 'folder'
  parentId?: string
  children: (FolderItem | StorageItem)[]
  createdAt: string
  updatedAt: string
  color?: string // 폴더 색상 테마
  icon?: string  // 사용자 지정 아이콘
}

export interface StorageItem {
  id: string
  name: string
  type: 'url' | 'image' | 'video' | 'document' | 'memo'
  content: string
  url?: string
  thumbnail?: string
  tags: string[]
  description?: string
  folderId: string // 속해있는 폴더 ID
  createdAt: string
  updatedAt: string
  wordCount?: number // 문서/메모용
  metadata?: {
    fileSize?: number
    duration?: number // 비디오용
    dimensions?: { width: number; height: number } // 이미지용
    wordCount?: number // 문서/메모용
  }
}

export interface FolderTree {
  root: FolderItem[]
  selectedFolderId?: string
  expandedFolders: Set<string>
}

// 기본 템플릿
export const defaultFolderTemplates = {
  general: [
    { name: 'Work', icon: 'Briefcase', color: '#3B82F6' },
    { name: 'Personal', icon: 'User', color: '#8B5CF6' },
    { name: 'Learning', icon: 'BookOpen', color: '#10B981' },
    { name: 'Archive', icon: 'Archive', color: '#6B7280' }
  ],
  parent: [
    { name: '패션', icon: 'Shirt', color: '#EC4899' },
    { name: '재테크', icon: 'TrendingUp', color: '#F59E0B' },
    { name: '아이교육', icon: 'GraduationCap', color: '#8B5CF6' },
    { name: '레시피', icon: 'ChefHat', color: '#10B981' },
    { name: '여행지', icon: 'MapPin', color: '#3B82F6' },
    { name: '다이어트', icon: 'Heart', color: '#EF4444' }
  ],
  professional: [
    { name: '투자', icon: 'TrendingUp', color: '#F59E0B' },
    { name: '골프', icon: 'Target', color: '#10B981' },
    { name: '건강', icon: 'Activity', color: '#EF4444' },
    { name: '맛집', icon: 'UtensilsCrossed', color: '#F97316' },
    { name: '취미', icon: 'Gamepad2', color: '#8B5CF6' },
    { name: '뉴스', icon: 'Newspaper', color: '#6B7280' }
  ],
  student: [
    { name: '패션', icon: 'Shirt', color: '#EC4899' },
    { name: '취업', icon: 'Briefcase', color: '#3B82F6' },
    { name: '운동', icon: 'Dumbbell', color: '#EF4444' },
    { name: '게임', icon: 'Gamepad2', color: '#8B5CF6' },
    { name: '데이트', icon: 'Heart', color: '#F43F5E' },
    { name: '여행', icon: 'Plane', color: '#06B6D4' }
  ]
}

// 유틸리티 함수들
export const createFolder = (name: string, parentId?: string, template?: { color?: string; icon?: string }): FolderItem => ({
  id: `folder_${Date.now()}_${Math.random().toString(36).substring(2)}`,
  name,
  type: 'folder',
  parentId,
  children: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  color: template?.color || '#6B7280',
  icon: template?.icon || 'Folder'
})

export const createStorageItem = (
  name: string,
  type: StorageItem['type'],
  content: string,
  folderId: string
): StorageItem => ({
  id: `item_${Date.now()}_${Math.random().toString(36).substring(2)}`,
  name,
  type,
  content,
  folderId,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})