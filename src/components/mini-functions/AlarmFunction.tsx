'use client'

import { useState, useEffect } from 'react'

interface Alarm {
  id: string
  time: string
  label: string
  days: string[]
  enabled: boolean
  sound: string
}

interface AlarmFunctionProps {
  isPreviewOnly?: boolean
}

export default function AlarmFunction({ isPreviewOnly = false }: AlarmFunctionProps) {
  // isPreviewOnly를 사용하여 미리보기 모드 처리 가능
  const [alarms, setAlarms] = useState<Alarm[]>([])

  useEffect(() => {
    if (isPreviewOnly) {
      // 미리보기 모드에서는 더미 데이터 사용
      setAlarms([
        {
          id: '1',
          time: '07:30',
          label: '기상 알람',
          days: ['월', '화', '수', '목', '금'],
          enabled: true,
          sound: 'default'
        },
        {
          id: '2',
          time: '21:00',
          label: '수면 알람',
          days: ['매일'],
          enabled: true,
          sound: 'gentle'
        }
      ])
      return
    }

    // Load from localStorage
    const saved = localStorage.getItem('miniFunction_alarms')
    if (saved) {
      setAlarms(JSON.parse(saved))
    }
  }, [isPreviewOnly])

  const saveToStorage = (newAlarms: Alarm[]) => {
    localStorage.setItem('miniFunction_alarms', JSON.stringify(newAlarms))
    setAlarms(newAlarms)
  }

  const toggleAlarm = (id: string) => {
    const updated = alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    )
    saveToStorage(updated)
  }

  const deleteAlarm = (id: string) => {
    const updated = alarms.filter(alarm => alarm.id !== id)
    saveToStorage(updated)
  }

  const getNextAlarmTime = (): Alarm | null => {
    const enabledAlarms = alarms.filter(alarm => alarm.enabled)
    if (enabledAlarms.length === 0) return null

    const now = new Date()
    let nextAlarm: Alarm | null = null
    let minDiff = Infinity

    enabledAlarms.forEach(alarm => {
      const [hours, minutes] = alarm.time.split(':').map(Number)
      const alarmTime = new Date()
      alarmTime.setHours(hours, minutes, 0, 0)

      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1)
      }

      const diff = alarmTime.getTime() - now.getTime()
      if (diff < minDiff) {
        minDiff = diff
        nextAlarm = alarm
      }
    })

    return nextAlarm
  }

  const formatTimeUntilNext = (alarm: Alarm | null) => {
    if (!alarm) return ''
    
    const now = new Date()
    const [hours, minutes] = alarm.time.split(':').map(Number)
    const alarmTime = new Date()
    alarmTime.setHours(hours, minutes, 0, 0)

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1)
    }

    const diff = alarmTime.getTime() - now.getTime()
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60))
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hoursLeft > 0) {
      return `${hoursLeft}시간 ${minutesLeft}분 후`
    }
    return `${minutesLeft}분 후`
  }

  const nextAlarm = getNextAlarmTime()
  const enabledCount = alarms.filter(alarm => alarm.enabled).length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">알람 현황</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">활성 알람: </span>
            <span className="text-white font-medium">{enabledCount}개</span>
          </div>
          <div>
            <span className="text-gray-400">전체 알람: </span>
            <span className="text-white font-medium">{alarms.length}개</span>
          </div>
        </div>
        {nextAlarm && (
          <div className="mt-2 text-xs text-blue-400">
            다음 알람: {nextAlarm.time} ({formatTimeUntilNext(nextAlarm)})
          </div>
        )}
      </div>

      {/* Add Alarm Info */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
        <div className="text-sm text-blue-400 mb-1">알람 설정</div>
        <div className="text-xs text-gray-300">
          톱니바퀴 → Mini Function Control에서 알람을 추가하고 설정할 수 있습니다.
        </div>
      </div>

      {/* Alarms List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {alarms.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            설정된 알람이 없습니다
          </div>
        ) : (
          alarms.map(alarm => (
            <div key={alarm.id} className="flex items-center justify-between py-3 px-3 bg-gray-800/40 rounded border border-gray-700/20">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${alarm.enabled ? 'text-white' : 'text-gray-500'}`}>
                    {alarm.time}
                  </span>
                  {alarm.enabled && (
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  )}
                </div>
                <div className={`text-xs ${alarm.enabled ? 'text-gray-300' : 'text-gray-500'}`}>
                  {alarm.label}
                </div>
                {alarm.days.length > 0 && (
                  <div className={`text-xs mt-1 ${alarm.enabled ? 'text-gray-400' : 'text-gray-600'}`}>
                    {alarm.days.join(', ')}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlarm(alarm.id)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    alarm.enabled ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    alarm.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  className="text-gray-500 hover:text-red-400 text-xs ml-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}