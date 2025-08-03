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

  // 시간 포맷팅 함수
  const formatTime = (hour: number) => {
    if (hour === 0) return '12AM'
    if (hour === 12) return '12PM'
    if (hour < 12) return `${hour}AM`
    return `${hour - 12}PM`
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
      <div className="relative h-40 sm:h-48 mb-4 sm:mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 30,
              right: 10,
              left: 10,
              bottom: 30
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
              interval={3}
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
            {/* Current time reference dots with green color */}
            {chartData.map((entry, index) => {
              if (entry.isCurrentHour) {
                return (
                  <ReferenceDot
                    key={`current-${index}`}
                    x={entry.time}
                    y={entry.temperature}
                    r={8}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth={3}
                  />
                )
              }
              return null
            })}
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Overlay for temperature labels and weather icons */}
        <div className="absolute inset-0 pointer-events-none">
          {chartData.map((entry, index) => {
            if (index % 4 === 0 || entry.isCurrentHour) {
              const xPosition = ((index / (chartData.length - 1)) * 100)
              const yPosition = (1 - ((entry.temperature - (minTemp - tempPadding)) / ((maxTemp + tempPadding) - (minTemp - tempPadding)))) * 100
              
              return (
                <div key={`overlay-${index}`} className="absolute" style={{
                  left: `${xPosition}%`,
                  top: `${yPosition}%`,
                  transform: 'translate(-50%, -50%)'
                }}>
                  {/* Green arrow for NOW */}
                  {entry.isCurrentHour && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-green-500"></div>
                      <div className="text-xs font-bold text-green-500 text-center mt-1">NOW</div>
                    </div>
                  )}
                  
                  {/* Temperature label */}
                  <div className={`text-xs font-medium text-center mb-1 ${
                    entry.isCurrentHour ? 'text-green-400 font-bold' : 'text-white'
                  }`}>
                    {entry.temperature}°
                  </div>
                  
                  {/* Weather emoji */}
                  <div className="text-lg text-center">
                    {getWeatherIcon(entry.condition)}
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      </div>


    </div>
  )
}