'use client'

import { useState, useEffect } from 'react'
import { RestaurantItem, RestaurantData } from '@/types/miniFunctions'

interface NearbyRestaurantsProps {
  isPreviewOnly?: boolean
}

export default function NearbyRestaurants({ isPreviewOnly = false }: NearbyRestaurantsProps) {
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    nearbyRestaurants: [],
    lastUpdated: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // 샘플 맛집 데이터 (실제로는 Naver Local API에서 가져올 예정)
  const generateSampleRestaurants = (): RestaurantItem[] => {
    const sampleRestaurants = [
      {
        id: '1',
        name: '명동교자 본점',
        category: '한식',
        rating: 4.3,
        reviewCount: 2847,
        distance: '150m',
        priceRange: '1-2만원',
        location: '명동',
        specialties: ['왕만두', '칼국수'],
        isOpen: true,
        openHours: '10:00-22:00'
      },
      {
        id: '2', 
        name: '스타벅스 명동점',
        category: '카페',
        rating: 4.1,
        reviewCount: 1523,
        distance: '80m',
        priceRange: '5천원-1만원',
        location: '명동',
        specialties: ['아메리카노', '프라푸치노'],
        isOpen: true,
        openHours: '07:00-22:00'
      },
      {
        id: '3',
        name: '본죽&비빔밥 명동점',
        category: '한식',
        rating: 4.0,
        reviewCount: 892,
        distance: '220m',
        priceRange: '8천원-1.5만원',
        location: '명동',
        specialties: ['전복죽', '비빔밥'],
        isOpen: true,
        openHours: '08:00-21:00'
      },
      {
        id: '4',
        name: '투썸플레이스 명동점',
        category: '카페',
        rating: 4.2,
        reviewCount: 756,
        distance: '320m',
        priceRange: '5천원-1만원',
        location: '명동',
        specialties: ['케이크', '샌드위치'],
        isOpen: false,
        openHours: '08:00-23:00'
      },
      {
        id: '5',
        name: '마녀김밥 명동점',
        category: '분식',
        rating: 4.4,
        reviewCount: 1247,
        distance: '180m',
        priceRange: '3천원-8천원',
        location: '명동',
        specialties: ['참치김밥', '떡볶이'],
        isOpen: true,
        openHours: '06:00-24:00'
      },
      {
        id: '6',
        name: '이태원 클라쓰',
        category: '양식',
        rating: 4.5,
        reviewCount: 634,
        distance: '400m',
        priceRange: '2-3만원',
        location: '명동',
        specialties: ['파스타', '스테이크'],
        isOpen: true,
        openHours: '11:00-22:00'
      }
    ]

    // 실제로는 현재 시간 기준으로 영업상태 계산
    return sampleRestaurants.map(restaurant => ({
      ...restaurant,
      isOpen: Math.random() > 0.3 // 70% 확률로 영업중
    }))
  }

  // 맛집 데이터 로드
  const loadRestaurantData = async () => {
    if (isPreviewOnly) {
      // 프리뷰용 샘플 데이터
      setRestaurantData({
        nearbyRestaurants: generateSampleRestaurants().slice(0, 3),
        userLocation: '명동역 1번 출구',
        lastUpdated: new Date().toISOString()
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 실제로는 여기서 위치 권한 요청 후 Naver Local API 호출
      // 현재는 시뮬레이션 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 1000)) // 로딩 시뮬레이션
      
      setRestaurantData({
        nearbyRestaurants: generateSampleRestaurants(),
        userLocation: '현재 위치 기준',
        lastUpdated: new Date().toISOString()
      })
    } catch (err) {
      setError('Failed to load restaurant data')
      console.error('Restaurant data error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRestaurantData()
  }, [isPreviewOnly, loadRestaurantData])

  // 카테고리 필터링
  const filteredRestaurants = selectedCategory === 'all' 
    ? restaurantData.nearbyRestaurants
    : restaurantData.nearbyRestaurants.filter(r => r.category === selectedCategory)

  // 표시할 맛집 (메인에서는 3개, 확장시 전체)
  const displayedRestaurants = isPreviewOnly ? filteredRestaurants.slice(0, 3) : filteredRestaurants

  const categories = ['all', '한식', '카페', '분식', '양식', '중식', '일식']

  if (loading) {
    return (
      <div className="text-gray-400">
        <div className="animate-pulse">Loading restaurants...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        <p>{error}</p>
        <button 
          onClick={loadRestaurantData}
          className="text-blue-400 hover:text-blue-300 underline mt-1"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 카테고리 필터 (프리뷰가 아닐 때만) */}
      {!isPreviewOnly && (
        <div className="flex gap-1 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? '전체' : category}
            </button>
          ))}
        </div>
      )}

      {/* 맛집 리스트 */}
      <div className="space-y-1">
        {displayedRestaurants.map((restaurant) => (
          <div key={restaurant.id} className="space-y-1 p-2 bg-gray-800 rounded">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-medium truncate flex-1">
                {restaurant.name}
              </span>
              <span className={`text-xs px-1 rounded ${
                restaurant.isOpen ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                {restaurant.isOpen ? '열림' : '닫힘'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{restaurant.category} • {restaurant.distance}</span>
              <div className="flex items-center gap-1">
                <span className="text-white">{restaurant.rating}</span>
                <span className="text-gray-400">({restaurant.reviewCount})</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 더보기 버튼 (프리뷰일 때만) */}
      {isPreviewOnly && restaurantData.nearbyRestaurants.length > 3 && (
        <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 border border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
          🍽️ View More Restaurants ({restaurantData.nearbyRestaurants.length})
        </button>
      )}

      {/* 위치 정보 */}
      <div className="text-xs text-gray-400 text-center">
        📍 {restaurantData.userLocation} • {new Date(restaurantData.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  )
}