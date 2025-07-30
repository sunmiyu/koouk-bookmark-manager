'use client'

import { useState, useEffect, useCallback } from 'react'
import { CommuteRoute, CommuteData } from '@/types/miniFunctions'
import { commuteService } from '@/lib/supabase-services'
import { useAuth } from '@/contexts/AuthContext'

interface CommuteTimeProps {
  isPreviewOnly?: boolean
  onTrafficStatusChange?: (status: { color: string; text: string }) => void
}

export default function CommuteTime({ isPreviewOnly = false, onTrafficStatusChange }: CommuteTimeProps) {
  const { user } = useAuth()
  const [commuteData, setCommuteData] = useState<CommuteData>({
    routes: [],
    lastUpdated: ''
  })
  const [loading, setLoading] = useState(false) // Disabled for debugging
  const [error, setError] = useState<string | null>(null)
  const [isAddingRoute, setIsAddingRoute] = useState(false)
  const [newRoute, setNewRoute] = useState({
    name: '',
    origin: '',
    destination: ''
  })


  // Kakao Mobility API 사용 (무료 30만건/일)
  const fetchCommuteTime = async () => {
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

  // Supabase에서 경로 로드
  const loadRoutes = async (): Promise<CommuteRoute[]> => {
    try {
      if (!user) {
        // Fallback to localStorage
        const saved = localStorage.getItem('koouk_commute_routes')
        if (saved) {
          return JSON.parse(saved) as CommuteRoute[]
        }
        return []
      }

      const dbRoutes = await commuteService.getAll(user.id)
      return dbRoutes.map(route => ({
        id: route.id,
        name: route.name,
        origin: route.origin,
        destination: route.destination,
        duration: route.duration || 0,
        distance: route.distance || 0,
        trafficDuration: route.duration || 0, // Will be updated
        lastUpdated: route.updated_at
      }))
    } catch (error) {
      console.error('Failed to load routes:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem('koouk_commute_routes')
      if (saved) {
        return JSON.parse(saved) as CommuteRoute[]
      }
      return []
    }
  }

  // Supabase에 경로 저장
  const saveRoutes = async (routes: CommuteRoute[]) => {
    try {
      if (user) {
        // For simplicity, we won't sync all routes here
        // Routes are saved individually when created/updated
      }
      
      // Always save to localStorage as backup
      localStorage.setItem('koouk_commute_routes', JSON.stringify(routes))
    } catch (error) {
      console.error('Failed to save routes:', error)
      localStorage.setItem('koouk_commute_routes', JSON.stringify(routes))
    }
  }

  // 출퇴근 데이터 로드
  const loadCommuteData = useCallback(async () => {
    console.log('CommuteTime: loadCommuteData 시작', { isPreviewOnly })
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

      // 한국이 아니면 에러 처리 (테스트를 위해 임시로 true로 설정)
      // const locationIsKorea = await checkLocation()
      const locationIsKorea = true
      if (!locationIsKorea) {
        setError('Service is only available in Korea')
        console.log('CommuteTime: 한국이 아님')
        setLoading(false)
        return
      }

      const savedRoutes = await loadRoutes()
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
        savedRoutes.map(async (route: CommuteRoute) => {
          try {
            const trafficData = await fetchCommuteTime()
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
      console.log('CommuteTime: 로딩 완료')
      setLoading(false)
    }
  }, [isPreviewOnly])

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
      const trafficData = await fetchCommuteTime()
      
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
    } catch {
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
    let isMounted = true
    
    const initData = async () => {
      if (isMounted) {
        await loadCommuteData()
      }
    }
    
    initData()
    
    // 10분마다 교통상황 업데이트
    if (!isPreviewOnly && isMounted) {
      const interval = setInterval(() => {
        if (isMounted) {
          loadCommuteData()
        }
      }, 10 * 60 * 1000)
      return () => {
        isMounted = false
        clearInterval(interval)
      }
    }
    
    return () => {
      isMounted = false
    }
    // loadCommuteData는 useCallback으로 안정화되었지만 무한루프 방지를 위해 의존성에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [isPreviewOnly, user])

  // Notify parent component about traffic status changes
  useEffect(() => {
    if (onTrafficStatusChange) {
      const status = getTrafficStatus()
      onTrafficStatusChange(status)
    }
    // getTrafficStatus는 commuteData에만 의존하므로 의존성에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commuteData, onTrafficStatusChange])

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


  if (error && error !== 'Service is only available in Korea') {
    return (
      <div className="text-red-400 text-sm">
        <p>{error}</p>
        <button 
          onClick={loadCommuteData}
          className="text-blue-400 hover:text-blue-300 underline mt-1 cursor-pointer"
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
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded cursor-pointer"
            >
              {isAddingRoute ? '추가중...' : '경로 추가'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Get traffic status for summary display
  const getTrafficStatus = () => {
    if (commuteData.routes.length === 0) return { color: 'green', text: '교통 원활' }
    
    const avgDelay = commuteData.routes.reduce((sum, route) => {
      const delay = route.trafficDuration - route.duration
      return sum + Math.max(delay, 0)
    }, 0) / commuteData.routes.length

    if (avgDelay > 15) return { color: 'red', text: '교통 혼잡' }
    if (avgDelay > 5) return { color: 'yellow', text: '교통 지체' }
    return { color: 'green', text: '교통 원활' }
  }

  if (isPreviewOnly) {
    // Preview mode: return empty for body, traffic status will be in header
    return null
  }

  return (
    <div className="space-y-2">
      {commuteData.routes.map((route) => (
        <div key={route.id} className="bg-gray-800 rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-white text-sm truncate pr-2 flex-1">{route.name}</div>
            <button
              onClick={() => removeRoute(route.id)}
              className="text-red-400 hover:text-red-300 text-sm flex-shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-300 font-medium">평소 시간</span>
              <span className="text-white font-semibold">{formatDuration(route.duration)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-300 font-medium">현재 교통</span>
              <span className={`font-semibold ${route.trafficDuration > route.duration ? 'text-orange-400' : 'text-green-400'}`}>
                {formatDuration(route.trafficDuration)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-300 font-medium">거리</span>
              <span className="text-white font-semibold">{formatDistance(route.distance)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              집 (비스타2차) → 회사 (대구 중구 대방동)
            </div>
          </div>

          {route.trafficDuration > route.duration && (
            <div className="mt-2 text-sm text-orange-400">
              ⚠️ 평소보다 {formatDuration(route.trafficDuration - route.duration)} 더 걸려요
            </div>
          )}
        </div>
      ))}

      {!isPreviewOnly && commuteData.routes.length < 5 && (
        <div className="bg-gray-800 rounded-lg p-2">
          <div className="text-sm font-medium text-white mb-2">새 경로 추가</div>
          <div className="space-y-2 max-w-full">
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
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded cursor-pointer"
            >
              {isAddingRoute ? '추가중...' : '추가'}
            </button>
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {commuteData.routes.length}/5 경로
          </div>
        </div>
      )}

      <div className="text-sm text-gray-400 text-center">
        마지막 업데이트: {new Date(commuteData.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  )
}