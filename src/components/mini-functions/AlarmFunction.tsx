'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlarmData } from '@/types/miniFunctions'
import { alarmsService } from '@/lib/supabase-services'
import { useAuth } from '@/contexts/AuthContext'

interface AlarmFunctionProps {
  isPreviewOnly?: boolean
}

export default function AlarmFunction({ isPreviewOnly = false }: AlarmFunctionProps) {
  const { user } = useAuth()
  const [alarms, setAlarms] = useState<AlarmData[]>([])
  const [nextAlarm, setNextAlarm] = useState<AlarmData | null>(null)
  const [loading, setLoading] = useState(false)

  // Load alarms from Supabase
  useEffect(() => {
    if (isPreviewOnly) {
      // Sample data for preview - 2 alarms max
      const sampleAlarms: AlarmData[] = [
        {
          id: 'sample1',
          time: '07:00',
          label: 'Morning workout',
          enabled: true
        },
        {
          id: 'sample2',
          time: '18:00',
          label: 'Evening run',
          enabled: true
        }
      ]
      setAlarms(sampleAlarms)
      setNextAlarm(sampleAlarms[0])
      return
    }

    loadAlarms()
  }, [isPreviewOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAlarms = useCallback(async () => {
    try {
      setLoading(true)
      
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
  }, [])


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


  const addNewAlarm = async () => {
    if (isPreviewOnly || loading || alarms.length >= 2) return

    try {
      setLoading(true)
      
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
            className="text-blue-400 hover:text-blue-300 text-sm underline disabled:opacity-50 cursor-pointer"
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
    <div className="space-y-1">
      {alarms.slice(0, 2).map((alarm) => (
        <div key={alarm.id} className="flex justify-between items-center py-1">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">■</span>
            <span className="text-gray-300 font-medium">{alarm.label}</span>
          </div>
          <div className="text-gray-300 text-sm">
            {alarm.time} {alarm.enabled ? '(Mon-Fri)' : '(Off)'}
          </div>
        </div>
      ))}

      {!isPreviewOnly && alarms.length < 2 && (
        <div className="mt-2">
          <button
            onClick={addNewAlarm}
            disabled={loading}
            className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
          >
            + Add alarm ({alarms.length}/2)
          </button>
        </div>
      )}
    </div>
  )
}