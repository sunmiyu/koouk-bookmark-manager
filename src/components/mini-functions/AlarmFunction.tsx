'use client'

import { useState, useEffect } from 'react'
import { AlarmData } from '@/types/miniFunctions'

interface AlarmFunctionProps {
  isPreviewOnly?: boolean
}

export default function AlarmFunction({ isPreviewOnly = false }: AlarmFunctionProps) {
  const [alarms, setAlarms] = useState<AlarmData[]>([])
  const [nextAlarm, setNextAlarm] = useState<AlarmData | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  // Load alarms from localStorage
  useEffect(() => {
    if (isPreviewOnly) {
      // Sample data for preview
      const sampleAlarm: AlarmData = {
        id: 'sample',
        time: '07:00',
        label: 'Morning Workout',
        enabled: true
      }
      setNextAlarm(sampleAlarm)
      setTimeRemaining('5시간 23분 후')
      return
    }

    const saved = localStorage.getItem('koouk_alarms')
    if (saved) {
      try {
        const parsedAlarms = JSON.parse(saved) as AlarmData[]
        setAlarms(parsedAlarms)
        findNextAlarm(parsedAlarms)
      } catch (error) {
        console.error('Failed to load alarms:', error)
      }
    }
  }, [isPreviewOnly])

  // Update time remaining every minute
  useEffect(() => {
    if (!nextAlarm || isPreviewOnly) return

    const updateTimeRemaining = () => {
      const remaining = calculateTimeRemaining(nextAlarm.time)
      setTimeRemaining(remaining)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [nextAlarm, isPreviewOnly])

  const findNextAlarm = (alarmList: AlarmData[]) => {
    const enabledAlarms = alarmList.filter(alarm => alarm.enabled)
    if (enabledAlarms.length === 0) {
      setNextAlarm(null)
      return
    }

    const now = new Date()
    
    // Find the next alarm (could be today or tomorrow)
    let closestAlarm: AlarmData | null = null
    let closestTime = Infinity

    enabledAlarms.forEach(alarm => {
      const [hours, minutes] = alarm.time.split(':').map(Number)
      
      // Try today first
      const todayAlarmTime = new Date()
      todayAlarmTime.setHours(hours, minutes, 0, 0)
      
      if (todayAlarmTime > now) {
        const diff = todayAlarmTime.getTime() - now.getTime()
        if (diff < closestTime) {
          closestTime = diff
          closestAlarm = alarm
        }
      } else {
        // Try tomorrow
        const tomorrowAlarmTime = new Date()
        tomorrowAlarmTime.setDate(tomorrowAlarmTime.getDate() + 1)
        tomorrowAlarmTime.setHours(hours, minutes, 0, 0)
        
        const diff = tomorrowAlarmTime.getTime() - now.getTime()
        if (diff < closestTime) {
          closestTime = diff
          closestAlarm = alarm
        }
      }
    })

    setNextAlarm(closestAlarm)
  }

  const calculateTimeRemaining = (alarmTime: string): string => {
    const [hours, minutes] = alarmTime.split(':').map(Number)
    const now = new Date()
    
    const alarmDateTime = new Date()
    alarmDateTime.setHours(hours, minutes, 0, 0)
    
    // If alarm time has passed today, set it for tomorrow
    if (alarmDateTime <= now) {
      alarmDateTime.setDate(alarmDateTime.getDate() + 1)
    }
    
    const diff = alarmDateTime.getTime() - now.getTime()
    const hoursRemaining = Math.floor(diff / (1000 * 60 * 60))
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hoursRemaining > 0) {
      return `${hoursRemaining}시간 ${minutesRemaining}분 후`
    } else {
      return `${minutesRemaining}분 후`
    }
  }

  const addNewAlarm = () => {
    if (isPreviewOnly) return

    const newAlarm: AlarmData = {
      id: Date.now().toString(),
      time: '07:00',
      label: 'New Alarm',
      enabled: true
    }

    const updatedAlarms = [...alarms, newAlarm]
    setAlarms(updatedAlarms)
    localStorage.setItem('koouk_alarms', JSON.stringify(updatedAlarms))
    findNextAlarm(updatedAlarms)
  }

  const toggleAlarm = (alarmId: string) => {
    if (isPreviewOnly) return

    const updatedAlarms = alarms.map(alarm =>
      alarm.id === alarmId ? { ...alarm, enabled: !alarm.enabled } : alarm
    )
    setAlarms(updatedAlarms)
    localStorage.setItem('koouk_alarms', JSON.stringify(updatedAlarms))
    findNextAlarm(updatedAlarms)
  }

  if (!nextAlarm) {
    return (
      <div className="space-y-2">
        <div className="text-gray-400 text-xs">
          No active alarms
        </div>
        {!isPreviewOnly && (
          <button
            onClick={addNewAlarm}
            className="text-blue-400 hover:text-blue-300 text-xs underline"
          >
            + Add alarm
          </button>
        )}
        {isPreviewOnly && (
          <div className="text-center">
            <span className="text-gray-500 text-xs">⏰ Set alarms in Pro plan</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-white font-medium text-sm">
          {nextAlarm.time}
        </div>
        <div className="text-green-400 text-xs">
          {timeRemaining}
        </div>
      </div>
      
      <div className="text-gray-300 text-xs">
        {nextAlarm.label}
      </div>

      {!isPreviewOnly && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => toggleAlarm(nextAlarm.id)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Turn Off
          </button>
          <button
            onClick={addNewAlarm}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            + Add
          </button>
        </div>
      )}

      {isPreviewOnly && (
        <div className="text-center pt-1">
          <span className="text-gray-500 text-xs">Manage alarms in Pro plan</span>
        </div>
      )}
    </div>
  )
}