'use client'

import { useState } from 'react'

type TravelItem = {
  id: string
  name: string
  location: string
  country: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedCost: string
  bestSeason: string
  visited: boolean
  createdAt: string
}

export default function TravelStorage() {
  const [destinations, setDestinations] = useState<TravelItem[]>([
    {
      id: '1',
      name: '제주도 한라산',
      location: '제주도',
      country: '대한민국',
      description: '아름다운 자연경관과 등산로를 즐길 수 있는 곳',
      priority: 'high',
      estimatedCost: '50만원',
      bestSeason: '봄, 가을',
      visited: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: '파리 에펠탑',
      location: '파리',
      country: '프랑스',
      description: '로맨틱한 도시 파리의 상징적인 랜드마크',
      priority: 'medium',
      estimatedCost: '200만원',
      bestSeason: '봄, 여름',
      visited: true,
      createdAt: new Date().toISOString()
    }
  ])
  
  const [newDestination, setNewDestination] = useState({
    name: '',
    location: '',
    country: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimatedCost: '',
    bestSeason: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const addDestination = () => {
    if (newDestination.name && newDestination.location) {
      const travelItem: TravelItem = {
        id: Date.now().toString(),
        ...newDestination,
        visited: false,
        createdAt: new Date().toISOString()
      }
      setDestinations(prev => [travelItem, ...prev])
      setNewDestination({
        name: '',
        location: '',
        country: '',
        description: '',
        priority: 'medium',
        estimatedCost: '',
        bestSeason: ''
      })
      setShowAddForm(false)
    }
  }

  const deleteDestination = (id: string) => {
    setDestinations(prev => prev.filter(dest => dest.id !== id))
  }

  const toggleVisited = (id: string) => {
    setDestinations(prev => prev.map(dest =>
      dest.id === id ? { ...dest, visited: !dest.visited } : dest
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✈️</span>
            <h1 style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: '700', 
              color: 'var(--text-primary)' 
            }}>
              여행가고 싶은곳 Storage
            </h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            + 여행지 추가
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border p-6 mb-6" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            새 여행지 추가
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="여행지명"
              value={newDestination.name}
              onChange={(e) => setNewDestination(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              placeholder="위치/도시"
              value={newDestination.location}
              onChange={(e) => setNewDestination(prev => ({ ...prev, location: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              placeholder="국가"
              value={newDestination.country}
              onChange={(e) => setNewDestination(prev => ({ ...prev, country: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <div className="flex gap-2">
              <select
                value={newDestination.priority}
                onChange={(e) => setNewDestination(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                className="px-3 py-2 border rounded"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="high">높은 우선순위</option>
                <option value="medium">보통 우선순위</option>
                <option value="low">낮은 우선순위</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="예상 비용"
              value={newDestination.estimatedCost}
              onChange={(e) => setNewDestination(prev => ({ ...prev, estimatedCost: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              placeholder="최적 시기"
              value={newDestination.bestSeason}
              onChange={(e) => setNewDestination(prev => ({ ...prev, bestSeason: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          
          <textarea
            placeholder="설명 및 메모"
            value={newDestination.description}
            onChange={(e) => setNewDestination(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border rounded mt-4"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={addDestination}
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

      {/* Destination List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {destinations.map(destination => (
          <div key={destination.id} className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all ${
            destination.visited ? 'border-green-200 bg-green-50' : ''
          }`} style={{ 
            backgroundColor: destination.visited ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
            borderColor: destination.visited ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-light)'
          }}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600'
                }}>
                  {destination.name}
                </h3>
                {destination.visited && (
                  <span className="text-green-500">✓</span>
                )}
              </div>
              <button
                onClick={() => deleteDestination(destination.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className={`inline-block px-2 py-1 text-xs rounded ${getPriorityColor(destination.priority)}`}>
                  {destination.priority === 'high' ? '높음' : destination.priority === 'medium' ? '보통' : '낮음'}
                </span>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                📍 {destination.location}, {destination.country}
              </p>
              
              {destination.estimatedCost && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  💰 {destination.estimatedCost}
                </p>
              )}
              
              {destination.bestSeason && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  🌅 {destination.bestSeason}
                </p>
              )}
            </div>
            
            {destination.description && (
              <p className="text-sm mb-4 p-2 bg-gray-50 rounded" style={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                {destination.description}
              </p>
            )}
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => toggleVisited(destination.id)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  destination.visited 
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {destination.visited ? '방문취소' : '방문완료'}
              </button>
              
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(destination.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}