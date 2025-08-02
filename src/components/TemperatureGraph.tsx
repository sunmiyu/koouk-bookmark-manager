'use client'

import { useState, useEffect } from 'react'

interface HourlyData {
  time: string
  temperature: number
  hour: number
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
    return ((temp - minTemp) / tempRange) * 80 + 10 // 10-90 range for padding
  }

  // Get current hour for highlighting
  const currentHour = new Date().getHours()

  // Format time for display (simplified)
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const hour = date.getHours()
    if (hour === 6 || hour === 12 || hour === 18 || hour === 0) {
      return hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour > 12 ? `${hour-12}PM` : `${hour}AM`
    }
    return ''
  }

  // Generate smooth curved SVG path using bezier curves
  const generateSmoothPath = () => {
    if (hourlyData.length < 2) return ''
    
    const width = 100
    const stepX = width / (hourlyData.length - 1)
    
    // Get control points for smooth curves
    const points = hourlyData.map((data, i) => ({
      x: i * stepX,
      y: 100 - scaleTemp(data.temperature)
    }))
    
    if (points.length < 2) return ''
    
    let path = `M ${points[0].x} ${points[0].y}`
    
    // Create smooth curve using cubic bezier
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      
      // Control point distance (for smoothness)
      const tension = 0.2
      const cp1x = prev.x + (curr.x - prev.x) * tension
      const cp1y = prev.y
      const cp2x = curr.x - (curr.x - prev.x) * tension
      const cp2y = curr.y
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    }
    
    return path
  }

  // Generate smooth gradient path (area under curve)
  const generateSmoothGradientPath = () => {
    if (hourlyData.length < 2) return ''
    
    const width = 100
    const stepX = width / (hourlyData.length - 1)
    
    const points = hourlyData.map((data, i) => ({
      x: i * stepX,
      y: 100 - scaleTemp(data.temperature)
    }))
    
    let path = `M 0 100 L 0 ${points[0].y}`
    
    // Create smooth curve matching the main path
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      
      const tension = 0.2
      const cp1x = prev.x + (curr.x - prev.x) * tension
      const cp1y = prev.y
      const cp2x = curr.x - (curr.x - prev.x) * tension
      const cp2y = curr.y
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    }
    
    path += ` L 100 100 Z`
    return path
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Temperature Trend</h3>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-400">{currentTemp}°</div>
          <div className="text-sm text-gray-400">Now</div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="relative h-32 mb-4">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Area under curve */}
          <path
            d={generateSmoothGradientPath()}
            fill="url(#tempGradient)"
          />
          
          {/* Main temperature line - smooth curve */}
          <path
            d={generateSmoothPath()}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Key data points only */}
          {hourlyData.filter((_, index) => index % 2 === 0 || index === hourlyData.length - 1).map((data, filteredIndex) => {
            const originalIndex = hourlyData.findIndex(d => d === data)
            const x = (originalIndex / (hourlyData.length - 1)) * 100
            const y = 100 - scaleTemp(data.temperature)
            const isCurrentHour = Math.abs(data.hour - currentHour) <= 1
            
            return (
              <g key={originalIndex}>
                <circle
                  cx={x}
                  cy={y}
                  r={isCurrentHour ? "4" : "3"}
                  fill={isCurrentHour ? "rgb(59, 130, 246)" : "rgb(255, 255, 255)"}
                  stroke={isCurrentHour ? "rgb(255, 255, 255)" : "rgb(59, 130, 246)"}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  className="drop-shadow-sm"
                />
                {/* Temperature label - only for key points */}
                {(isCurrentHour || filteredIndex % 2 === 0) && (
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className="text-xs fill-white font-semibold drop-shadow-sm"
                    style={{ fontSize: '3.5px' }}
                  >
                    {data.temperature}°
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Simplified Time Labels - only show key times */}
      <div className="flex justify-between items-center px-2">
        {hourlyData.map((data, index) => {
          const timeLabel = formatTime(data.time)
          const isCurrentHour = Math.abs(data.hour - currentHour) <= 1
          
          if (!timeLabel && !isCurrentHour) return <div key={index} />
          
          return (
            <div
              key={index}
              className={`text-center flex flex-col items-center ${
                isCurrentHour ? 'text-blue-400 font-semibold' : 'text-gray-400 font-medium'
              }`}
            >
              {isCurrentHour && (
                <div className="w-1 h-1 bg-blue-400 rounded-full mb-1" />
              )}
              <span className="text-xs">
                {isCurrentHour ? 'Now' : timeLabel}
              </span>
            </div>
          )
        }).filter(Boolean)}
      </div>

      {/* Temperature Range Info */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700/30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-orange-400 rounded-full"></div>
            <span className="text-sm text-gray-300 font-medium">H: {maxTemp}°</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
            <span className="text-sm text-gray-300 font-medium">L: {minTemp}°</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          24h forecast
        </div>
      </div>
    </div>
  )
}