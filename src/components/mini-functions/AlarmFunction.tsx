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
  const [editingAlarm, setEditingAlarm] = useState<AlarmData | null>(null)
  const [editForm, setEditForm] = useState({ time: '', label: '', enabled: true })
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [showPWAPrompt, setShowPWAPrompt] = useState(false)

  // Request notification permission and check PWA status
  useEffect(() => {
    if (!isPreviewOnly && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true)
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setPermissionGranted(permission === 'granted')
        })
      }
    }

    // Check if PWA is installed
    if ('standalone' in window.navigator && window.navigator.standalone) {
      setIsPWAInstalled(true) // iOS
    } else if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true) // Android
    }

    // Show PWA prompt if alarms exist but not installed
    if (!isPWAInstalled && alarms.length > 0) {
      setShowPWAPrompt(true)
    }
  }, [isPreviewOnly, alarms.length, isPWAInstalled])

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

  // Alarm check interval
  useEffect(() => {
    if (isPreviewOnly || alarms.length === 0) return

    const checkAlarms = () => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime) {
          triggerAlarm(alarm)
        }
      })
    }

    // Check every minute
    const interval = setInterval(checkAlarms, 60000)
    
    // Also check immediately
    checkAlarms()

    return () => clearInterval(interval)
  }, [alarms, isPreviewOnly, permissionGranted]) // triggerAlarm은 의존성에서 제거 (함수 내부에서 정의됨)

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
  }, [user])


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

  const triggerAlarm = async (alarm: AlarmData) => {
    console.log('Alarm triggered:', alarm)
    
    // Play alarm sound
    try {
      const audio = new Audio('/alarm.mp3') // You'll need to add this file to public folder
      audio.volume = 0.7
      audio.play().catch(err => {
        console.warn('Could not play alarm sound:', err)
      })
    } catch (err) {
      console.warn('Audio not supported:', err)
    }

    // Show browser notification
    if (permissionGranted && 'Notification' in window) {
      const notification = new Notification(`⏰ ${alarm.label}`, {
        body: `시간이 되었습니다! (${alarm.time})`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `alarm-${alarm.id}`, // Prevent duplicate notifications
        requireInteraction: true, // Keep notification until user interacts
      })

      // Auto-close after 30 seconds
      setTimeout(() => {
        notification.close()
      }, 30000)

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }

    // Fallback: Alert if notifications not supported
    if (!permissionGranted) {
      alert(`⏰ 알람: ${alarm.label}\n시간: ${alarm.time}`)
    }

    // Optionally disable the alarm after triggering (like a one-time alarm)
    // You can uncomment this if you want alarms to auto-disable
    /*
    try {
      if (user) {
        await alarmsService.update(alarm.id, { enabled: false })
      }
      setAlarms(prev => prev.map(a => 
        a.id === alarm.id ? { ...a, enabled: false } : a
      ))
      const updatedAlarms = alarms.map(a => 
        a.id === alarm.id ? { ...a, enabled: false } : a
      )
      localStorage.setItem('koouk_alarms', JSON.stringify(updatedAlarms))
      findNextAlarm(updatedAlarms)
    } catch (error) {
      console.error('Failed to disable alarm:', error)
    }
    */
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

  const startEditAlarm = (alarm: AlarmData) => {
    setEditingAlarm(alarm)
    setEditForm({
      time: alarm.time,
      label: alarm.label,
      enabled: alarm.enabled
    })
  }

  const saveEditAlarm = async () => {
    if (!editingAlarm || !editForm.time || !editForm.label) return

    try {
      setLoading(true)
      
      if (user) {
        // Update in Supabase
        await alarmsService.update(editingAlarm.id, {
          time: editForm.time,
          label: editForm.label,
          enabled: editForm.enabled
        })
      }

      // Update local state
      setAlarms(prev => prev.map(alarm => 
        alarm.id === editingAlarm.id 
          ? { ...alarm, ...editForm }
          : alarm
      ))

      // Update localStorage
      const updatedAlarms = alarms.map(alarm => 
        alarm.id === editingAlarm.id 
          ? { ...alarm, ...editForm }
          : alarm
      )
      localStorage.setItem('koouk_alarms', JSON.stringify(updatedAlarms))
      
      findNextAlarm(updatedAlarms)
      setEditingAlarm(null)
    } catch (error) {
      console.error('Failed to update alarm:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAlarm = async (alarmId: string) => {
    if (!confirm('이 알람을 삭제하시겠습니까?')) return

    try {
      setLoading(true)
      
      if (user) {
        // Delete from Supabase
        await alarmsService.delete(alarmId)
      }

      // Update local state
      const updatedAlarms = alarms.filter(alarm => alarm.id !== alarmId)
      setAlarms(updatedAlarms)

      // Update localStorage
      localStorage.setItem('koouk_alarms', JSON.stringify(updatedAlarms))
      
      findNextAlarm(updatedAlarms)
    } catch (error) {
      console.error('Failed to delete alarm:', error)
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
        <div key={alarm.id} className="flex justify-between items-center group py-1">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">■</span>
            <span className="text-gray-300 font-medium">{alarm.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-gray-300 text-sm">
              {alarm.time} {alarm.enabled ? '(Active)' : '(Off)'}
              {!isPreviewOnly && !permissionGranted && (
                <span className="text-yellow-400 text-xs ml-1" title="Notification permission required">⚠️</span>
              )}
            </div>
            {!isPreviewOnly && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => startEditAlarm(alarm)}
                  disabled={loading}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm disabled:opacity-50"
                  title="Edit alarm"
                >
                  ✎
                </button>
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  disabled={loading}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm disabled:opacity-50"
                  title="Delete alarm"
                >
                  ✕
                </button>
              </div>
            )}
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

      {!isPreviewOnly && !permissionGranted && 'Notification' in window && (
        <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-600/50 rounded text-xs">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚠️</span>
            <span className="text-yellow-300">알림 권한이 필요합니다</span>
            <button
              onClick={() => {
                Notification.requestPermission().then(permission => {
                  setPermissionGranted(permission === 'granted')
                })
              }}
              className="text-blue-400 hover:text-blue-300 underline ml-auto"
            >
              허용
            </button>
          </div>
        </div>
      )}

      {!isPreviewOnly && showPWAPrompt && !isPWAInstalled && (
        <div className="mt-2 p-3 bg-blue-900/30 border border-blue-600/50 rounded text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">📱</span>
              <span className="text-blue-300 font-medium">더 나은 알람 경험을 위해</span>
              <button
                onClick={() => setShowPWAPrompt(false)}
                className="text-gray-400 hover:text-white ml-auto"
              >
                ✕
              </button>
            </div>
            <p className="text-blue-200 leading-relaxed">
              홈 화면에 앱을 설치하면 백그라운드 알림이 가능합니다
            </p>
            <div className="space-y-1 text-blue-200">
              <div className="font-medium">📱 설치 방법:</div>
              <div>• <strong>Android:</strong> Chrome 메뉴 → &quot;홈 화면에 추가&quot;</div>
              <div>• <strong>iOS:</strong> Safari 공유 버튼 → &quot;홈 화면에 추가&quot;</div>
            </div>
            <div className="text-green-400 text-xs mt-2">
              ✅ 설치 후: 앱처럼 실행되며 백그라운드 알림 지원
            </div>
          </div>
        </div>
      )}

      {!isPreviewOnly && isPWAInstalled && (
        <div className="mt-2 p-2 bg-green-900/30 border border-green-600/50 rounded text-xs">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✅</span>
            <span className="text-green-300">앱이 설치되었습니다! 백그라운드 알림이 지원됩니다.</span>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAlarm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">알람 편집</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">시간</label>
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">라벨</label>
                <input
                  type="text"
                  value={editForm.label}
                  onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="알람 이름"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editForm.enabled}
                  onChange={(e) => setEditForm(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="enabled" className="text-sm text-gray-300">활성화</label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingAlarm(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveEditAlarm}
                disabled={loading || !editForm.time || !editForm.label}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}