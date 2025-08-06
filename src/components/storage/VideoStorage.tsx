'use client'

import { useState } from 'react'
import Image from 'next/image'

type VideoItem = {
  id: string
  title: string
  youtubeUrl: string
  videoId: string
  description: string
  tags: string[]
  createdAt: string
}

export default function VideoStorage() {
  const [videos, setVideos] = useState<VideoItem[]>([
    {
      id: '1',
      title: '샘플 유튜브 영상',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoId: 'dQw4w9WgXcQ',
      description: '샘플 영상입니다',
      tags: ['샘플', '테스트'],
      createdAt: new Date().toISOString()
    }
  ])
  
  const [newVideo, setNewVideo] = useState({ title: '', url: '', description: '', tags: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [quickVideoURL, setQuickVideoURL] = useState('')
  const [isQuickAdding, setIsQuickAdding] = useState(false)

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  const addVideo = () => {
    if (newVideo.title && newVideo.url) {
      const videoId = extractVideoId(newVideo.url)
      if (!videoId) {
        alert('올바른 YouTube URL을 입력해주세요.')
        return
      }

      const videoItem: VideoItem = {
        id: Date.now().toString(),
        title: newVideo.title,
        youtubeUrl: newVideo.url,
        videoId,
        description: newVideo.description,
        tags: newVideo.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date().toISOString()
      }
      setVideos(prev => [videoItem, ...prev])
      setNewVideo({ title: '', url: '', description: '', tags: '' })
      setShowAddForm(false)
    }
  }

  const quickAddVideo = async () => {
    if (!quickVideoURL.trim()) return
    
    const videoId = extractVideoId(quickVideoURL)
    if (!videoId) {
      alert('올바른 YouTube URL을 입력해주세요.')
      return
    }
    
    setIsQuickAdding(true)
    try {
      // 간단한 제목 생성 (실제로는 YouTube API로 가져올 수 있음)
      const title = `YouTube Video ${videoId}`
      
      const videoItem: VideoItem = {
        id: Date.now().toString(),
        title,
        youtubeUrl: quickVideoURL,
        videoId,
        description: '빠른 추가로 저장됨',
        tags: [],
        createdAt: new Date().toISOString()
      }
      
      setVideos(prev => [videoItem, ...prev])
      setQuickVideoURL('')
    } finally {
      setIsQuickAdding(false)
    }
  }

  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id))
  }

  const openVideo = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎥</span>
            <h1 style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: '700', 
              color: 'var(--text-primary)' 
            }}>
              영상(유튜브) Storage
            </h1>
          </div>
          <div className="flex flex-col gap-3">
            {/* YouTube URL 빠른 추가 */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="YouTube URL을 붙여넣으면 바로 저장됩니다"
                value={quickVideoURL}
                onChange={(e) => setQuickVideoURL(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && quickAddVideo()}
                className="flex-1"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--text-md)',
                  outline: 'none'
                }}
              />
              <button
                onClick={quickAddVideo}
                disabled={!quickVideoURL.trim() || isQuickAdding}
                className="transition-all duration-200 ease-out"
                style={{
                  backgroundColor: quickVideoURL.trim() ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: quickVideoURL.trim() ? 'var(--bg-card)' : 'var(--text-tertiary)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  minWidth: '80px'
                }}
              >
                {isQuickAdding ? '저장중...' : '저장'}
              </button>
            </div>
            
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
            새 영상 추가
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="제목"
              value={newVideo.title}
              onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="url"
              placeholder="YouTube URL"
              value={newVideo.url}
              onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
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
              value={newVideo.tags}
              onChange={(e) => setNewVideo(prev => ({ ...prev, tags: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={addVideo}
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
          <textarea
            placeholder="설명"
            value={newVideo.description}
            onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border rounded mt-4"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
        {videos.map(videoItem => (
          <div key={videoItem.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow" style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-light)'
          }}>
            {/* YouTube Thumbnail */}
            <div className="aspect-video bg-gray-100 relative cursor-pointer" onClick={() => openVideo(videoItem.youtubeUrl)}>
              <Image
                src={`https://img.youtube.com/vi/${videoItem.videoId}/maxresdefault.jpg`}
                alt={videoItem.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 
                  className="font-semibold cursor-pointer hover:text-blue-600 line-clamp-2"
                  style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: 'var(--text-base)'
                  }}
                  onClick={() => openVideo(videoItem.youtubeUrl)}
                >
                  {videoItem.title}
                </h3>
                <button
                  onClick={() => deleteVideo(videoItem.id)}
                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                >
                  ×
                </button>
              </div>
              
              {videoItem.tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {videoItem.tags.map((tag, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {videoItem.description}
              </p>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => openVideo(videoItem.youtubeUrl)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  YouTube에서 보기 →
                </button>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(videoItem.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}