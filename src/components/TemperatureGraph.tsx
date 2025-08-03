'use client'

import { useState, useEffect } from 'react'

interface HourlyData {
  time: string
  temperature: number
  hour: number
  condition?: string
}

interface TemperatureGraphProps {
  hourlyData: HourlyData[]
  currentTemp: number
}

export default function TemperatureGraph({ hourlyData, currentTemp }: TemperatureGraphProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Debug: 현재 위치 권한 상태 확인
    if (navigator.permissions) {
      navigator.permissions.query({name: 'geolocation'}).then(result => {
        console.log('🌍 Geolocation permission:', result.state)
      })
    }
    
    // Debug: hourlyData 확인
    console.log('🌤️ Weather hourlyData:', hourlyData)
    console.log('🌡️ Current temp:', currentTemp)
    
    // Debug: 첫 3개 항목의 condition 확인
    console.log('🔬 First 3 hourly conditions:')
    hourlyData.slice(0, 3).forEach((item, i) => {
      console.log(`  ${i}: hour=${item.hour}, condition="${item.condition}", temp=${item.temperature}`)
      console.log(`  Full item:`, item)
    })
    
    // 캐시 강제 무효화를 위한 "현재 위치" 버튼 클릭
    console.log('💡 Try clicking the "📍 현재 위치" button to refresh weather data')
  }, [hourlyData, currentTemp])

  if (!mounted || !hourlyData || hourlyData.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">24시간 날씨</h3>
          <div className="text-2xl font-bold text-blue-400">{currentTemp}°</div>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="text-gray-400 text-sm">날씨 정보를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  // 현재 시간부터 다음 12시간 데이터 생성
  const generateNext12Hours = () => {
    const result = []
    const now = new Date()
    const currentHour = now.getHours()
    
    for (let i = 0; i < 12; i++) {
      const targetHour = (currentHour + i) % 24
      let temperature = currentTemp
      let condition = 'clear'
      
      // 기존 데이터에서 해당 시간 찾기
      const existingData = hourlyData.find(data => data.hour === targetHour)
      if (existingData) {
        temperature = existingData.temperature
        // "undefined" 문자열도 처리
        condition = (existingData.condition && existingData.condition !== 'undefined') ? existingData.condition : 'clear'
        
        // Debug: 실제 데이터 확인
        if (i < 3) {
          console.log(`⏰ Hour ${targetHour}: existingData =`, existingData)
          console.log(`   condition: "${existingData.condition}" → "${condition}"`)
        }
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

  const weatherData = generateNext12Hours()
  const temperatures = weatherData.map(d => d.temperature)
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
        {weatherData.slice(0, 6).map((data, index) => (
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
        {weatherData.slice(6, 12).map((data, index) => (
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