'use client'

import { useState, useEffect } from 'react'

interface ConversionHistory {
  id: string
  fromValue: number
  toValue: number
  fromUnit: string
  toUnit: string
  category: string
  timestamp: string
}

interface FavoriteConversion {
  id: string
  name: string
  fromUnit: string
  toUnit: string
  category: string
}

export default function UnitConverterFunction() {
  const [history, setHistory] = useState<ConversionHistory[]>([])
  const [favorites, setFavorites] = useState<FavoriteConversion[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('miniFunction_unitHistory')
    const savedFavorites = localStorage.getItem('miniFunction_unitFavorites')
    
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const getRecentConversions = () => {
    return history.slice(0, 5)
  }

  const getMostUsedCategory = () => {
    if (history.length === 0) return null
    
    const categoryCount: { [key: string]: number } = {}
    history.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
    })
    
    return Object.entries(categoryCount).reduce((a, b) => 
      categoryCount[a[0]] > categoryCount[b[0]] ? a : b
    )[0]
  }

  const getTodayConversions = () => {
    const today = new Date().toISOString().split('T')[0]
    return history.filter(item => 
      item.timestamp.split('T')[0] === today
    ).length
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '길이': return '📏'
      case '무게': return '⚖️'
      case '온도': return '🌡️'
      case '부피': return '🥤'
      case '면적': return '⬜'
      case '시간': return '⏱️'
      case '속도': return '🚗'
      case '압력': return '💨'
      default: return '🔄'
    }
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M'
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'K'
    } else if (value < 0.01 && value > 0) {
      return value.toExponential(2)
    } else {
      return value.toFixed(value % 1 === 0 ? 0 : 2)
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return past.toLocaleDateString()
  }

  const recentConversions = getRecentConversions()
  const mostUsedCategory = getMostUsedCategory()
  const todayCount = getTodayConversions()

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">변환 현황</div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-gray-400">오늘 변환: </span>
            <span className="text-white font-medium">{todayCount}회</span>
          </div>
          <div>
            <span className="text-gray-400">즐겨찾기: </span>
            <span className="text-white font-medium">{favorites.length}개</span>
          </div>
          <div>
            <span className="text-gray-400">총 변환: </span>
            <span className="text-white font-medium">{history.length}회</span>
          </div>
        </div>
      </div>

      {/* Most Used Category */}
      {mostUsedCategory && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getCategoryIcon(mostUsedCategory)}</span>
            <span className="text-sm text-blue-400">가장 많이 사용</span>
          </div>
          <div className="text-sm font-medium text-white">{mostUsedCategory} 변환</div>
        </div>
      )}

      {/* Settings Info */}
      <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3">
        <div className="text-sm text-purple-400 mb-1">단위 변환기 설정</div>
        <div className="text-xs text-gray-300">
          톱니바퀴 → Mini Function Control에서 자주 사용하는 변환을 즐겨찾기에 추가할 수 있습니다.
        </div>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <div className="text-sm font-medium text-white mb-2">즐겨찾기 변환</div>
          <div className="space-y-2">
            {favorites.slice(0, 3).map(fav => (
              <div key={fav.id} className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(fav.category)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {fav.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {fav.fromUnit} → {fav.toUnit}
                    </div>
                  </div>
                  <span className="text-xs text-yellow-400">⭐</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Conversions */}
      {recentConversions.length > 0 && (
        <div>
          <div className="text-sm font-medium text-white mb-2">최근 변환</div>
          <div className="space-y-2">
            {recentConversions.map(conversion => (
              <div key={conversion.id} className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(conversion.category)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {formatValue(conversion.fromValue)} {conversion.fromUnit} = {formatValue(conversion.toValue)} {conversion.toUnit}
                    </div>
                    <div className="text-xs text-gray-400">
                      {conversion.category} • {getTimeAgo(conversion.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Conversions */}
      <div>
        <div className="text-sm font-medium text-white mb-2">빠른 변환</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400 mb-1">길이</div>
            <div className="text-sm text-white">1m = 3.28ft</div>
          </div>
          <div className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400 mb-1">온도</div>
            <div className="text-sm text-white">20°C = 68°F</div>
          </div>
          <div className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400 mb-1">무게</div>
            <div className="text-sm text-white">1kg = 2.2lb</div>
          </div>
          <div className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400 mb-1">부피</div>
            <div className="text-sm text-white">1L = 0.26gal</div>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
        <div className="text-sm text-green-400 mb-2">사용 통계</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">이번 주 변환: </span>
            <span className="text-white font-medium">
              {history.filter(h => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(h.timestamp) >= weekAgo
              }).length}회
            </span>
          </div>
          <div>
            <span className="text-gray-400">평균 일일 변환: </span>
            <span className="text-white font-medium">
              {history.length > 0 ? Math.round(history.length / Math.max(1, Math.ceil((Date.now() - new Date(history[0]?.timestamp).getTime()) / (1000 * 60 * 60 * 24)))) : 0}회
            </span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {history.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          아직 변환 기록이 없습니다
        </div>
      )}
    </div>
  )
}