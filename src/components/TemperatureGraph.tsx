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

  // Format time for display
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const hour = date.getHours()
    return hour.toString().padStart(2, '0') + ':00'
  }

  // Generate SVG path for the temperature curve
  const generatePath = () => {
    if (hourlyData.length < 2) return ''
    
    const width = 100 // Percentage based
    const stepX = width / (hourlyData.length - 1)
    
    let path = `M 0 ${100 - scaleTemp(hourlyData[0].temperature)}`
    
    for (let i = 1; i < hourlyData.length; i++) {
      const x = i * stepX
      const y = 100 - scaleTemp(hourlyData[i].temperature)
      path += ` L ${x} ${y}`
    }
    
    return path
  }

  // Generate gradient path (area under curve)
  const generateGradientPath = () => {
    if (hourlyData.length < 2) return ''
    
    const width = 100
    const stepX = width / (hourlyData.length - 1)
    
    let path = `M 0 100`
    path += ` L 0 ${100 - scaleTemp(hourlyData[0].temperature)}`
    
    for (let i = 1; i < hourlyData.length; i++) {
      const x = i * stepX
      const y = 100 - scaleTemp(hourlyData[i].temperature)
      path += ` L ${x} ${y}`
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
            d={generateGradientPath()}
            fill="url(#tempGradient)"
          />
          
          {/* Main temperature line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points */}
          {hourlyData.map((data, index) => {
            const x = (index / (hourlyData.length - 1)) * 100
            const y = 100 - scaleTemp(data.temperature)
            const isCurrentHour = Math.abs(data.hour - currentHour) <= 1
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={isCurrentHour ? "3" : "2"}
                  fill={isCurrentHour ? "rgb(59, 130, 246)" : "rgb(255, 255, 255)"}
                  stroke={isCurrentHour ? "rgb(255, 255, 255)" : "rgb(59, 130, 246)"}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Temperature label */}
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium"
                  style={{ fontSize: '3px' }}
                >
                  {data.temperature}°
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Time Labels */}
      <div className="flex justify-between text-xs text-gray-400">
        {hourlyData.map((data, index) => {
          const isCurrentHour = Math.abs(data.hour - currentHour) <= 1
          return (
            <div
              key={index}
              className={`text-center ${isCurrentHour ? 'text-blue-400 font-medium' : ''}`}
            >
              {formatTime(data.time)}
            </div>
          )
        })}
      </div>

      {/* Temperature Range Info */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-xs text-gray-400">High: {maxTemp}°</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Low: {minTemp}°</span>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {hourlyData.length} data points
        </div>
      </div>
    </div>
  )
}