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

export default function AlarmControlPanel() {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAlarm, setNewAlarm] = useState({
    time: '',
    label: '',
    days: [] as string[],
    sound: 'bell'
  })

  const daysOfWeek = [
    { id: 'mon', label: '월', fullName: '월요일' },
    { id: 'tue', label: '화', fullName: '화요일' },
    { id: 'wed', label: '수', fullName: '수요일' },
    { id: 'thu', label: '목', fullName: '목요일' },
    { id: 'fri', label: '금', fullName: '금요일' },
    { id: 'sat', label: '토', fullName: '토요일' },
    { id: 'sun', label: '일', fullName: '일요일' }
  ]

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('miniFunction_alarms')
    if (saved) {
      setAlarms(JSON.parse(saved))
    }
  }, [])

  const saveToStorage = (newAlarms: Alarm[]) => {
    localStorage.setItem('miniFunction_alarms', JSON.stringify(newAlarms))
    setAlarms(newAlarms)
  }

  const addAlarm = () => {
    if (!newAlarm.time.trim() || !newAlarm.label.trim()) return

    const alarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarm.time,
      label: newAlarm.label,
      days: newAlarm.days,
      enabled: true,
      sound: newAlarm.sound
    }

    const updated = [...alarms, alarm].sort((a, b) => a.time.localeCompare(b.time))
    saveToStorage(updated)
    
    setNewAlarm({
      time: '',
      label: '',
      days: [],
      sound: 'bell'
    })
    setShowAddForm(false)
  }

  const deleteAlarm = (id: string) => {
    if (confirm('이 알람을 삭제하시겠습니까?')) {
      const updated = alarms.filter(alarm => alarm.id !== id)
      saveToStorage(updated)
    }
  }

  const toggleAlarm = (id: string) => {
    const updated = alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    )
    saveToStorage(updated)
  }

  const toggleDay = (day: string) => {
    const updated = newAlarm.days.includes(day)
      ? newAlarm.days.filter(d => d !== day)
      : [...newAlarm.days, day]
    setNewAlarm(prev => ({ ...prev, days: updated }))
  }

  const getDayLabels = (days: string[]) => {
    if (days.length === 0) return '한번만'
    if (days.length === 7) return '매일'
    return days.map(day => daysOfWeek.find(d => d.id === day)?.label).join(', ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">알람 관리</h3>
          <p className="text-sm text-gray-600">알람을 추가하고 관리하세요</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showAddForm ? '취소' : '+ 알람 추가'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시간</label>
              <input
                type="time"
                value={newAlarm.time}
                onChange={(e) => setNewAlarm(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">라벨</label>
              <input
                type="text"
                placeholder="예: 기상 알람"
                value={newAlarm.label}
                onChange={(e) => setNewAlarm(prev => ({ ...prev, label: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">반복 요일</label>
            <div className="flex gap-2">
              {daysOfWeek.map(day => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                    newAlarm.days.includes(day.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">선택하지 않으면 한번만 울립니다</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">알람음</label>
            <select
              value={newAlarm.sound}
              onChange={(e) => setNewAlarm(prev => ({ ...prev, sound: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
            >
              <option value="bell">🔔 벨소리</option>
              <option value="chime">🎵 차임벨</option>
              <option value="buzz">📳 진동</option>
            </select>
          </div>

          <button
            onClick={addAlarm}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            알람 저장
          </button>
        </div>
      )}

      {/* Alarms List */}
      <div className="space-y-3">
        {alarms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 설정된 알람이 없습니다
          </div>
        ) : (
          alarms.map(alarm => (
            <div key={alarm.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${alarm.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                    {alarm.time}
                  </span>
                  {alarm.enabled && (
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  )}
                </div>
                <div className={`text-sm mt-1 ${alarm.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
                  {alarm.label}
                </div>
                <div className={`text-xs mt-1 ${alarm.enabled ? 'text-gray-500' : 'text-gray-400'}`}>
                  {getDayLabels(alarm.days)} • {alarm.sound === 'bell' ? '🔔 벨소리' : alarm.sound === 'chime' ? '🎵 차임벨' : '📳 진동'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleAlarm(alarm.id)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    alarm.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                    alarm.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}