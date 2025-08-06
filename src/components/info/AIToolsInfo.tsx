'use client'

import { useState } from 'react'

type AITool = {
  id: string
  name: string
  url: string
  category: string
  description: string
  pricing: 'Free' | 'Freemium' | 'Paid'
  rating: number
  tags: string[]
  createdAt: string
}

export default function AIToolsInfo() {
  const [aiTools, setAITools] = useState<AITool[]>([
    {
      id: '1',
      name: 'ChatGPT',
      url: 'https://chat.openai.com',
      category: '텍스트 생성',
      description: 'AI 챗봇으로 질문 답변, 글쓰기, 코딩 등 다양한 작업 가능',
      pricing: 'Freemium',
      rating: 5,
      tags: ['챗봇', '글쓰기', '코딩'],
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Midjourney',
      url: 'https://midjourney.com',
      category: '이미지 생성',
      description: 'AI로 고품질 이미지를 생성하는 도구',
      pricing: 'Paid',
      rating: 5,
      tags: ['이미지', '아트', '디자인'],
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Claude',
      url: 'https://claude.ai',
      category: '텍스트 생성',
      description: 'Anthropic의 AI 어시스턴트, 긴 문서 분석에 특화',
      pricing: 'Freemium',
      rating: 5,
      tags: ['챗봇', '문서분석', '글쓰기'],
      createdAt: new Date().toISOString()
    }
  ])

  const [newTool, setNewTool] = useState({
    name: '',
    url: '',
    category: '',
    description: '',
    pricing: 'Free' as const,
    rating: 5,
    tags: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const categories = ['텍스트 생성', '이미지 생성', '음성 인식', '번역', '코딩', '디자인', '마케팅', '분석', '기타']
  const pricingOptions: AITool['pricing'][] = ['Free', 'Freemium', 'Paid']

  const addTool = () => {
    if (newTool.name && newTool.url) {
      const toolItem: AITool = {
        id: Date.now().toString(),
        ...newTool,
        tags: newTool.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date().toISOString()
      }
      setAITools(prev => [toolItem, ...prev])
      setNewTool({
        name: '',
        url: '',
        category: '',
        description: '',
        pricing: 'Free',
        rating: 5,
        tags: ''
      })
      setShowAddForm(false)
    }
  }

  const deleteTool = (id: string) => {
    setAITools(prev => prev.filter(tool => tool.id !== id))
  }

  const openTool = (url: string) => {
    window.open(url, '_blank')
  }

  const getPricingColor = (pricing: AITool['pricing']) => {
    switch (pricing) {
      case 'Free': return { bg: 'var(--text-success)', text: 'white' }
      case 'Freemium': return { bg: 'var(--bg-secondary)', text: 'var(--text-secondary)' }
      case 'Paid': return { bg: 'var(--text-error)', text: 'white' }
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < rating ? '#FFD700' : 'var(--text-tertiary)',
          fontSize: 'var(--text-sm)'
        }}
      >
        ★
      </span>
    ))
  }

  return (
    <div className="h-full" style={{ 
      padding: 'var(--space-10) var(--space-8)',
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '2rem' }}>🤖</span>
            <div>
              <h1 style={{ 
                fontSize: 'var(--text-3xl)',
                fontWeight: '300',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
                marginBottom: 'var(--space-2)'
              }}>
                AI Tools 모음
              </h1>
              <p style={{ 
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                fontWeight: '400',
                lineHeight: '1.5'
              }}>
                유용한 AI 도구들을 저장하고 관리하세요
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="transition-all duration-200 ease-out"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-card)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              letterSpacing: '0.01em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--text-secondary)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--text-primary)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            + 도구 추가
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-8 transition-all duration-300 ease-out animate-smooth-slideIn" style={{ 
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <h3 style={{ 
            fontSize: 'var(--text-xl)',
            fontWeight: '500',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            letterSpacing: '-0.01em'
          }}>
            새 AI 도구 추가
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="도구 이름"
              value={newTool.name}
              onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              type="url"
              placeholder="URL"
              value={newTool.url}
              onChange={(e) => setNewTool(prev => ({ ...prev, url: e.target.value }))}
              required
            />
            <select
              value={newTool.category}
              onChange={(e) => setNewTool(prev => ({ ...prev, category: e.target.value }))}
              style={{
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3) var(--space-4)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-md)',
                outline: 'none'
              }}
            >
              <option value="">카테고리 선택</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={newTool.pricing}
              onChange={(e) => setNewTool(prev => ({ ...prev, pricing: e.target.value as AITool['pricing'] }))}
              style={{
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3) var(--space-4)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-md)',
                outline: 'none'
              }}
            >
              {pricingOptions.map(pricing => (
                <option key={pricing} value={pricing}>{pricing}</option>
              ))}
            </select>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)', display: 'block' }}>
                평점: {newTool.rating}점
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={newTool.rating}
                onChange={(e) => setNewTool(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            <input
              type="text"
              placeholder="태그 (쉼표로 구분)"
              value={newTool.tags}
              onChange={(e) => setNewTool(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>
          
          <textarea
            placeholder="설명"
            value={newTool.description}
            onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full mb-4"
          />

          <div className="flex gap-3">
            <button
              onClick={addTool}
              className="transition-all duration-200 ease-out"
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-card)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-6)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500'
              }}
            >
              저장
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="transition-all duration-200 ease-out"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-6)',
                fontSize: 'var(--text-sm)',
                fontWeight: '400'
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {aiTools.map(tool => (
          <div 
            key={tool.id} 
            className="group transition-all duration-300 ease-out cursor-pointer"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-subtle)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
            }}
            onClick={() => openTool(tool.url)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 style={{ 
                  fontSize: 'var(--text-xl)',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.3'
                }}>
                  {tool.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{
                    ...getPricingColor(tool.pricing),
                    fontSize: 'var(--text-xs)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: '500'
                  }}>
                    {tool.pricing}
                  </span>
                  {tool.category && (
                    <span style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-xs)',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '500'
                    }}>
                      {tool.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center mb-3">
                  {renderStars(tool.rating)}
                  <span style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--text-tertiary)',
                    marginLeft: 'var(--space-2)'
                  }}>
                    ({tool.rating}/5)
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteTool(tool.id)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  color: 'var(--text-tertiary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 'var(--space-1)',
                  fontSize: 'var(--text-lg)'
                }}
              >
                ×
              </button>
            </div>

            <p style={{ 
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              marginBottom: 'var(--space-4)'
            }}>
              {tool.description}
            </p>

            {tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {tool.tags.map((tag, index) => (
                  <span key={index} style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-tertiary)',
                    fontSize: 'var(--text-xs)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: '400'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span style={{ 
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                fontWeight: '500'
              }}>
                도구 열기 →
              </span>
              <div style={{ 
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)'
              }}>
                {new Date(tool.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}