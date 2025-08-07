'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type ImageItem = {
  id: string
  title: string
  imageUrl: string
  description: string
  tags: string[]
  createdAt: string
}

export default function ImageStorage() {
  const [images, setImages] = useState<ImageItem[]>([
    {
      id: '1',
      title: '샘플 이미지',
      imageUrl: 'https://via.placeholder.com/300x200?text=Sample+Image',
      description: '샘플 이미지입니다',
      tags: ['샘플', '테스트'],
      createdAt: new Date().toISOString()
    }
  ])
  
  const [newImage, setNewImage] = useState({ title: '', description: '', tags: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [quickImageURL, setQuickImageURL] = useState('')
  const [isQuickAdding, setIsQuickAdding] = useState(false)
  const [clipboardSupported, setClipboardSupported] = useState(false)

  // Check clipboard support on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.read === 'function') {
      setClipboardSupported(true)
    }
  }, [])

  // Handle clipboard paste
  const handleClipboardPaste = async () => {
    if (!clipboardSupported) return
    
    try {
      const clipboardItems = await navigator.clipboard.read()
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type)
            const file = new File([blob], `clipboard-image-${Date.now()}.${type.split('/')[1]}`, { type })
            quickAddImage(file)
            return
          }
        }
      }
      
      // If no image found, show message
      alert('클립보드에 이미지가 없습니다.')
    } catch (err) {
      console.error('Failed to read clipboard:', err)
      alert('클립보드 접근에 실패했습니다.')
    }
  }

  // Handle global paste event
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Only handle if we're in the image storage section and no input is focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }
      
      const items = e.clipboardData?.items
      if (!items) return
      
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            quickAddImage(file)
          }
          break
        }
      }
    }

    document.addEventListener('paste', handleGlobalPaste)
    return () => document.removeEventListener('paste', handleGlobalPaste)
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const addImage = () => {
    if (newImage.title && selectedFile) {
      // 실제로는 파일 업로드 후 URL 받아와야 함
      const imageItem: ImageItem = {
        id: Date.now().toString(),
        title: newImage.title,
        imageUrl: previewUrl || '',
        description: newImage.description,
        tags: newImage.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date().toISOString()
      }
      setImages(prev => [imageItem, ...prev])
      setNewImage({ title: '', description: '', tags: '' })
      setSelectedFile(null)
      setPreviewUrl(null)
      setShowAddForm(false)
    }
  }

  const quickAddImage = (file: File) => {
    const url = URL.createObjectURL(file)
    const imageItem: ImageItem = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ''), // 확장자 제거
      imageUrl: url,
      description: '빠른 추가로 저장됨',
      tags: [],
      createdAt: new Date().toISOString()
    }
    setImages(prev => [imageItem, ...prev])
  }

  const quickAddImageURL = async () => {
    if (!quickImageURL.trim()) return
    
    setIsQuickAdding(true)
    try {
      // URL 유효성 검사 및 제목 추출
      let title = quickImageURL
      try {
        const url = new URL(quickImageURL)
        const pathSegments = url.pathname.split('/').filter(segment => segment)
        const fileName = pathSegments[pathSegments.length - 1]
        
        if (fileName && fileName.includes('.')) {
          title = fileName.replace(/\.[^/.]+$/, '') // 확장자 제거
        } else {
          const domain = url.hostname.replace('www.', '')
          title = domain.charAt(0).toUpperCase() + domain.slice(1)
        }
      } catch {
        title = 'Image from URL'
      }
      
      const imageItem: ImageItem = {
        id: Date.now().toString(),
        title,
        imageUrl: quickImageURL,
        description: '빠른 URL 추가로 저장됨',
        tags: ['URL'],
        createdAt: new Date().toISOString()
      }
      
      setImages(prev => [imageItem, ...prev])
      setQuickImageURL('')
    } finally {
      setIsQuickAdding(false)
    }
  }

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">🖼️</span>
            <h1 style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: '700', 
              color: 'var(--text-primary)' 
            }}>
              이미지 Storage
            </h1>
          </div>
          <div className="flex flex-col gap-3">
            {/* 드래그 앤 드롭 영역 */}
            <div 
              className={`border-2 border-dashed transition-all duration-200 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                textAlign: 'center' as const,
                cursor: 'pointer'
              }}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const files = Array.from(e.dataTransfer.files)
                if (files[0] && files[0].type.startsWith('image/')) {
                  quickAddImage(files[0])
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => document.getElementById('image-input')?.click()}
            >
              <span style={{ fontSize: '1.125rem', marginBottom: 'var(--space-2)', display: 'block' }}>📸</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                이미지를 드래그하거나 클릭해서 바로 추가
              </p>
            </div>
            
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileSelect(e)
                if (e.target.files?.[0]) {
                  quickAddImage(e.target.files[0])
                }
              }}
              style={{ display: 'none' }}
            />

            {/* Clipboard paste button */}
            {clipboardSupported && (
              <button
                onClick={handleClipboardPaste}
                className="transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--text-primary)'
                  e.currentTarget.style.color = 'var(--bg-card)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <span>📋</span>
                <span>클립보드에서 붙여넣기</span>
              </button>
            )}
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="transition-colors duration-200"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: 'var(--text-xs)',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              {showAddForm ? '간단하게 추가' : '자세한 정보 입력'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick URL Input */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="url"
              value={quickImageURL}
              onChange={(e) => setQuickImageURL(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  quickAddImageURL()
                }
              }}
              placeholder="이미지 URL을 붙여넣으세요 (Pinterest, Instagram, 웹사이트 등)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 ease-out"
              style={{
                backgroundColor: '#FAFAF9',
                borderColor: '#F5F3F0',
                color: '#1A1A1A',
                fontSize: 'var(--text-sm)',
                fontWeight: '400',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#E8E5E1'
                e.target.style.backgroundColor = '#FFFFFF'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#F5F3F0'
                e.target.style.backgroundColor = '#FAFAF9'
              }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔗
            </div>
          </div>
          <button
            onClick={quickAddImageURL}
            disabled={!quickImageURL.trim() || isQuickAdding}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: quickImageURL.trim() ? '#1A1A1A' : '#9CA3AF',
              fontSize: 'var(--text-sm)'
            }}
            onMouseEnter={(e) => {
              if (quickImageURL.trim()) {
                e.currentTarget.style.backgroundColor = '#333333'
                e.currentTarget.style.transform = 'scale(1.02)'
              }
            }}
            onMouseLeave={(e) => {
              if (quickImageURL.trim()) {
                e.currentTarget.style.backgroundColor = '#1A1A1A'
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            {isQuickAdding ? '추가 중...' : '빠른 추가'}
          </button>
        </div>
        <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <p>💡 URL을 입력하고 엔터키를 누르면 바로 저장됩니다</p>
          {clipboardSupported && (
            <p>📋 Ctrl+V로 클립보드 이미지를 바로 붙여넣기할 수 있습니다</p>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border p-6 mb-6" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            새 이미지 추가
          </h3>
          
          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              이미지 파일
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mb-4">
              <Image
                src={previewUrl}
                alt="Preview"
                width={300}
                height={192}
                className="max-w-xs max-h-48 rounded border object-cover"
                style={{ borderColor: 'var(--border-light)' }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="제목"
              value={newImage.title}
              onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              placeholder="태그 (쉼표로 구분)"
              value={newImage.tags}
              onChange={(e) => setNewImage(prev => ({ ...prev, tags: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          
          <textarea
            placeholder="설명"
            value={newImage.description}
            onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border rounded mt-4"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={addImage}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              저장
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              style={{ borderColor: 'var(--border-light)' }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {images.map(imageItem => (
          <div key={imageItem.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow" style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-light)'
          }}>
            <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
              <Image
                src={imageItem.imageUrl}
                alt={imageItem.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: 'var(--text-base)',
                  fontWeight: '600'
                }}>
                  {imageItem.title}
                </h3>
                <button
                  onClick={() => deleteImage(imageItem.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
              
              {imageItem.tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {imageItem.tags.map((tag, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                {imageItem.description}
              </p>
              
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(imageItem.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}