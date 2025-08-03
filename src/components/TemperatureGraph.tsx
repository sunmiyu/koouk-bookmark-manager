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

  // 시간 포맷팅 함수 (3시간 간격)
  const formatTime = (hour: number) => {
    if (hour === 0) return '12AM'
    if (hour === 6) return '6AM'
    if (hour === 12) return '12PM'
    if (hour === 18) return '6PM'
    return ''
  }

  // 주요 시간대 필터링 (3시간 간격)
  const getKeyTimePoints = () => {
    return hourlyData.filter(data => 
      data.hour === 0 || data.hour === 6 || data.hour === 12 || data.hour === 18
    )
  }

  // 현재 시간에 가장 가까운 데이터 포인트 찾기
  const getCurrentTimePoint = () => {
    return hourlyData.find(data => Math.abs(data.hour - currentHour) <= 1) || 
           hourlyData.reduce((prev, curr) => 
             Math.abs(curr.hour - currentHour) < Math.abs(prev.hour - currentHour) ? curr : prev
           )
  }

  // 단순화된 직선 연결 패스 생성
  const generateSimplePath = () => {
    if (hourlyData.length < 2) return ''
    
    const width = 100
    const stepX = width / (hourlyData.length - 1)
    
    const points = hourlyData.map((data, i) => ({
      x: i * stepX,
      y: 100 - scaleTemp(data.temperature)
    }))
    
    let path = `M ${points[0].x} ${points[0].y}`
    
    // 단순한 직선 연결로 변경
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }
    
    return path
  }

  // 그래디언트 영역 패스
  const generateGradientPath = () => {
    if (hourlyData.length < 2) return ''
    
    const width = 100
    const stepX = width / (hourlyData.length - 1)
    
    const points = hourlyData.map((data, i) => ({
      x: i * stepX,
      y: 100 - scaleTemp(data.temperature)
    }))
    
    let path = `M 0 100 L 0 ${points[0].y}`
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }
    
    path += ` L 100 100 Z`
    return path
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
          preserveAspectRatio="none"
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
          
          {/* Main temperature line - simple and clean */}
          <path
            d={generateSimplePath()}
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
                
                {/* 온도 라벨 - 모든 포인트에 표시하되 3시간 간격으로만 크게 */}
                {(index % 3 === 0 || isCurrentHour) && (
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

                {/* 날씨 아이콘 - 주요 시간대에만 표시 */}
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

      {/* 시간 라벨 - 3시간 간격으로 단순화 */}
      <div className="flex justify-between items-center px-1 sm:px-2 mb-3 sm:mb-4">
        {keyTimePoints.map((data) => {
          const isCurrentTime = currentTimePoint && data.hour === currentTimePoint.hour
          const timeLabel = formatTime(data.hour)
          
          return (
            <div
              key={data.hour}
              className={`text-center flex flex-col items-center ${
                isCurrentTime ? 'text-blue-400 font-bold' : 'text-gray-400 font-medium'
              }`}
            >
              <span className="text-xs sm:text-sm mb-0.5 sm:mb-1">
                {getWeatherIcon(data.condition)}
              </span>
              <span className="text-xs">
                {isCurrentTime ? 'Now' : timeLabel}
              </span>
            </div>
          )
        })}
        
        {/* 현재 시간이 주요 시간대가 아닌 경우 별도 표시 */}
        {currentTimePoint && !keyTimePoints.some(point => point.hour === currentTimePoint.hour) && (
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center flex flex-col items-center text-blue-400 font-bold">
            <div className="w-1 h-1 bg-blue-400 rounded-full mb-0.5 sm:mb-1" />
            <span className="text-xs bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">Now</span>
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