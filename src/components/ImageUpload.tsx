'use client'

import { useState, useRef } from 'react'
import { useContent } from '@/contexts/ContentContext'
import { useAuth } from '@/contexts/AuthContext'
import { uploadImage, compressImage } from '@/lib/imageUpload'

interface ImageUploadProps {
  onUploadComplete?: () => void
}

export default function ImageUpload({ onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { addItem } = useContent()
  const { user } = useAuth()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    await handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setUploading(true)
    
    try {
      // Compress image if it's large
      const compressedFile = await compressImage(file, 1920, 0.8)
      
      // Upload to Supabase Storage
      const uploadResult = await uploadImage(compressedFile, user.id)
      
      // Add to content context
      await addItem({
        type: 'image',
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        url: uploadResult.url,
        thumbnail: uploadResult.url,
        description: `Uploaded image • ${(uploadResult.size / 1024).toFixed(1)} KB`
      })

      onUploadComplete?.()
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert(error instanceof Error ? error.message : '업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (!user) {
    return (
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <p className="text-gray-400 text-sm">로그인 후 이미지를 업로드할 수 있습니다</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragActive 
            ? 'border-green-400 bg-green-400/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!uploading ? openFileDialog : undefined}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-green-400 text-sm">이미지 업로드 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-300 text-sm mb-1">
              이미지를 클릭하거나 드래그해서 업로드
            </p>
            <p className="text-gray-500 text-xs">
              JPEG, PNG, WebP, GIF 지원 • 최대 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}