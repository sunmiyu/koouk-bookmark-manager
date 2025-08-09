// Core Types for Koouk - Cover Flow Drag & Drop System

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'free' | 'pro' | 'premium'
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  name: string
  description?: string
  parentId?: string
  userId: string
  position: number
  createdAt: string
  updatedAt: string
}

// Updated Content Types for Cover Flow System
export type ContentType = 'image' | 'video' | 'text' | 'website' | 'memo'

export interface Content {
  id: string
  title: string
  body: string
  type: ContentType
  folderId: string
  userId: string
  position: number
  metadata?: {
    // For images
    imageData?: string // base64 data
    imageType?: string // image/png, image/jpg, etc.
    
    // For videos
    videoData?: string // base64 data or blob URL
    videoType?: string // video/mp4, video/webm, etc.
    
    // For text files
    textContent?: string // full text content
    textType?: string // text/plain, text/markdown, etc.
    
    // For websites
    url?: string // website URL
    preview?: string // iframe preview or screenshot
    
    // For memos
    memoContent?: string // memo text content
    createdDate?: string // memo creation date for display
    
    // Common metadata
    fileSize?: number
    fileName?: string
    mimeType?: string
  }
  createdAt: string
  updatedAt: string
}

export interface SharedContent {
  id: string
  originalContentId: string
  title: string
  description: string
  category: string
  tags: string[]
  authorId: string
  authorName: string
  isPublic: boolean
  stats: {
    views: number
    likes: number
    downloads: number
  }
  createdAt: string
  updatedAt: string
}

export interface SearchResult {
  id: string
  title: string
  snippet: string
  type: 'content' | 'folder' | 'shared'
  folderId?: string
  relevance: number
}

export interface AppState {
  user: User | null
  folders: Folder[]
  contents: Content[]
  selectedFolderId: string | null
  searchQuery: string
  isLoading: boolean
  viewMode: 'coverflow' | 'grid' | 'list'
}

// Drag & Drop Types
export interface DropItem {
  kind: string // 'file' | 'string'
  type: string // MIME type
  data: File | string
}

export interface FileUploadResult {
  success: boolean
  content?: Content
  error?: string
}