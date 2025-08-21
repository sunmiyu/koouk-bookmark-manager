/**
 * 콘텐츠 관련 타입 정의
 */

export type ContentType = 'url' | 'image' | 'video' | 'document' | 'memo' | 'folder'

export interface ContentMetadata {
  domain?: string
  fileSize?: string | number
  duration?: string
  tags?: string[]
  children?: ContentItem[]
  items?: ContentItem[]
  thumbnail?: string
  title?: string
  description?: string
  platform?: string
  channelTitle?: string
  fileName?: string
  fileType?: string
  isShared?: boolean
  author?: string
  publishedAt?: string
  viewCount?: number
  likeCount?: number
  downloadCount?: number
}

export interface ContentItem {
  id?: string
  type: ContentType
  title: string
  description?: string
  content?: string
  thumbnail?: string
  url?: string
  metadata?: ContentMetadata
  createdAt?: string
  updatedAt?: string
  userId?: string
  folderId?: string
}

export interface ContentCardProps {
  type: ContentType
  title: string
  description?: string
  thumbnail?: string
  url?: string
  metadata?: ContentMetadata
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  size?: 'small' | 'medium' | 'large'
  layout?: 'grid' | 'list'
  showActions?: boolean
}

export interface FolderItem extends ContentItem {
  type: 'folder'
  children?: ContentItem[]
  itemCount?: number
  isShared?: boolean
  shareId?: string
}