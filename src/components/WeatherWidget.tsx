'use client'

import { useState, useEffect, useCallback } from 'react'

interface WeatherData {
  temperature: number
  condition: string
  icon: string
  location: string
}

export default function WeatherWidget() {
  const [mounted, setMounted] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

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

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric&lang=kr`
    )

    if (!response.ok) {
      throw new Error(`Weather API failed: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: getWeatherIcon(data.weather[0].main),
      location: data.name || 'Current Location'
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
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-800/30 border border-gray-700/30">
        <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
        <span className="text-gray-400 text-sm">--°</span>
      </div>
    )
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 cursor-pointer">
        <span className="text-base">{weatherData.icon}</span>
        <span className="text-white text-sm font-medium">
          {weatherData.temperature}°
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl z-50 min-w-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{weatherData.icon}</span>
            <div>
              <div className="text-white font-medium">{weatherData.temperature}°C</div>
              <div className="text-gray-400 text-xs">{weatherData.condition}</div>
            </div>
          </div>
          <div className="text-gray-500 text-xs border-t border-gray-700 pt-2">
            📍 {weatherData.location}
          </div>
        </div>
      )}
    </div>
  )
}