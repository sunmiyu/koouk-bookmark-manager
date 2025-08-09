'use client'

import React, { useState, useCallback } from 'react'
import { Upload, FileText, Image, Video, Globe } from 'lucide-react'
import { FileProcessor } from '@/lib/fileProcessor'
import { Content } from '@/types/core'

interface DragDropZoneProps {
  selectedFolderId: string | null
  userId: string
  onFilesUploaded: (contents: Content[]) => void
  children?: React.ReactNode
}

export default function DragDropZone({ 
  selectedFolderId, 
  userId, 
  onFilesUploaded, 
  children 
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const processFiles = useCallback(async (items: (File | string)[]) => {
    if (!selectedFolderId || !userId) {
      alert('Please select a folder first')
      return
    }

    setIsProcessing(true)
    setUploadProgress(0)
    
    const processedContents: Content[] = []
    const total = items.length

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      try {
        // Validate file if it's a File object
        if (item instanceof File) {
          const validation = FileProcessor.validateFile(item)
          if (!validation.valid) {
            console.error(`File validation failed: ${validation.error}`)
            continue
          }
        }

        const result = await FileProcessor.processDropItem(item, selectedFolderId, userId)
        
        if (result.success && result.content) {
          processedContents.push(result.content)
        } else {
          console.error('Processing failed:', result.error)
        }
      } catch (error) {
        console.error('Error processing item:', error)
      }
      
      setUploadProgress(((i + 1) / total) * 100)
    }

    if (processedContents.length > 0) {
      onFilesUploaded(processedContents)
    }

    setIsProcessing(false)
    setUploadProgress(0)
  }, [selectedFolderId, userId, onFilesUploaded])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const items: (File | string)[] = []
    
    // Handle DataTransfer items
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i]
        
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) items.push(file)
        } else if (item.kind === 'string' && item.type === 'text/uri-list') {
          // Handle URLs
          item.getAsString((url) => {
            if (url.startsWith('http')) {
              items.push(url)
              if (items.length === e.dataTransfer.items.length) {
                processFiles(items)
              }
            }
          })
          continue
        } else if (item.kind === 'string' && item.type === 'text/plain') {
          // Handle plain text
          item.getAsString((text) => {
            items.push(text)
            if (items.length === e.dataTransfer.items.length) {
              processFiles(items)
            }
          })
          continue
        }
      }
    } else if (e.dataTransfer.files) {
      // Fallback for older browsers
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        items.push(e.dataTransfer.files[i])
      }
    }

    if (items.length > 0 && items.every(item => item instanceof File)) {
      await processFiles(items)
    }
  }, [processFiles])

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await processFiles(files)
    }
    // Reset input
    e.target.value = ''
  }, [processFiles])

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-6 h-6" />
    if (type.startsWith('video/')) return <Video className="w-6 h-6" />
    if (type.startsWith('text/')) return <FileText className="w-6 h-6" />
    return <Globe className="w-6 h-6" />
  }

  return (
    <div
      className={`drag-drop-zone ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ position: 'relative', minHeight: '100%' }}
    >
      {children}
      
      {/* Drag Overlay */}
      {isDragOver && (
        <div
          className="drag-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(24, 24, 27, 0.05)',
            border: '3px dashed var(--accent)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <Upload className="w-16 h-16 text-accent mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">Drop files here</h3>
          <p className="text-secondary text-center max-w-md">
            Support for images, videos, text files, and web URLs
          </p>
          <div className="flex items-center space-x-6 mt-4 text-muted">
            <div className="flex items-center space-x-2">
              <Image className="w-5 h-5" />
              <span className="text-sm">Images</span>
            </div>
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5" />
              <span className="text-sm">Videos</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Text</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm">URLs</span>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div
          className="processing-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">Processing files...</h3>
            <div className="w-64 h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-secondary mt-2">{Math.round(uploadProgress)}% complete</p>
          </div>
        </div>
      )}

      {/* Hidden file input for manual upload */}
      <input
        type="file"
        multiple
        accept="image/*,video/*,text/*,.txt,.md,.json,.html,.css,.js"
        onChange={handleFileInput}
        style={{ display: 'none' }}
        id="file-upload-input"
      />

      <style jsx>{`
        .drag-drop-zone {
          transition: all 0.2s ease;
        }

        .drag-drop-zone.drag-over {
          background-color: rgba(24, 24, 27, 0.02);
        }

        .drag-overlay {
          animation: fadeIn 0.2s ease-out;
        }

        .processing-overlay {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}