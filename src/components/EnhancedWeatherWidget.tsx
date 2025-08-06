'use client'

import { useState, useEffect, useCallback } from 'react'

interface WeatherData {
  temperature: number
  tempMax: number
  tempMin: number
  condition: string
  icon: string
  location: string
  humidity: number
  rainChance?: number
}

export default function EnhancedWeatherWidget() {
  const [mounted, setMounted] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  const getUserLocation = (): Promise<{lat: number, lon: number}> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: 37.5665, lon: 126.9780 })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        () => {
          resolve({ lat: 37.5665, lon: 126.9780 })
        },
        { timeout: 10000, enableHighAccuracy: false }
      )
    })
  }

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase()
    
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
      return '🌧️'
    } else if (cond.includes('cloud') || cond.includes('overcast')) {
      return '☁️'
    } else if (cond.includes('snow')) {
      return '❄️'
    } else if (cond.includes('storm') || cond.includes('thunder')) {
      return '⛈️'
    } else if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
      return '🌫️'
    } else if (cond.includes('clear') || cond.includes('sunny')) {
      return '☀️'
    } else {
      return '☀️'
    }
  }

  const fetchWeatherData = useCallback(async (): Promise<WeatherData> => {
    const location = await getUserLocation()
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    
    if (!apiKey) {
      throw new Error('Weather API key not found')
    }

    // Current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`
    )

    if (!currentResponse.ok) {
      throw new Error(`Weather API failed: ${currentResponse.status}`)
    }

    const currentData = await currentResponse.json()
    
    // For rain chance, we'll use humidity as a proxy since free tier doesn't have forecast
    // In a production app, you'd use the forecast API
    const rainChance = Math.min(Math.round(currentData.main.humidity * 0.3), 100)
    
    return {
      temperature: Math.round(currentData.main.temp),
      tempMax: Math.round(currentData.main.temp_max),
      tempMin: Math.round(currentData.main.temp_min),
      condition: currentData.weather[0].main,
      icon: getWeatherIcon(currentData.weather[0].main),
      location: currentData.name || 'Current Location',
      humidity: currentData.main.humidity,
      rainChance
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    
    const loadWeather = async () => {
      try {
        setLoading(true)
        const data = await fetchWeatherData()
        setWeatherData(data)
      } catch (error) {
        console.error('Weather loading failed:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [fetchWeatherData])

  if (!mounted || loading || !weatherData) {
    return (
      <div className="flex items-center text-sm text-gray-400">
        <span>--° | -- -- | --</span>
      </div>
    )
  }

  return (
    <div className="flex items-center text-sm font-medium text-gray-900">
      <span className="mr-1">{weatherData.icon}</span>
      <span>
        {weatherData.temperature}° | 최고 {weatherData.tempMax}° 최저 {weatherData.tempMin}° | 비 {weatherData.rainChance}%
      </span>
    </div>
  )
}