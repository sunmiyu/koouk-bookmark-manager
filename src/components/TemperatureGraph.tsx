'use client'

import { useState, useEffect } from 'react'

interface WeatherCondition {
  main: string
  description: string
}

interface WeatherData {
  main: {
    temp: number
  }
  weather: WeatherCondition[]
}

export default function TemperatureGraph() {
  const [mounted, setMounted] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  // 헤더와 동일한 위치 가져오기 함수
  const getUserLocation = (): Promise<{lat: number, lon: number}> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: 37.5665, lon: 126.9780 }) // Seoul 기본값
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
          resolve({ lat: 37.5665, lon: 126.9780 }) // 실패시 Seoul
        },
        { timeout: 10000, enableHighAccuracy: false }
      )
    })
  }

  // 헤더와 동일한 API 호출 함수
  const fetchWeatherData = async (): Promise<WeatherData> => {
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

    return await response.json()
  }

  useEffect(() => {
    setMounted(true)
    
    const loadWeather = async () => {
      try {
        setLoading(true)
        const data = await fetchWeatherData()
        setWeatherData(data)
        console.log('✅ Weather data loaded:', data.weather[0])
      } catch (error) {
        console.error('❌ Weather loading failed:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [])

  if (!mounted || loading || !weatherData) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">12시간 날씨 예보</h3>
          <div className="text-2xl font-bold text-blue-400">--°</div>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="text-gray-400 text-sm">날씨 정보를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  const currentTemp = Math.round(weatherData.main.temp)
  const currentCondition = weatherData.weather[0].main.toLowerCase()

  // 현재 시간부터 다음 12시간 데이터 생성
  const generateNext12Hours = () => {
    const result = []
    const now = new Date()
    const currentHour = now.getHours()
    
    for (let i = 0; i < 12; i++) {
      const targetHour = (currentHour + i) % 24
      let temperature = currentTemp
      let condition = currentCondition // 실제 현재 날씨 조건 사용
      
      // 시간에 따른 온도 변화 시뮬레이션
      if (i > 0) {
        const variation = Math.sin((targetHour / 24) * 2 * Math.PI) * 3 // ±3도 변화
        temperature = Math.round(currentTemp + variation)
      }
      
      // 시간 표시 포맷
      let timeLabel = ''
      if (i === 0) {
        timeLabel = '지금'
      } else if (targetHour === 0) {
        timeLabel = '12AM'
      } else if (targetHour === 12) {
        timeLabel = '12PM'
      } else if (targetHour < 12) {
        timeLabel = `${targetHour}AM`
      } else {
        timeLabel = `${targetHour - 12}PM`
      }
      
      result.push({
        hour: targetHour,
        time: timeLabel,
        temperature: Math.round(temperature),
        condition,
        isNow: i === 0
      })
    }
    
    return result
  }

  // 날씨 아이콘 반환
  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase()
    
    console.log('🔍 Weather condition:', condition, '→', cond)
    
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
      console.log('🌧️ Rain detected')
      return '🌧️'
    } else if (cond.includes('cloud') || cond.includes('overcast')) {
      console.log('☁️ Cloudy detected')
      return '☁️'
    } else if (cond.includes('snow')) {
      console.log('❄️ Snow detected')
      return '❄️'
    } else if (cond.includes('storm') || cond.includes('thunder')) {
      console.log('⛈️ Storm detected')
      return '⛈️'
    } else if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
      console.log('🌫️ Fog detected')
      return '🌫️'
    } else if (cond.includes('clear') || cond.includes('sunny')) {
      console.log('☀️ Clear/Sunny detected')
      return '☀️'
    } else {
      console.log('❓ Unknown condition, defaulting to sunny')
      return '☀️'
    }
  }

  const hourlyForecast = generateNext12Hours()
  const temperatures = hourlyForecast.map(d => d.temperature)
  const minTemp = Math.min(...temperatures)
  const maxTemp = Math.max(...temperatures)

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 w-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">12시간 날씨 예보</h3>
          <button 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    console.log('📍 Current location:', position.coords.latitude, position.coords.longitude)
                    // Force refresh weather data with current location
                    window.location.reload()
                  },
                  (error) => {
                    console.error('❌ Location error:', error)
                    alert('위치 권한을 허용해주세요. 현재 위치의 날씨를 보여드릴게요!')
                  },
                  { enableHighAccuracy: true, timeout: 10000 }
                )
              }
            }}
            className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs rounded border border-blue-500/30"
          >
            📍 현재 위치
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-400">{currentTemp}°</div>
          <div className="text-sm text-gray-400">현재</div>
        </div>
      </div>

      {/* 날씨 카드들 */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        {hourlyForecast.slice(0, 6).map((data, index) => (
          <div 
            key={index}
            className={`text-center p-3 rounded-lg ${
              data.isNow 
                ? 'bg-blue-600/30 border-2 border-blue-400' 
                : 'bg-gray-700/30'
            }`}
          >
            <div className={`text-xs mb-2 ${
              data.isNow ? 'text-blue-300 font-bold' : 'text-gray-400'
            }`}>
              {data.time}
            </div>
            <div className="text-lg mb-2">
              {getWeatherIcon(data.condition)}
            </div>
            <div className={`text-sm font-medium ${
              data.isNow ? 'text-blue-300' : 'text-white'
            }`}>
              {data.temperature}°
            </div>
          </div>
        ))}
      </div>

      {/* 다음 6시간 (작은 카드) */}
      <div className="grid grid-cols-6 gap-2">
        {hourlyForecast.slice(6, 12).map((data, index) => (
          <div key={index + 6} className="text-center p-2 rounded bg-gray-700/20">
            <div className="text-xs text-gray-500 mb-1">
              {data.time}
            </div>
            <div className="text-sm mb-1">
              {getWeatherIcon(data.condition)}
            </div>
            <div className="text-xs text-gray-300">
              {data.temperature}°
            </div>
          </div>
        ))}
      </div>

      {/* 요약 정보 */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-600/30">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            최고 <span className="text-orange-400 font-medium">{maxTemp}°</span>
          </span>
          <span className="text-sm text-gray-400">
            최저 <span className="text-blue-400 font-medium">{minTemp}°</span>
          </span>
        </div>
        <div className="text-xs text-gray-500">
          12시간 예보
        </div>
      </div>
    </div>
  )
}