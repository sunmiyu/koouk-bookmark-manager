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
}

interface CachedWeatherData extends WeatherData {
  cacheTime: number
}

const CACHE_DURATION = 10 * 60 * 1000 // 10분
const LOCATION_CACHE_DURATION = 60 * 60 * 1000 // 1시간

export default function Weather() {
  const [currentTime, setCurrentTime] = useState('')
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

  // OpenWeatherMap API 호출
  const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    if (!apiKey) {
      throw new Error('Weather API key가 설정되지 않았습니다')
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`
    )

    if (!response.ok) {
      throw new Error(`날씨 데이터를 가져올 수 없습니다: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      location: {
        city: data.name,
        country: data.sys.country,
        lat,
        lon
      },
      weather: {
        current: Math.round(data.main.temp),
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max),
        morning: Math.round(data.main.temp - 2), // 아침 (현재보다 약간 낮게)
        afternoon: Math.round(data.main.temp_max), // 점심 (최고온도)
        evening: Math.round(data.main.temp_min + 1), // 저녁 (최저보다 약간 높게)
        description: data.weather[0].description,
        icon: data.weather[0].icon
      },
      lastUpdated: Date.now()
    }
  }

  // 위치 정보 가져오기
  const getUserLocation = (): Promise<{lat: number, lon: number}> => {
    return new Promise((resolve, reject) => {
      // 캐시된 위치 확인
      const cachedLocation = localStorage.getItem('user_location')
      if (cachedLocation) {
        try {
          const { lat, lon, cacheTime } = JSON.parse(cachedLocation)
          if (Date.now() - cacheTime < LOCATION_CACHE_DURATION) {
            resolve({ lat, lon })
            return
          }
        } catch (error) {
          console.error('캐시된 위치 데이터 파싱 실패:', error)
        }
      }

      if (!navigator.geolocation) {
        reject(new Error('브라우저가 위치 정보를 지원하지 않습니다'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position.coords
          
          // 위치 정보 캐시
          try {
            localStorage.setItem('user_location', JSON.stringify({
              lat, lon, cacheTime: Date.now()
            }))
          } catch (error) {
            console.error('위치 정보 캐시 실패:', error)
          }
          
          resolve({ lat, lon })
        },
        (error) => {
          reject(new Error('위치 정보를 가져올 수 없습니다: ' + error.message))
        },
        {
          timeout: 10000,
          maximumAge: LOCATION_CACHE_DURATION
        }
      )
    })
  }

  // 날씨 데이터 로드
  const loadWeatherData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const location = await getUserLocation()
      
      // 캐시된 데이터 확인
      const cachedData = getCachedWeatherData(location.lat, location.lon)
      if (cachedData) {
        setWeatherData(cachedData)
        setLoading(false)
        return
      }
      
      // API 호출
      const weatherData = await fetchWeatherData(location.lat, location.lon)
      setWeatherData(weatherData)
      setCachedWeatherData(weatherData)
      
    } catch (error) {
      console.error('날씨 데이터 로드 실패:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
      
      // 기본값 설정
      setWeatherData({
        location: { city: 'Seoul', country: 'KR', lat: 37.5665, lon: 126.9780 },
        weather: { current: 8, min: 5, max: 12, morning: 6, afternoon: 12, evening: 7, description: '맑음', icon: '01d' },
        lastUpdated: Date.now()
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      
      // 시간 포맷 (24시간 형식)
      const timeString = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      
      
      setCurrentTime(timeString)
    }

    updateDateTime()
    const timeInterval = setInterval(updateDateTime, 1000)
    
    // 날씨 데이터 로드
    loadWeatherData()
    
    // 30분마다 날씨 데이터 새로고침 (API 호출 최소화)
    const weatherInterval = setInterval(loadWeatherData, 30 * 60 * 1000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(weatherInterval)
    }
  }, [loadWeatherData])

  return (
    <div className="space-y-2">
      {/* 데스크톱: 한 줄로 표시 */}
      <div className="hidden md:flex items-center responsive-gap-md responsive-text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            <circle cx="12" cy="12" r="5"/>
          </svg>
          {loading ? (
            <span className="text-gray-500">로딩...</span>
          ) : error ? (
            <span className="text-red-400">날씨 오류</span>
          ) : (
            <>
              <span className="text-xs text-gray-400">아침</span>
              <span>{weatherData?.weather.morning}°</span>
              <span className="text-gray-500">|</span>
              <span className="text-xs text-gray-400">점심</span>
              <span>{weatherData?.weather.afternoon}°</span>
              <span className="text-gray-500">|</span>
              <span className="text-xs text-gray-400">저녁</span>
              <span>{weatherData?.weather.evening}°</span>
            </>
          )}
        </div>
        
        <span className="text-gray-500">|</span>
        
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <span className="font-mono">{currentTime}</span>
        </div>
      </div>

      {/* 모바일/태블릿: 3개 온도로 표시 */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-3 responsive-text-sm text-gray-300">
          {/* 시간 */}
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span className="font-mono text-xs">{currentTime}</span>
          </div>
          
          <span className="text-gray-500">|</span>
          
          {/* 날씨 - 3개 온도 */}
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              <circle cx="12" cy="12" r="5"/>
            </svg>
            {loading ? (
              <span className="text-gray-500 text-xs">로딩</span>
            ) : error ? (
              <span className="text-red-400 text-xs">오류</span>
            ) : (
              <div className="flex items-center gap-1 text-xs">
                <span>{weatherData?.weather.morning}°</span>
                <span className="text-gray-500">|</span>
                <span>{weatherData?.weather.afternoon}°</span>
                <span className="text-gray-500">|</span>
                <span>{weatherData?.weather.evening}°</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}