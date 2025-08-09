// File Processing for Cover Flow Drag & Drop System
import { Content, ContentType, DropItem, FileUploadResult } from '@/types/core'

export class FileProcessor {
  // Detect content type from file or URL
  static detectContentType(item: File | string): ContentType {
    if (typeof item === 'string') {
      // URL detection
      try {
        new URL(item)
        return 'website'
      } catch {
        return 'text'
      }
    }

    // File type detection
    const mimeType = item.type
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('text/')) return 'text'
    
    return 'text' // Default fallback
  }

  // Process image files
  static async processImage(file: File): Promise<Partial<Content>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        resolve({
          title: file.name.split('.')[0] || 'Image',
          body: `Image file: ${file.name}`,
          type: 'image',
          metadata: {
            imageData: reader.result as string,
            imageType: file.type,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type
          }
        })
      }
      
      reader.onerror = () => reject(new Error('Failed to read image file'))
      reader.readAsDataURL(file)
    })
  }

  // Process video files
  static async processVideo(file: File): Promise<Partial<Content>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        resolve({
          title: file.name.split('.')[0] || 'Video',
          body: `Video file: ${file.name}`,
          type: 'video',
          metadata: {
            videoData: reader.result as string,
            videoType: file.type,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type
          }
        })
      }
      
      reader.onerror = () => reject(new Error('Failed to read video file'))
      reader.readAsDataURL(file)
    })
  }

  // Process text files
  static async processText(file: File): Promise<Partial<Content>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const textContent = reader.result as string
        resolve({
          title: file.name.split('.')[0] || 'Text Document',
          body: textContent.substring(0, 100) + (textContent.length > 100 ? '...' : ''),
          type: 'text',
          metadata: {
            textContent,
            textType: file.type || 'text/plain',
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type
          }
        })
      }
      
      reader.onerror = () => reject(new Error('Failed to read text file'))
      reader.readAsText(file)
    })
  }

  // Process website URLs
  static async processWebsite(url: string): Promise<Partial<Content>> {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace('www.', '')
      
      return {
        title: domain || 'Website',
        body: url,
        type: 'website',
        metadata: {
          url,
          mimeType: 'text/uri-list'
        }
      }
    } catch (error) {
      throw new Error('Invalid URL format')
    }
  }

  // Main processing function
  static async processDropItem(
    item: File | string,
    folderId: string,
    userId: string
  ): Promise<FileUploadResult> {
    try {
      const contentType = this.detectContentType(item)
      let partialContent: Partial<Content>

      switch (contentType) {
        case 'image':
          partialContent = await this.processImage(item as File)
          break
        case 'video':
          partialContent = await this.processVideo(item as File)
          break
        case 'text':
          partialContent = await this.processText(item as File)
          break
        case 'website':
          partialContent = await this.processWebsite(item as string)
          break
        default:
          throw new Error('Unsupported content type')
      }

      const content: Content = {
        id: `content_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        folderId,
        userId,
        position: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...partialContent
      } as Content

      return {
        success: true,
        content
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      }
    }
  }

  // Validate file size and type
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Max file size: 10MB for images/videos, 1MB for text
    const maxSize = file.type.startsWith('image/') || file.type.startsWith('video/')
      ? 10 * 1024 * 1024 // 10MB
      : 1 * 1024 * 1024   // 1MB

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB`
      }
    }

    // Check supported file types
    const supportedTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
      // Text
      'text/plain', 'text/markdown', 'text/html', 'text/css', 'text/javascript',
      'application/json', 'application/xml'
    ]

    if (!supportedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Unsupported file type'
      }
    }

    return { valid: true }
  }

  // Extract title from various sources
  static extractTitle(item: File | string): string {
    if (typeof item === 'string') {
      try {
        const url = new URL(item)
        return url.hostname.replace('www.', '') || 'Website'
      } catch {
        return 'Text Content'
      }
    }

    return item.name.split('.')[0] || 'Untitled'
  }
}