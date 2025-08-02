'use client'

import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { imagesService } from '@/lib/supabase-services'
import { 
  validateImageFile, 
  compressImage, 
  generateThumbnail, 
  getImageDimensions,
  formatFileSize,
  ImageCompressionOptions 
} from '@/lib/image-utils'

interface ImageUploadProps {
  onUploadComplete?: (imageData: unknown) => void
  onUploadError?: (error: string) => void
  multiple?: boolean
  maxFiles?: number
  compressionOptions?: ImageCompressionOptions
  className?: string
}

interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'error'
  error?: string
  thumbnail?: string
  dimensions?: { width: number; height: number }
  compressedSize?: number
}

export default function ImageUpload({
  onUploadComplete,
  onUploadError,
  multiple = false,
  maxFiles = 5,
  compressionOptions,
  className = ''
}: ImageUploadProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const updateUploadProgress = useCallback((index: number, updates: Partial<UploadProgress>) => {
    setUploads(prev => prev.map((upload, i) => 
      i === index ? { ...upload, ...updates } : upload
    ))
  }, [])

  const processFile = async (file: File, index: number) => {
    try {
      // Validate file
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        updateUploadProgress(index, { status: 'error', error: validation.error })
        return
      }

      // Generate thumbnail
      updateUploadProgress(index, { status: 'compressing' })
      const thumbnail = await generateThumbnail(file)
      const dimensions = await getImageDimensions(file)
      
      updateUploadProgress(index, { 
        thumbnail, 
        dimensions,
        progress: 25 
      })

      // Compress image
      const compressedFile = await compressImage(file, compressionOptions)
      
      updateUploadProgress(index, { 
        compressedSize: compressedFile.size,
        progress: 50 
      })

      // Upload to Supabase
      if (!user) {
        throw new Error('User not authenticated')
      }

      updateUploadProgress(index, { status: 'uploading', progress: 75 })

      const imageData = await imagesService.createWithUpload(compressedFile, user.id, {
        title: file.name.split('.')[0],
        description: `Image uploaded - Original: ${formatFileSize(file.size)}, Compressed: ${formatFileSize(compressedFile.size)}`,
        tags: []
      })

      updateUploadProgress(index, { 
        status: 'completed', 
        progress: 100 
      })

      onUploadComplete?.(imageData)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      updateUploadProgress(index, { status: 'error', error: errorMessage })
      onUploadError?.(errorMessage)
    }
  }

  const handleFileSelect = async (files: FileList) => {
    if (!user) {
      onUploadError?.(t('must_be_logged_in'))
      return
    }

    const fileArray = Array.from(files).slice(0, maxFiles)
    
    // Initialize upload progress
    const newUploads: UploadProgress[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))
    
    setUploads(newUploads)
    setIsUploading(true)

    // Process files
    try {
      await Promise.all(
        fileArray.map((file, index) => processFile(file, index))
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const clearUploads = () => {
    setUploads([])
  }

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'compressing':
        return '🔄'
      case 'uploading':
        return '⬆️'
      case 'completed':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '📎'
    }
  }

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-400'
      case 'compressing':
      case 'uploading':
        return 'text-blue-400'
      case 'completed':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-900/20' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl">📸</div>
          <div className="text-white font-medium">
            {isDragOver ? 'Drop images here' : 'Upload Images'}
          </div>
          <div className="text-gray-400 text-sm">
            Drag & drop images or click to browse
          </div>
          <div className="text-gray-500 text-xs">
            Supports JPEG, PNG, WebP, GIF • Max {maxFiles} files • Max 10MB each
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Upload Progress</h3>
            <button
              onClick={clearUploads}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-3">
            {uploads.map((upload, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {upload.thumbnail ? (
                      <img 
                        src={upload.thumbnail} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">📷</span>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {upload.file.name}
                      </span>
                      <span className={`text-sm ${getStatusColor(upload.status)}`}>
                        {getStatusIcon(upload.status)}
                      </span>
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      {formatFileSize(upload.file.size)}
                      {upload.dimensions && (
                        <span> • {upload.dimensions.width}×{upload.dimensions.height}</span>
                      )}
                      {upload.compressedSize && upload.compressedSize !== upload.file.size && (
                        <span className="text-green-400">
                          {' → '}{formatFileSize(upload.compressedSize)}
                        </span>
                      )}
                    </div>
                    
                    {upload.error && (
                      <div className="text-red-400 text-sm mt-1">
                        {upload.error}
                      </div>
                    )}
                    
                    {/* Progress Bar */}
                    {upload.status !== 'error' && upload.status !== 'completed' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}