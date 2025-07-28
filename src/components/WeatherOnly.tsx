'use client'

import { useState, useEffect, useCallback } from 'react'

interface WeatherData {
  location: {
    city: string
    country: string
    lat: number
    lon: number
  }
  weather: {
    current: number
    min: number
    max: number
    morning: number
    afternoon: number
    evening: number
    description: string
    icon: string
  }
  lastUpdated: number
  debug?: {
    today: string
    morningTime: string
    afternoonTime: string
    eveningTime: string
  }
}

interface CachedWeatherData extends WeatherData {
  cacheTime: number
}

const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6시간

export default function WeatherOnly() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 로컬스토리지에서 캐시된 데이터 가져오기
  const getCachedWeatherData = (lat: number, lon: number): CachedWeatherData | null => {
    try {
      const cached = localStorage.getItem(`weather_${lat.toFixed(2)}_${lon.toFixed(2)}`)
      if (cached) {
        const data: CachedWeatherData = JSON.parse(cached)
        if (Date.now() - data.cacheTime < CACHE_DURATION) {
          return data
        }
      }
    } catch (error) {
      console.error('캐시 데이터 읽기 실패:', error)
    }
    return null
  }

  // 날씨 데이터를 로컬스토리지에 캐시
  const setCachedWeatherData = (data: WeatherData) => {
    try {
      const cachedData: CachedWeatherData = {
        ...data,
        cacheTime: Date.now()
      }
      localStorage.setItem(
        `weather_${data.location.lat.toFixed(2)}_${data.location.lon.toFixed(2)}`,
        JSON.stringify(cachedData)
      )
    } catch (error) {
      console.error('캐시 데이터 저장 실패:', error)
    }
  }

  // 내부 API 호출 (보안 강화)
  const fetchWeatherData = async (): Promise<WeatherData> => {
    const response = await fetch('/api/weather?city=Seoul')

    if (!response.ok) {
      throw new Error(`날씨 데이터를 가져올 수 없습니다: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      location: {
        city: data.location,
        country: 'KR',
        lat: 37.5665,
        lon: 126.9780
      },
      weather: {
        current: data.temperature,
        min: Math.min(data.morning, data.afternoon, data.evening),
        max: Math.max(data.morning, data.afternoon, data.evening),
        morning: data.morning,        // 실제 아침 8시 예보
        afternoon: data.afternoon,    // 실제 오후 1시 예보
        evening: data.evening,        // 실제 오후 7시 예보
        description: data.description,
        icon: data.icon
      },
      lastUpdated: Date.now(),
      debug: data.debug // 디버깅 정보 포함
    }
  }


  // 날씨 데이터 로드 (단순화 - 서울 고정)
  const loadWeatherData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 서울 기준 캐시된 데이터 확인
      const cachedData = getCachedWeatherData(37.5665, 126.9780)
      if (cachedData) {
        setWeatherData(cachedData)
        setLoading(false)
        return
      }
      
      // API 호출
      const weatherData = await fetchWeatherData()
      console.log('Weather Debug:', weatherData.debug) // 디버깅 정보 출력
      setWeatherData(weatherData)
      setCachedWeatherData(weatherData)
      
    } catch (error) {
      console.error('날씨 데이터 로드 실패:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
      
      // 기본값 설정 (실제 예보 형식)
      setWeatherData({
        location: { city: 'Seoul', country: 'KR', lat: 37.5665, lon: 126.9780 },
        weather: { current: 8, min: 6, max: 12, morning: 6, afternoon: 12, evening: 7, description: '맑음', icon: '01d' },
        lastUpdated: Date.now(),
        debug: {
          today: new Date().toISOString().split('T')[0],
          morningTime: 'fallback 08:00:00',
          afternoonTime: 'fallback 13:00:00',
          eveningTime: 'fallback 19:00:00'
        }
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWeatherData()
    
    // 6시간마다 날씨 데이터 새로고침
    const weatherInterval = setInterval(loadWeatherData, 6 * 60 * 60 * 1000)

    return () => clearInterval(weatherInterval)
  }, [loadWeatherData])

  return (
    <div className="flex items-center gap-1">
      {loading ? (
        <span className="text-gray-500 text-sm">로딩</span>
      ) : error ? (
        <span className="text-red-400 text-sm">오류</span>
      ) : (
        <div className="flex items-center gap-1 text-sm">
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            <circle cx="12" cy="12" r="5"/>
          </svg>
          <span>{weatherData?.weather.morning}°</span>
          <span className="text-gray-500">|</span>
          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            <circle cx="12" cy="12" r="5"/>
          </svg>
          <span>{weatherData?.weather.afternoon}°</span>
          <span className="text-gray-500">|</span>
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span>{weatherData?.weather.evening}°</span>
        </div>
      )}
    </div>
  )
}