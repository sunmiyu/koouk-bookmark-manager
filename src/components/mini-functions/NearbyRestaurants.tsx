'use client'

import React from 'react'

interface Restaurant {
  id: string
  name: string
  category: string
  distance: string
  rating: number
  reviewCount: number
  isOpen: boolean
}

interface NearbyRestaurantsProps {
  isPreviewOnly?: boolean
}

export default function NearbyRestaurants({ isPreviewOnly = false }: NearbyRestaurantsProps) {
  // 샘플 식당 데이터 (거리순 정렬)
  const restaurants: Restaurant[] = [
    {
      id: '3',
      name: '홍콩반점0410 강남점',
      category: '중식',
      distance: '320m',
      rating: 4.2,
      reviewCount: 1892,
      isOpen: true
    },
    {
      id: '4', 
      name: '맥도날드 강남역점',
      category: '패스트푸드',
      distance: '380m',
      rating: 3.9,
      reviewCount: 3241,
      isOpen: true
    },
    {
      id: '5',
      name: '이삭토스트 강남점',
      category: '패스트푸드', 
      distance: '420m',
      rating: 4.0,
      reviewCount: 567,
      isOpen: false
    }
  ]

  return (
    <div className="space-y-1">
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="flex justify-between items-center py-1 hover:bg-gray-800 rounded px-1 transition-colors">
          <div className="flex-1 truncate">
            <span className="text-sm text-white">
              {restaurant.name} ({restaurant.category}, {restaurant.distance})
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 ml-2">
            <span>{restaurant.rating} ({restaurant.reviewCount})</span>
            <span className={restaurant.isOpen ? 'text-green-400' : 'text-red-400'}>
              {restaurant.isOpen ? '열림' : '닫힘'}
            </span>
          </div>
        </div>
      ))}
      
      {isPreviewOnly && (
        <div className="text-center pt-2">
          <span className="text-gray-500 text-sm">🍽️ Full restaurant info in Pro plan</span>
        </div>
      )}
    </div>
  )
}