// Core system types

export type ContentType = 'website' | 'memo' | 'text' | 'image' | 'video'

export interface Content {
  id: string
  title: string
  type: ContentType
  content: string
  body?: string
  url?: string
  thumbnail?: string
  metadata?: {
    [key: string]: unknown
  }
  createdAt: string
  updatedAt: string
}

export interface DropItem {
  id: string
  type: 'file' | 'url' | 'text'
  content: string | File
  preview?: string
  metadata?: {
    name?: string
    size?: number
    type?: string
  }
}

export interface FileUploadResult {
  success: boolean
  content?: Content
  error?: string
}