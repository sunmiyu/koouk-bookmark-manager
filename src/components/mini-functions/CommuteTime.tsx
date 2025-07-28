'use client'

import { useState, useEffect } from 'react'
import { CommuteRoute, CommuteData } from '@/types/miniFunctions'
import { detectUserLocation, getCachedLocation, setCachedLocation } from '@/lib/geolocation'

interface CommuteTimeProps {
  isPreviewOnly?: boolean
}

export default function CommuteTime({ isPreviewOnly = false }: CommuteTimeProps) {
  const [commuteData, setCommuteData] = useState<CommuteData>({
    routes: [],
    lastUpdated: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isKorea, setIsKorea] = useState<boolean | null>(null)
  const [isAddingRoute, setIsAddingRoute] = useState(false)
  const [newRoute, setNewRoute] = useState({
    name: '',
    origin: '',
    destination: ''
  })

  // 지역 감지
  const checkLocation = async () => {
    try {
      // 캐시된 위치 정보 확인
      const cached = getCachedLocation()
      if (cached) {
        setIsKorea(cached.isKorea)
        return cached.isKorea
      }

      // 새로 위치 감지
      const location = await detectUserLocation()
      setIsKorea(location.isKorea)
      setCachedLocation(location)
      return location.isKorea
    } catch (error) {
      console.error('Location check failed:', error)
      setIsKorea(false)
      return false
    }
  }

  // Kakao Mobility API 사용 (무료 30만건/일)
  const fetchCommuteTime = async (origin: string, destination: string) => {
    try {
      // 실제 구현에서는 백엔드를 통해 API 호출해야 함 (API 키 보안)
      // 여기서는 시뮬레이션 데이터 사용
      const mockDuration = Math.floor(Math.random() * 60) + 15 // 15-75분
      const mockTrafficDuration = mockDuration + Math.floor(Math.random() * 20) - 10 // 교통상황 반영
      const mockDistance = Math.floor(Math.random() * 20000) + 5000 // 5-25km

      return {
        duration: mockDuration,
        trafficDuration: Math.max(mockTrafficDuration, 5),
        distance: mockDistance
      }
    } catch (error) {
      console.error('Commute API error:', error)
      throw error
    }
  }

  // localStorage에서 경로 로드
  const loadRoutes = () => {
    try {
      const saved = localStorage.getItem('koouk_commute_routes')
      if (saved) {
        return JSON.parse(saved)
      }
      return []
    } catch {
      return []
    }
  }

  // localStorage에 경로 저장
  const saveRoutes = (routes: CommuteRoute[]) => {
    localStorage.setItem('koouk_commute_routes', JSON.stringify(routes))
  }

  // 출퇴근 데이터 로드
  const loadCommuteData = async () => {
    if (isPreviewOnly) {
      // 프리뷰용 샘플 데이터
      setCommuteData({
        routes: [
          {
            id: '1',
            name: '집 → 회사',
            origin: '서울특별시 강남구 역삼동',
            destination: '서울특별시 중구 명동',
            duration: 35,
            distance: 12500,
            trafficDuration: 42,
            lastUpdated: new Date().toISOString()
          },
          {
            id: '2',
            name: '회사 → 집',
            origin: '서울특별시 중구 명동',
            destination: '서울특별시 강남구 역삼동',
            duration: 38,
            distance: 12800,
            trafficDuration: 45,
            lastUpdated: new Date().toISOString()
          }
        ],
        currentRoute: undefined,
        lastUpdated: new Date().toISOString()
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 한국이 아니면 에러 처리
      const locationIsKorea = await checkLocation()
      if (!locationIsKorea) {
        setError('Service is only available in Korea')
        setLoading(false)
        return
      }

      const savedRoutes = loadRoutes()
      if (savedRoutes.length === 0) {
        setCommuteData({
          routes: [],
          lastUpdated: new Date().toISOString()
        })
        setLoading(false)
        return
      }

      // 저장된 경로들의 교통 상황 업데이트
      const updatedRoutes = await Promise.all(
        savedRoutes.map(async (route: any) => {
          try {
            const trafficData = await fetchCommuteTime(route.origin, route.destination)
            return {
              ...route,
              trafficDuration: trafficData.trafficDuration,
              lastUpdated: new Date().toISOString()
            }
          } catch {
            return route
          }
        })
      )

      setCommuteData({
        routes: updatedRoutes,
        lastUpdated: new Date().toISOString()
      })

    } catch (err) {
      setError('Failed to load commute data')
      console.error('Commute data error:', err)
    } finally {
      setLoading(false)
    }
  }

  // 새 경로 추가
  const addRoute = async () => {
    if (!newRoute.name.trim() || !newRoute.origin.trim() || !newRoute.destination.trim()) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    if (commuteData.routes.length >= 5) {
      alert('최대 5개의 경로만 등록할 수 있습니다.')
      return
    }

    try {
      setIsAddingRoute(true)
      const trafficData = await fetchCommuteTime(newRoute.origin, newRoute.destination)
      
      const route: CommuteRoute = {
        id: Date.now().toString(),
        name: newRoute.name,
        origin: newRoute.origin,
        destination: newRoute.destination,
        duration: trafficData.duration,
        distance: trafficData.distance,
        trafficDuration: trafficData.trafficDuration,
        lastUpdated: new Date().toISOString()
      }

      const updatedRoutes = [...commuteData.routes, route]
      setCommuteData({
        routes: updatedRoutes,
        lastUpdated: new Date().toISOString()
      })

      saveRoutes(updatedRoutes)
      setNewRoute({ name: '', origin: '', destination: '' })
    } catch (err) {
      alert('경로 추가에 실패했습니다. 주소를 확인해주세요.')
    } finally {
      setIsAddingRoute(false)
    }
  }

  // 경로 삭제
  const removeRoute = (id: string) => {
    const updatedRoutes = commuteData.routes.filter(r => r.id !== id)
    setCommuteData({
      routes: updatedRoutes,
      lastUpdated: new Date().toISOString()
    })
    saveRoutes(updatedRoutes)
  }

  useEffect(() => {
    loadCommuteData()
    
    // 10분마다 교통상황 업데이트
    if (!isPreviewOnly) {
      const interval = setInterval(loadCommuteData, 10 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isPreviewOnly])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}분`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}시간 ${mins}분`
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  if (loading) {
    return (
      <div className="text-gray-400">
        <div className="animate-pulse">Loading commute data...</div>
      </div>
    )
  }

  // 한국이 아닌 경우
  if (isKorea === false) {
    return (
      <div className="text-center py-4">
        <div className="text-gray-400 mb-2">🚧</div>
        <div className="text-sm text-gray-400 mb-1">서비스 준비중</div>
        <div className="text-xs text-gray-500">한국 지역에서만 이용 가능합니다</div>
      </div>
    )
  }

  if (error && error !== 'Service is only available in Korea') {
    return (
      <div className="text-red-400 text-sm">
        <p>{error}</p>
        <button 
          onClick={loadCommuteData}
          className="text-blue-400 hover:text-blue-300 underline mt-1"
        >
          재시도
        </button>
      </div>
    )
  }

  if (commuteData.routes.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-gray-400 mb-2">🚗</div>
        <div className="text-sm text-gray-400 mb-2">등록된 경로가 없습니다</div>
        {!isPreviewOnly && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="경로명 (예: 집→회사)"
              value={newRoute.name}
              onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            />
            <input
              type="text"
              placeholder="출발지"
              value={newRoute.origin}
              onChange={(e) => setNewRoute({...newRoute, origin: e.target.value})}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            />
            <input
              type="text"
              placeholder="목적지"
              value={newRoute.destination}
              onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            />
            <button
              onClick={addRoute}
              disabled={isAddingRoute}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded"
            >
              {isAddingRoute ? '추가중...' : '경로 추가'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {commuteData.routes.map((route) => (
        <div key={route.id} className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-white text-sm">{route.name}</div>
            {!isPreviewOnly && (
              <button
                onClick={() => removeRoute(route.id)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="space-y-1 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>평소 시간:</span>
              <span>{formatDuration(route.duration)}</span>
            </div>
            <div className="flex justify-between">
              <span>현재 교통:</span>
              <span className={route.trafficDuration > route.duration ? 'text-orange-400' : 'text-green-400'}>
                {formatDuration(route.trafficDuration)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>거리:</span>
              <span>{formatDistance(route.distance)}</span>
            </div>
          </div>

          {route.trafficDuration > route.duration && (
            <div className="mt-2 text-xs text-orange-400">
              ⚠️ 평소보다 {formatDuration(route.trafficDuration - route.duration)} 더 걸려요
            </div>
          )}
        </div>
      ))}

      {!isPreviewOnly && commuteData.routes.length < 5 && (
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm font-medium text-white mb-2">새 경로 추가</div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="경로명 (예: 집→회사)"
              value={newRoute.name}
              onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
            <input
              type="text"
              placeholder="출발지"
              value={newRoute.origin}
              onChange={(e) => setNewRoute({...newRoute, origin: e.target.value})}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
            <input
              type="text"
              placeholder="목적지"
              value={newRoute.destination}
              onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
            <button
              onClick={addRoute}
              disabled={isAddingRoute}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded"
            >
              {isAddingRoute ? '추가중...' : '추가'}
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {commuteData.routes.length}/5 경로
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 text-center">
        마지막 업데이트: {new Date(commuteData.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  )
}