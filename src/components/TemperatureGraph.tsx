'use client'

import { useState, useEffect } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot
} from 'recharts'

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

  // Get current hour for highlighting
  const currentHour = new Date().getHours()
  
  // Generate 24-hour data (6 hours past, 18 hours future)
  const generate24HourData = () => {
    const result = []
    const now = new Date()
    
    for (let i = -6; i <= 18; i++) {
      const targetTime = new Date(now.getTime() + (i * 60 * 60 * 1000))
      const targetHour = targetTime.getHours()
      
      // Find closest data point or interpolate
      let temperature = currentTemp
      const exactMatch = hourlyData.find(data => data.hour === targetHour)
      
      if (exactMatch) {
        temperature = exactMatch.temperature
      } else {
        // Simple interpolation based on available data
        const before = hourlyData.filter(data => data.hour < targetHour).pop()
        const after = hourlyData.find(data => data.hour > targetHour)
        
        if (before && after) {
          const ratio = (targetHour - before.hour) / (after.hour - before.hour)
          temperature = before.temperature + (after.temperature - before.temperature) * ratio
        } else if (before) {
          temperature = before.temperature
        } else if (after) {
          temperature = after.temperature
        }
      }
      
      result.push({
        hour: targetHour,
        time: formatTime(targetHour),
        temperature: Math.round(temperature),
        isCurrentHour: targetHour === currentHour,
        condition: exactMatch?.condition || 'clear'
      })
    }
    
    return result
  }
  
  const chartData = generate24HourData()

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

  // 시간 포맷팅 함수
  const formatTime = (hour: number) => {
    if (hour === 0) return '12AM'
    if (hour === 12) return '12PM'
    if (hour < 12) return `${hour}AM`
    return `${hour - 12}PM`
  }
  
  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.time}</p>
          <p className="text-blue-400 text-sm">
            <span className="font-bold">{data.temperature}°</span>
            {data.isCurrentHour && <span className="ml-2 text-xs">(Now)</span>}
          </p>
          <div className="text-lg text-center mt-1">
            {getWeatherIcon(data.condition)}
          </div>
        </div>
      )
    }
    return null
  }
  
  // Find min and max for chart scaling
  const temperatures = chartData.map(d => d.temperature)
  const minTemp = Math.min(...temperatures)
  const maxTemp = Math.max(...temperatures)
  const tempPadding = Math.max(2, (maxTemp - minTemp) * 0.1)
  
  // Key time points for labels (every 4 hours)
  const keyTimePoints = chartData.filter((_, index) => index % 4 === 0)

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
      <div className="h-40 sm:h-48 mb-4 sm:mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 10,
              left: 10,
              bottom: 20
            }}
          >
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              interval="preserveStartEnd"
              tickFormatter={(value) => {
                const dataIndex = chartData.findIndex(d => d.time === value)
                return dataIndex % 4 === 0 ? value : ''
              }}
            />
            <YAxis 
              domain={[minTemp - tempPadding, maxTemp + tempPadding]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickFormatter={(value) => `${Math.round(value)}°`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorTemp)"
              fillOpacity={1}
              dot={false}
              activeDot={false}
            />
            {/* Current time reference dots */}
            {chartData.map((entry, index) => {
              if (entry.isCurrentHour) {
                return (
                  <ReferenceDot
                    key={`current-${index}`}
                    x={entry.time}
                    y={entry.temperature}
                    r={6}
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth={3}
                    className="drop-shadow-lg"
                  />
                )
              }
              return null
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Time Labels with Weather Icons */}
      <div className="flex justify-between items-center px-1 sm:px-2 mb-3 sm:mb-4">
        {keyTimePoints.map((data, index) => {
          const isCurrentTime = data.isCurrentHour
          
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
                {isCurrentTime ? 'Now' : data.time}
              </span>
              {/* 온도 표시 */}
              <span className={`text-xs mt-0.5 ${
                isCurrentTime ? 'text-blue-300 font-bold' : 'text-gray-500'
              }`}>
                {data.temperature}°
              </span>
            </div>
          )
        })}
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