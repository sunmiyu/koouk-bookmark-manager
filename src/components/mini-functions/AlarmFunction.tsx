'use client'

import { useState, useEffect } from 'react'
import { AlarmData } from '@/types/miniFunctions'
import { alarmsService } from '@/lib/supabase-services'
import { supabase } from '@/lib/supabase'

interface AlarmFunctionProps {
  isPreviewOnly?: boolean
}

export default function AlarmFunction({ isPreviewOnly = false }: AlarmFunctionProps) {
  const [alarms, setAlarms] = useState<AlarmData[]>([])
  const [nextAlarm, setNextAlarm] = useState<AlarmData | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Load alarms from Supabase
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

    loadAlarms()
  }, [isPreviewOnly])

  const loadAlarms = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Fallback to localStorage
        const saved = localStorage.getItem('koouk_alarms')
        if (saved) {
          const parsedAlarms = JSON.parse(saved) as AlarmData[]
          setAlarms(parsedAlarms)
          findNextAlarm(parsedAlarms)
        }
        return
      }

      const dbAlarms = await alarmsService.getAll(user.id)
      const alarmData: AlarmData[] = dbAlarms.map(alarm => ({
        id: alarm.id,
        time: alarm.time,
        label: alarm.label,
        enabled: alarm.enabled
      }))

      setAlarms(alarmData)
      findNextAlarm(alarmData)
    } catch (error) {
      console.error('Failed to load alarms:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem('koouk_alarms')
      if (saved) {
        const parsedAlarms = JSON.parse(saved) as AlarmData[]
        setAlarms(parsedAlarms)
        findNextAlarm(parsedAlarms)
      }
    } finally {
      setLoading(false)
    }
  }

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

  const addNewAlarm = async () => {
    if (isPreviewOnly || loading) return

    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Save to Supabase
        const newDbAlarm = await alarmsService.create({
          user_id: user.id,
          time: '07:00',
          label: 'New Alarm',
          enabled: true
        })

        const newAlarm: AlarmData = {
          id: newDbAlarm.id,
          time: newDbAlarm.time,
          label: newDbAlarm.label,
          enabled: newDbAlarm.enabled
        }

        const updatedAlarms = [...alarms, newAlarm]
        setAlarms(updatedAlarms)
        findNextAlarm(updatedAlarms)
      } else {
        // Fallback to localStorage
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
    } catch (error) {
      console.error('Failed to add alarm:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAlarm = async (alarmId: string) => {
    if (isPreviewOnly || loading) return

    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      const alarm = alarms.find(a => a.id === alarmId)
      
      if (!alarm) return

      if (user) {
        // Update in Supabase
        await alarmsService.update(alarmId, {
          enabled: !alarm.enabled
        })
      }

      const updatedAlarms = alarms.map(alarm =>
        alarm.id === alarmId ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
      setAlarms(updatedAlarms)
      
      // Update localStorage as backup
      localStorage.setItem('koouk_alarms', JSON.stringify(updatedAlarms))
      findNextAlarm(updatedAlarms)
    } catch (error) {
      console.error('Failed to toggle alarm:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!nextAlarm) {
    return (
      <div className="space-y-2">
        <div className="text-gray-400 text-sm">
          No active alarms
        </div>
        {!isPreviewOnly && (
          <button
            onClick={addNewAlarm}
            disabled={loading}
            className="text-blue-400 hover:text-blue-300 text-sm underline disabled:opacity-50"
          >
            + Add alarm
          </button>
        )}
        {isPreviewOnly && (
          <div className="text-center">
            <span className="text-gray-500 text-sm">⏰ Set your daily alarms</span>
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
        <div className="text-green-400 text-sm">
          {timeRemaining}
        </div>
      </div>
      
      <div className="text-gray-300 text-sm">
        {nextAlarm.label}
      </div>

      {!isPreviewOnly && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => toggleAlarm(nextAlarm.id)}
            disabled={loading}
            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            Turn Off
          </button>
          <button
            onClick={addNewAlarm}
            disabled={loading}
            className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
          >
            + Add
          </button>
        </div>
      )}

    </div>
  )
}