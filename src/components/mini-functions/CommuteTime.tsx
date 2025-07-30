'use client'

import { useState, useEffect, useMemo } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddingRoute, setIsAddingRoute] = useState(false)
  const [newRoute, setNewRoute] = useState({
    name: '',
    origin: '',
    destination: ''
  })

  // Memoized preview data to prevent recreations
  const previewData = useMemo(() => ({
    routes: [
      {
        id: '1',
        name: '집 → 회사',
        origin: '강남구',
        destination: '서초구',
        duration: 35,
        distance: 12000,
        trafficDuration: 45,
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        name: '회사 → 집',
        origin: '서초구',
        destination: '강남구',
        duration: 40,
        distance: 12500,
        trafficDuration: 55,
        lastUpdated: new Date().toISOString()
      }
    ],
    lastUpdated: new Date().toISOString()
  }), [])

  // Stable functions
  const fetchCommuteTime = async () => {
    // Mock traffic API response
    return {
      duration: Math.floor(Math.random() * 30) + 20,
      distance: Math.floor(Math.random() * 5000) + 8000,
      trafficDuration: Math.floor(Math.random() * 50) + 25
    }
  }

  const checkLocation = async () => {
    // Mock location check - always return true for Korea
    return true
  }

  const loadRoutes = async (): Promise<CommuteRoute[]> => {
    try {
      const saved = localStorage.getItem('koouk_commute_routes')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  const saveRoutes = (routes: CommuteRoute[]) => {
    localStorage.setItem('koouk_commute_routes', JSON.stringify(routes))
  }

  const getTrafficStatus = () => {
    if (commuteData.routes.length === 0) {
      return { color: 'gray', text: '데이터 없음' }
    }

    const avgDelay = commuteData.routes.reduce((acc, route) => {
      const delay = ((route.trafficDuration - route.duration) / route.duration) * 100
      return acc + delay
    }, 0) / commuteData.routes.length

    if (avgDelay < 10) return { color: 'green', text: '원활' }
    if (avgDelay < 30) return { color: 'yellow', text: '보통' }
    return { color: 'red', text: '지연' }
  }

  // Main data loading function - simplified and stable
  const loadCommuteData = async () => {
    console.log('CommuteTime: loadCommuteData 시작', { isPreviewOnly })
    
    if (isPreviewOnly) {
      setCommuteData(previewData)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const locationIsKorea = await checkLocation()
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

      // Update traffic data for saved routes
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
  }

  // Add new route
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
      alert('경로 추가에 실패했습니다.')
    } finally {
      setIsAddingRoute(false)
    }
  }

  // Remove route
  const removeRoute = (id: string) => {
    const updatedRoutes = commuteData.routes.filter(r => r.id !== id)
    setCommuteData({
      routes: updatedRoutes,
      lastUpdated: new Date().toISOString()
    })
    saveRoutes(updatedRoutes)
  }

  // Effects with proper dependencies
  useEffect(() => {
    let isMounted = true
    
    const initData = async () => {
      if (isMounted) {
        await loadCommuteData()
      }
    }
    
    initData()
    
    // Auto-refresh every 10 minutes if not preview
    if (!isPreviewOnly) {
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
  }, [isPreviewOnly, user?.id])

  // Notify parent about traffic status
  useEffect(() => {
    if (onTrafficStatusChange) {
      const status = getTrafficStatus()
      onTrafficStatusChange(status)
    }
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

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        <p>{error}</p>
        <button 
          onClick={loadCommuteData}
          className="text-blue-400 hover:text-blue-300 underline mt-1 cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {commuteData.routes.length === 0 ? (
        <div className="text-gray-400 text-center py-4">
          <p className="text-sm">등록된 경로가 없습니다.</p>
          {!isPreviewOnly && (
            <p className="text-xs mt-1">아래에서 새 경로를 추가해보세요.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {commuteData.routes.map((route) => (
            <div key={route.id} className="bg-gray-800 rounded-lg p-3 group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-medium text-sm">{route.name}</h4>
                {!isPreviewOnly && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => {/* Edit functionality */}}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm"
                      title="Edit route"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => removeRoute(route.id)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm"
                      title="Delete route"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>{route.origin} → {route.destination}</div>
                <div className="flex justify-between">
                  <span>평소: {formatDuration(route.duration)}</span>
                  <span>거리: {formatDistance(route.distance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${
                    route.trafficDuration > route.duration * 1.2 ? 'text-red-400' :
                    route.trafficDuration > route.duration * 1.1 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    현재: {formatDuration(route.trafficDuration)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(route.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isPreviewOnly && commuteData.routes.length < 5 && (
        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-white font-medium text-sm mb-3">새 경로 추가</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="경로 이름 (예: 집 → 회사)"
              value={newRoute.name}
              onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="출발지"
                value={newRoute.origin}
                onChange={(e) => setNewRoute(prev => ({ ...prev, origin: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="도착지"
                value={newRoute.destination}
                onChange={(e) => setNewRoute(prev => ({ ...prev, destination: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={addRoute}
              disabled={isAddingRoute}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              {isAddingRoute ? '추가 중...' : '경로 추가'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}