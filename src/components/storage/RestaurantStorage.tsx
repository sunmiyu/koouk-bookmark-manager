'use client'

import { useState } from 'react'

type RestaurantItem = {
  id: string
  name: string
  cuisine: string
  location: string
  url?: string
  rating: number
  priceRange: string
  notes: string
  visited: boolean
  createdAt: string
}

export default function RestaurantStorage() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([
    {
      id: '1',
      name: '이태원 피자집',
      cuisine: '이탈리안',
      location: '이태원역 2번출구',
      rating: 4.5,
      priceRange: '$$',
      notes: '분위기 좋고 피자가 맛있음. 데이트 코스로 추천',
      visited: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: '명동 칼국수',
      cuisine: '한식',
      location: '명동역 근처',
      rating: 4.0,
      priceRange: '$',
      notes: '저렴하고 양이 많음. 혼밥하기 좋음',
      visited: false,
      createdAt: new Date().toISOString()
    }
  ])
  
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    cuisine: '',
    location: '',
    rating: 0,
    priceRange: '$',
    notes: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [quickRestaurantURL, setQuickRestaurantURL] = useState('')
  const [isQuickAdding, setIsQuickAdding] = useState(false)

  const quickAddRestaurantURL = async () => {
    if (!quickRestaurantURL.trim()) return
    
    setIsQuickAdding(true)
    try {
      // URL 유효성 검사 및 제목 추출
      let name = quickRestaurantURL
      let location = '링크 참조'
      
      try {
        const url = new URL(quickRestaurantURL)
        const domain = url.hostname.replace('www.', '')
        
        // 도메인별 맞춤 처리
        if (domain.includes('naver') || domain.includes('map')) {
          name = '네이버 지도 맛집'
          location = '네이버 지도 링크'
        } else if (domain.includes('kakao') || domain.includes('map')) {
          name = '카카오맵 맛집'
          location = '카카오맵 링크'
        } else if (domain.includes('google')) {
          name = 'Google Maps 맛집'
          location = 'Google Maps 링크'
        } else if (domain.includes('yogiyo') || domain.includes('baedal')) {
          name = '배달앱 맛집'
          location = '배달앱 링크'
        } else {
          name = domain.charAt(0).toUpperCase() + domain.slice(1) + ' 맛집'
        }
      } catch {
        name = 'URL 맛집'
      }
      
      const restaurantItem: RestaurantItem = {
        id: Date.now().toString(),
        name,
        cuisine: '',
        location,
        url: quickRestaurantURL,
        rating: 0,
        priceRange: '$',
        notes: '빠른 URL 추가로 저장됨',
        visited: false,
        createdAt: new Date().toISOString()
      }
      
      setRestaurants(prev => [restaurantItem, ...prev])
      setQuickRestaurantURL('')
    } finally {
      setIsQuickAdding(false)
    }
  }

  const addRestaurant = () => {
    if (newRestaurant.name && newRestaurant.location) {
      const restaurantItem: RestaurantItem = {
        id: Date.now().toString(),
        ...newRestaurant,
        visited: false,
        createdAt: new Date().toISOString()
      }
      setRestaurants(prev => [restaurantItem, ...prev])
      setNewRestaurant({
        name: '',
        cuisine: '',
        location: '',
        rating: 0,
        priceRange: '$',
        notes: ''
      })
      setShowAddForm(false)
    }
  }

  const deleteRestaurant = (id: string) => {
    setRestaurants(prev => prev.filter(restaurant => restaurant.id !== id))
  }

  const toggleVisited = (id: string) => {
    setRestaurants(prev => prev.map(restaurant =>
      restaurant.id === id ? { ...restaurant, visited: !restaurant.visited } : restaurant
    ))
  }

  const getRatingStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
  }

  const getPriceDisplay = (priceRange: string) => {
    const priceMap: { [key: string]: string } = {
      '$': '₩ (저렴)',
      '$$': '₩₩ (보통)',
      '$$$': '₩₩₩ (비싸)'
    }
    return priceMap[priceRange] || priceRange
  }

  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">🍽️</span>
            <h1 style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: '700', 
              color: 'var(--text-primary)' 
            }}>
              맛집 Storage
            </h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            + 맛집 추가
          </button>
        </div>
      </div>

      {/* Quick URL Input */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="url"
              value={quickRestaurantURL}
              onChange={(e) => setQuickRestaurantURL(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  quickAddRestaurantURL()
                }
              }}
              placeholder="맛집 URL을 붙여넣으세요 (네이버지도, 구글맵, 배달앱 등)"
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
              🍽️
            </div>
          </div>
          <button
            onClick={quickAddRestaurantURL}
            disabled={!quickRestaurantURL.trim() || isQuickAdding}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: quickRestaurantURL.trim() ? '#1A1A1A' : '#9CA3AF',
              fontSize: 'var(--text-sm)'
            }}
            onMouseEnter={(e) => {
              if (quickRestaurantURL.trim()) {
                e.currentTarget.style.backgroundColor = '#333333'
                e.currentTarget.style.transform = 'scale(1.02)'
              }
            }}
            onMouseLeave={(e) => {
              if (quickRestaurantURL.trim()) {
                e.currentTarget.style.backgroundColor = '#1A1A1A'
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            {isQuickAdding ? '추가 중...' : '빠른 추가'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2" style={{ color: 'var(--text-muted)' }}>
          💡 맛집 URL을 입력하고 엔터키를 누르면 바로 저장됩니다
        </p>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border p-6 mb-6" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            새 맛집 추가
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="음식점 이름"
              value={newRestaurant.name}
              onChange={(e) => setNewRestaurant(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              placeholder="음식 종류"
              value={newRestaurant.cuisine}
              onChange={(e) => setNewRestaurant(prev => ({ ...prev, cuisine: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              placeholder="위치"
              value={newRestaurant.location}
              onChange={(e) => setNewRestaurant(prev => ({ ...prev, location: e.target.value }))}
              className="px-3 py-2 border rounded"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <div className="flex gap-2">
              <select
                value={newRestaurant.priceRange}
                onChange={(e) => setNewRestaurant(prev => ({ ...prev, priceRange: e.target.value }))}
                className="px-3 py-2 border rounded"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="$">₩ 저렴</option>
                <option value="$$">₩₩ 보통</option>
                <option value="$$$">₩₩₩ 비쌈</option>
              </select>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="평점"
                value={newRestaurant.rating}
                onChange={(e) => setNewRestaurant(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                className="px-3 py-2 border rounded"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
          
          <textarea
            placeholder="메모 (분위기, 추천메뉴, 특이사항 등)"
            value={newRestaurant.notes}
            onChange={(e) => setNewRestaurant(prev => ({ ...prev, notes: e.target.value }))}
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
              onClick={addRestaurant}
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

      {/* Restaurant List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {restaurants.map(restaurant => (
          <div key={restaurant.id} className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all ${
            restaurant.visited ? 'border-green-200 bg-green-50' : ''
          }`} style={{ 
            backgroundColor: restaurant.visited ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
            borderColor: restaurant.visited ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-light)'
          }}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600'
                }}>
                  {restaurant.name}
                </h3>
                {restaurant.visited && (
                  <span className="text-green-500">✓</span>
                )}
              </div>
              <button
                onClick={() => deleteRestaurant(restaurant.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              {restaurant.cuisine && (
                <span className="inline-block px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">
                  {restaurant.cuisine}
                </span>
              )}
              
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                📍 {restaurant.location}
              </p>
              
              {restaurant.url && (
                <a 
                  href={restaurant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-xs underline flex items-center gap-1"
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  🔗 링크 보기
                </a>
              )}
              
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--warning)' }}>
                  {getRatingStars(restaurant.rating)}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {restaurant.rating}/5
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {getPriceDisplay(restaurant.priceRange)}
                </span>
              </div>
            </div>
            
            {restaurant.notes && (
              <p className="text-sm mb-4 p-2 bg-gray-50 rounded" style={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                {restaurant.notes}
              </p>
            )}
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => toggleVisited(restaurant.id)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  restaurant.visited 
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {restaurant.visited ? '방문취소' : '방문완료'}
              </button>
              
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(restaurant.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}