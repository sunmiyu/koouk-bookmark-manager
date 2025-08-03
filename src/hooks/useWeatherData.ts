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
  hourlyData?: {
    time: string
    temperature: number
    hour: number
    condition?: string
  }[]
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

export function useWeatherData() {
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

  // 사용자 위치 가져오기
  const getUserLocation = (): Promise<{lat: number, lon: number, city?: string}> => {
    return new Promise((resolve) => {
      // 캐시된 위치 확인 (1시간)
      const cached = localStorage.getItem('user_geo_location')
      if (cached) {
        try {
          const data = JSON.parse(cached)
          if (Date.now() - data.timestamp < 60 * 60 * 1000) { // 1시간 캐시
            resolve(data.location)
            return
          }
        } catch (error) {
          console.error('캐시된 위치 데이터 오류:', error)
        }
      }

      if (!navigator.geolocation) {
        // 브라우저가 지원하지 않으면 서울로 기본값
        resolve({ lat: 37.5665, lon: 126.9780, city: 'Seoul' })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }
          
          // 위치 캐시
          localStorage.setItem('user_geo_location', JSON.stringify({
            location,
            timestamp: Date.now()
          }))
          
          resolve(location)
        },
        (error) => {
          console.warn('위치 정보 가져오기 실패:', error.message)
          // GPS 실패시 서울로 기본값
          resolve({ lat: 37.5665, lon: 126.9780, city: 'Seoul' })
        },
        {
          timeout: 10000,
          maximumAge: 3600000, // 1시간
          enableHighAccuracy: false
        }
      )
    })
  }

  // 내부 API 호출 (사용자 위치 기반)
  const fetchWeatherData = useCallback(async (): Promise<WeatherData> => {
    const userLocation = await getUserLocation()
    
    let apiUrl = '/api/weather'
    if (userLocation.city) {
      apiUrl += `?city=${encodeURIComponent(userLocation.city)}`
    } else {
      apiUrl += `?lat=${userLocation.lat}&lon=${userLocation.lon}`
    }

    console.log('🔗 Weather API URL:', apiUrl)
    console.log('📍 User location:', userLocation)

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`날씨 데이터를 가져올 수 없습니다: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      location: {
        city: data.location,
        country: 'KR',
        lat: userLocation.lat,
        lon: userLocation.lon
      },
      weather: {
        current: data.temperature,
        min: Math.min(data.morning, data.afternoon, data.evening),
        max: Math.max(data.morning, data.afternoon, data.evening),
        morning: data.morning,
        afternoon: data.afternoon,
        evening: data.evening,
        description: data.description,
        icon: data.icon
      },
      hourlyData: data.hourlyData,
      lastUpdated: Date.now(),
      debug: data.debug
    }
  }, [])

  // 날씨 데이터 로드 (사용자 위치 기반)  
  const loadWeatherData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 사용자 위치 가져오기
      const userLocation = await getUserLocation()
      
      // 사용자 위치 기준 캐시된 데이터 확인
      const cachedData = getCachedWeatherData(userLocation.lat, userLocation.lon)
      if (cachedData) {
        setWeatherData(cachedData)
        setLoading(false)
        return
      }
      
      // API 호출
      const weatherData = await fetchWeatherData()
      console.log('Weather Debug:', weatherData.debug)
      console.log('Hourly Data:', weatherData.hourlyData)
      setWeatherData(weatherData)
      setCachedWeatherData(weatherData)
      
    } catch (error) {
      console.error('날씨 데이터 로드 실패:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
      
      // 기본값 설정
      setWeatherData({
        location: { city: 'Seoul', country: 'KR', lat: 37.5665, lon: 126.9780 },
        weather: { current: 8, min: 6, max: 12, morning: 6, afternoon: 12, evening: 7, description: '맑음', icon: '01d' },
        hourlyData: [],
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
  }, [fetchWeatherData])

  useEffect(() => {
    loadWeatherData()
    
    // 6시간마다 날씨 데이터 새로고침
    const weatherInterval = setInterval(loadWeatherData, 6 * 60 * 60 * 1000)

    return () => clearInterval(weatherInterval)
  }, [loadWeatherData])

  return { weatherData, loading, error, refetch: loadWeatherData }
}