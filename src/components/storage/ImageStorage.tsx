'use client'

import { useState } from 'react'

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

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🖼️</span>
            <h1 style={{ 
              fontSize: 'var(--text-2xl)', 
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
                  handleFileSelect({ target: { files } } as React.ChangeEvent<HTMLInputElement>)
                  if (files[0]) {
                    quickAddImage(files[0])
                  }
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => document.getElementById('image-input')?.click()}
            >
              <span style={{ fontSize: '2rem', marginBottom: 'var(--space-2)', display: 'block' }}>📸</span>
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
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-xs max-h-48 rounded border"
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
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <img
                src={imageItem.imageUrl}
                alt={imageItem.title}
                className="w-full h-full object-cover"
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