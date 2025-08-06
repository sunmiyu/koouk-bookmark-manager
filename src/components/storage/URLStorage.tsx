'use client'

import { useState } from 'react'

type URLItem = {
  id: string
  title: string
  url: string
  description: string
  category: string
  createdAt: string
}

export default function URLStorage() {
  const [urls, setUrls] = useState<URLItem[]>([
    {
      id: '1',
      title: 'OpenAI ChatGPT',
      url: 'https://chat.openai.com',
      description: 'AI 챗봇 서비스',
      category: 'AI',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'GitHub',
      url: 'https://github.com',
      description: '코드 저장소',
      category: '개발',
      createdAt: new Date().toISOString()
    }
  ])
  
  const [newURL, setNewURL] = useState({ title: '', url: '', description: '', category: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [quickURL, setQuickURL] = useState('')
  const [isQuickAdding, setIsQuickAdding] = useState(false)

  const addURL = () => {
    if (newURL.title && newURL.url) {
      const urlItem: URLItem = {
        id: Date.now().toString(),
        ...newURL,
        createdAt: new Date().toISOString()
      }
      setUrls(prev => [urlItem, ...prev])
      setNewURL({ title: '', url: '', description: '', category: '' })
      setShowAddForm(false)
    }
  }

  const quickAddURL = async () => {
    if (!quickURL.trim()) return
    
    setIsQuickAdding(true)
    try {
      // URL에서 도메인명을 추출해서 제목으로 사용 (간단한 방법)
      let title = quickURL
      try {
        const domain = new URL(quickURL).hostname.replace('www.', '')
        title = domain.charAt(0).toUpperCase() + domain.slice(1)
      } catch {
        title = quickURL.slice(0, 30) + '...'
      }
      
      const urlItem: URLItem = {
        id: Date.now().toString(),
        title,
        url: quickURL,
        description: '빠른 추가로 저장됨',
        category: '기타',
        createdAt: new Date().toISOString()
      }
      
      setUrls(prev => [urlItem, ...prev])
      setQuickURL('')
    } finally {
      setIsQuickAdding(false)
    }
  }

  const deleteURL = (id: string) => {
    setUrls(prev => prev.filter(url => url.id !== id))
  }

  const openURL = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl">🔗</span>
          <div className="flex-1">
            <h1 style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: '700', 
              color: 'var(--text-primary)' 
            }}>
              URL Storage
            </h1>
          </div>
        </div>
        
        {/* 빠른 추가 - 메인 기능 */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="URL을 붙여넣으면 바로 저장됩니다"
              value={quickURL}
              onChange={(e) => setQuickURL(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && quickAddURL()}
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
              onClick={quickAddURL}
              disabled={!quickURL.trim() || isQuickAdding}
              className="transition-all duration-200 ease-out"
              style={{
                backgroundColor: quickURL.trim() ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: quickURL.trim() ? 'var(--bg-card)' : 'var(--text-tertiary)',
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
          
          {/* 고급 옵션 토글 */}
          <div className="mt-3 text-center">
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
            새 링크 추가
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="제목"
              value={newURL.title}
              onChange={(e) => setNewURL(prev => ({ ...prev, title: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="url"
              placeholder="URL"
              value={newURL.url}
              onChange={(e) => setNewURL(prev => ({ ...prev, url: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              placeholder="카테고리"
              value={newURL.category}
              onChange={(e) => setNewURL(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={addURL}
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
            value={newURL.description}
            onChange={(e) => setNewURL(prev => ({ ...prev, description: e.target.value }))}
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

      {/* URL List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {urls.map(urlItem => (
          <div key={urlItem.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow" style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-light)'
          }}>
            <div className="flex justify-between items-start mb-3">
              <h3 
                className="font-semibold cursor-pointer hover:text-blue-600"
                style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}
                onClick={() => openURL(urlItem.url)}
              >
                {urlItem.title}
              </h3>
              <button
                onClick={() => deleteURL(urlItem.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ×
              </button>
            </div>
            
            {urlItem.category && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded mb-2">
                {urlItem.category}
              </span>
            )}
            
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              {urlItem.description}
            </p>
            
            <a
              href={urlItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 text-sm break-all"
            >
              {urlItem.url}
            </a>
            
            <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(urlItem.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}