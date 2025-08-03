'use client'

import { useState, useEffect } from 'react'

interface HourlyData {
  time: string
  temperature: number
  hour: number
  condition?: string // 날씨 상태 추가 (선택적)
}

interface TemperatureGraphProps {
  hourlyData: HourlyData[]
  currentTemp: number
}

export default function TemperatureGraph({ hourlyData, currentTemp }: TemperatureGraphProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !hourlyData || hourlyData.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Temperature</h3>
          <div className="text-2xl font-bold text-blue-400">{currentTemp}°</div>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading temperature data...</div>
        </div>
      </div>
    )
  }

  // Find min and max temperatures for scaling
  const temperatures = hourlyData.map(d => d.temperature)
  const minTemp = Math.min(...temperatures)
  const maxTemp = Math.max(...temperatures)
  const tempRange = maxTemp - minTemp || 10 // Minimum range of 10 degrees

  // Scale temperature to chart height (0-100)
  const scaleTemp = (temp: number) => {
    return ((temp - minTemp) / tempRange) * 70 + 15 // 15-85 range for more padding
  }

  // Get current hour for highlighting
  const currentHour = new Date().getHours()

  // 날씨 아이콘 반환 함수
  const getWeatherIcon = (condition: string = 'clear') => {
    const iconMap: { [key: string]: string } = {
      'clear': '☀️',
      'sunny': '☀️',
      'cloudy': '☁️',
      'partly-cloudy': '⛅',
      'rain': '🌧️',
      'snow': '🌨️',
      'storm': '⛈️',
      'fog': '🌫️',
      'wind': '💨'
    }
    return iconMap[condition.toLowerCase()] || '☀️'
  }

  // 시간 포맷팅 함수 (실제 시간 기반)
  const formatTime = (hour: number, isKeyTime = false) => {
    if (hour === 0) return '12AM'
    if (hour === 12) return '12PM'
    if (hour < 12) return `${hour}AM`
    return `${hour - 12}PM`
  }

  // 현재 시간에서 가장 가까운 주요 시간대들 계산
  const getKeyTimePoints = () => {
    if (hourlyData.length === 0) return []
    
    // 처음, 중간, 마지막 포인트를 주요 시간대로 선택
    const keyIndices = [
      0,
      Math.floor(hourlyData.length / 2),
      hourlyData.length - 1
    ]
    
    return keyIndices.map(index => hourlyData[index]).filter(Boolean)
  }

  // 현재 시간에 가장 가까운 데이터 포인트 찾기
  const getCurrentTimePoint = () => {
    if (hourlyData.length === 0) return null
    
    return hourlyData.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.hour - currentHour)
      const currDiff = Math.abs(curr.hour - currentHour)
      return currDiff < prevDiff ? curr : prev
    })
  }

  // 부드러운 곡선 패스 생성 (cubic bezier)
  const generateSmoothPath = () => {
    if (hourlyData.length < 2) return ''
    
    const width = 100
    const stepX = width / (hourlyData.length - 1)
    
    const points = hourlyData.map((data, i) => ({
      x: i * stepX,
      y: 100 - scaleTemp(data.temperature)
    }))
    
    let path = `M ${points[0].x} ${points[0].y}`
    
    if (points.length === 2) {
      // 2개 포인트만 있으면 직선
      path += ` L ${points[1].x} ${points[1].y}`
    } else {
      // 3개 이상이면 부드러운 곡선
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const next = points[i + 1]
        
        if (i === 1) {
          // 첫 번째 곡선
          const cp1x = prev.x + (curr.x - prev.x) * 0.3
          const cp1y = prev.y
          const cp2x = curr.x - (curr.x - prev.x) * 0.3
          const cp2y = curr.y
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        } else if (i === points.length - 1) {
          // 마지막 곡선
          const cp1x = prev.x + (curr.x - prev.x) * 0.3
          const cp1y = prev.y
          const cp2x = curr.x - (curr.x - prev.x) * 0.3
          const cp2y = curr.y
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        } else {
          // 중간 곡선
          const prevDelta = { x: curr.x - prev.x, y: curr.y - prev.y }
          const nextDelta = { x: next.x - curr.x, y: next.y - curr.y }
          const cp1x = prev.x + prevDelta.x * 0.7
          const cp1y = prev.y + prevDelta.y * 0.7
          const cp2x = curr.x - nextDelta.x * 0.3
          const cp2y = curr.y - nextDelta.y * 0.3
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        }
      }
    }
    
    return path
  }

  // 그래디언트 영역 패스 (부드러운 곡선 기반)
  const generateGradientPath = () => {
    const linePath = generateSmoothPath()
    if (!linePath) return ''
    
    // 라인 패스에 하단 영역 추가
    const width = 100
    const stepX = width / (hourlyData.length - 1)
    const lastX = (hourlyData.length - 1) * stepX
    
    return `M 0 100 L 0 ${100 - scaleTemp(hourlyData[0].temperature)} ${linePath.substring(1)} L ${lastX} 100 Z`
  }

  const keyTimePoints = getKeyTimePoints()
  const currentTimePoint = getCurrentTimePoint()

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-white">Temperature Trend</h3>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="text-xl sm:text-2xl font-bold text-blue-400">{currentTemp}°</div>
          <div className="text-xs sm:text-sm text-gray-400">Now</div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="relative h-32 sm:h-40 mb-4 sm:mb-6">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Area under curve */}
          <path
            d={generateGradientPath()}
            fill="url(#tempGradient)"
          />
          
          {/* Main temperature line - smooth curve */}
          <path
            d={generateSmoothPath()}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* 모든 데이터 포인트에 온도 라벨 표시 */}
          {hourlyData.map((data, index) => {
            const x = (index / (hourlyData.length - 1)) * 100
            const y = 100 - scaleTemp(data.temperature)
            const isCurrentHour = currentTimePoint && data.hour === currentTimePoint.hour
            
            return (
              <g key={index}>
                {/* 데이터 포인트 원 */}
                <circle
                  cx={x}
                  cy={y}
                  r={isCurrentHour ? "5" : "3"}
                  fill={isCurrentHour ? "rgb(59, 130, 246)" : "rgb(255, 255, 255)"}
                  stroke={isCurrentHour ? "rgb(255, 255, 255)" : "rgb(59, 130, 246)"}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  className="drop-shadow-sm"
                />
                
                {/* 온도 라벨 - 키 포인트와 현재 시간에만 표시 */}
                {(keyTimePoints.some(point => point.hour === data.hour) || isCurrentHour) && (
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className={`font-bold drop-shadow-sm ${
                      isCurrentHour 
                        ? 'fill-blue-400 text-sm' 
                        : 'fill-white text-xs'
                    }`}
                    style={{ fontSize: isCurrentHour ? '5px' : '4px' }}
                  >
                    {data.temperature}°
                  </text>
                )}

                {/* 날씨 아이콘 - 키 포인트에만 표시 */}
                {keyTimePoints.some(point => point.hour === data.hour) && (
                  <text
                    x={x}
                    y={y + 18}
                    textAnchor="middle"
                    className="text-lg"
                    style={{ fontSize: '6px' }}
                  >
                    {getWeatherIcon(data.condition)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* 시간 라벨 - 키 포인트만 표시 */}
      <div className="flex justify-between items-center px-1 sm:px-2 mb-3 sm:mb-4">
        {keyTimePoints.map((data, index) => {
          const isCurrentTime = currentTimePoint && data.hour === currentTimePoint.hour
          const timeLabel = formatTime(data.hour, true)
          
          return (
            <div
              key={`key-${data.hour}-${index}`}
              className={`text-center flex flex-col items-center ${
                isCurrentTime ? 'text-blue-400 font-bold' : 'text-gray-400 font-medium'
              }`}
            >
              {/* 날씨 아이콘 */}
              <span className="text-xs sm:text-sm mb-0.5 sm:mb-1">
                {getWeatherIcon(data.condition)}
              </span>
              {/* 시간 라벨 */}
              <span className="text-xs">
                {isCurrentTime ? 'Now' : timeLabel}
              </span>
            </div>
          )
        })}
        
        {/* 현재 시간이 키 포인트에 없으면 별도 표시 */}
        {currentTimePoint && !keyTimePoints.some(point => point.hour === currentTimePoint.hour) && (
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center flex flex-col items-center text-blue-400 font-bold">
            <span className="text-xs sm:text-sm mb-0.5 sm:mb-1">
              {getWeatherIcon(currentTimePoint.condition)}
            </span>
            <span className="text-xs bg-blue-600/20 px-2 py-0.5 rounded">
              Now
            </span>
          </div>
        )}
      </div>

      {/* Temperature Range Info */}
      <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-700/30">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-400 rounded-full"></div>
            <span className="text-xs sm:text-sm text-gray-300 font-medium">High: {maxTemp}°</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-400 rounded-full"></div>
            <span className="text-xs sm:text-sm text-gray-300 font-medium">Low: {minTemp}°</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          24h forecast
        </div>
      </div>
    </div>
  )
}