'use client'

import { useState, useEffect } from 'react'

interface TimeZone {
  id: string
  name: string
  city: string
  timezone: string
  offset: number
  isActive: boolean
}

export default function WorldTimeControlPanel() {
  const [timeZones, setTimeZones] = useState<TimeZone[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTimeZone, setNewTimeZone] = useState({
    name: '',
    city: '',
    timezone: 'UTC',
    offset: 0
  })

  const popularTimeZones = [
    { name: '서울', city: 'Seoul', timezone: 'Asia/Seoul', offset: 9 },
    { name: '도쿄', city: 'Tokyo', timezone: 'Asia/Tokyo', offset: 9 },
    { name: '베이징', city: 'Beijing', timezone: 'Asia/Shanghai', offset: 8 },
    { name: '홍콩', city: 'Hong Kong', timezone: 'Asia/Hong_Kong', offset: 8 },
    { name: '싱가포르', city: 'Singapore', timezone: 'Asia/Singapore', offset: 8 },
    { name: '뭄바이', city: 'Mumbai', timezone: 'Asia/Kolkata', offset: 5.5 },
    { name: '두바이', city: 'Dubai', timezone: 'Asia/Dubai', offset: 4 },
    { name: '모스크바', city: 'Moscow', timezone: 'Europe/Moscow', offset: 3 },
    { name: '런던', city: 'London', timezone: 'Europe/London', offset: 0 },
    { name: '파리', city: 'Paris', timezone: 'Europe/Paris', offset: 1 },
    { name: '베를린', city: 'Berlin', timezone: 'Europe/Berlin', offset: 1 },
    { name: '로마', city: 'Rome', timezone: 'Europe/Rome', offset: 1 },
    { name: '뉴욕', city: 'New York', timezone: 'America/New_York', offset: -5 },
    { name: '시카고', city: 'Chicago', timezone: 'America/Chicago', offset: -6 },
    { name: '덴버', city: 'Denver', timezone: 'America/Denver', offset: -7 },
    { name: '로스앤젤레스', city: 'Los Angeles', timezone: 'America/Los_Angeles', offset: -8 },
    { name: '시드니', city: 'Sydney', timezone: 'Australia/Sydney', offset: 11 },
    { name: '멜버른', city: 'Melbourne', timezone: 'Australia/Melbourne', offset: 11 },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('miniFunction_worldTime')
    if (saved) {
      setTimeZones(JSON.parse(saved))
    } else {
      // Set default time zones
      const defaultZones: TimeZone[] = [
        { id: '1', name: '서울', city: 'Seoul', timezone: 'Asia/Seoul', offset: 9, isActive: true },
        { id: '2', name: '뉴욕', city: 'New York', timezone: 'America/New_York', offset: -5, isActive: true },
        { id: '3', name: '런던', city: 'London', timezone: 'Europe/London', offset: 0, isActive: true },
        { id: '4', name: '도쿄', city: 'Tokyo', timezone: 'Asia/Tokyo', offset: 9, isActive: false }
      ]
      setTimeZones(defaultZones)
      localStorage.setItem('miniFunction_worldTime', JSON.stringify(defaultZones))
    }
  }, [])

  const saveToStorage = (newTimeZones: TimeZone[]) => {
    localStorage.setItem('miniFunction_worldTime', JSON.stringify(newTimeZones))
    setTimeZones(newTimeZones)
  }

  const addTimeZone = () => {
    if (!newTimeZone.name.trim() || !newTimeZone.city.trim()) return

    const timeZone: TimeZone = {
      id: Date.now().toString(),
      name: newTimeZone.name.trim(),
      city: newTimeZone.city.trim(),
      timezone: newTimeZone.timezone,
      offset: newTimeZone.offset,
      isActive: true
    }

    const updated = [...timeZones, timeZone]
    saveToStorage(updated)
    
    setNewTimeZone({
      name: '',
      city: '',
      timezone: 'UTC',
      offset: 0
    })
    setShowAddForm(false)
  }

  const addPopularTimeZone = (popular: typeof popularTimeZones[0]) => {
    // Check if already exists
    const exists = timeZones.some(tz => tz.timezone === popular.timezone)
    if (exists) {
      alert('이미 추가된 시간대입니다.')
      return
    }

    const timeZone: TimeZone = {
      id: Date.now().toString(),
      name: popular.name,
      city: popular.city,
      timezone: popular.timezone,
      offset: popular.offset,
      isActive: true
    }

    const updated = [...timeZones, timeZone]
    saveToStorage(updated)
  }

  const toggleTimeZone = (id: string) => {
    const updated = timeZones.map(tz =>
      tz.id === id ? { ...tz, isActive: !tz.isActive } : tz
    )
    saveToStorage(updated)
  }

  const deleteTimeZone = (id: string) => {
    if (confirm('이 시간대를 삭제하시겠습니까?')) {
      const updated = timeZones.filter(tz => tz.id !== id)
      saveToStorage(updated)
    }
  }

  const formatCurrentTime = (offset: number) => {
    const now = new Date()
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    const localTime = new Date(utc + (offset * 3600000))
    
    return localTime.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const getTimeDifference = (offset: number) => {
    const seoulOffset = 9
    const diff = offset - seoulOffset
    
    if (diff === 0) return '기준시간'
    const sign = diff > 0 ? '+' : ''
    return `${sign}${diff}시간`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">세계시간 관리</h3>
          <p className="text-sm text-gray-600">표시할 시간대를 선택하고 관리하세요</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showAddForm ? '취소' : '+ 시간대 추가'}
        </button>
      </div>

      {/* Popular Time Zones */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">인기 시간대</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {popularTimeZones.map(popular => {
            const exists = timeZones.some(tz => tz.timezone === popular.timezone)
            return (
              <button
                key={popular.timezone}
                onClick={() => !exists && addPopularTimeZone(popular)}
                disabled={exists}
                className={`p-2 text-left text-sm rounded transition-colors ${
                  exists 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer'
                }`}
              >
                <div className="font-medium">{popular.name}</div>
                <div className="text-xs text-gray-500">
                  {getTimeDifference(popular.offset)}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <h4 className="text-md font-medium text-gray-900">직접 시간대 추가</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">표시명</label>
              <input
                type="text"
                placeholder="예: 서울, 뉴욕"
                value={newTimeZone.name}
                onChange={(e) => setNewTimeZone(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">도시명</label>
              <input
                type="text"
                placeholder="예: Seoul, New York"
                value={newTimeZone.city}
                onChange={(e) => setNewTimeZone(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시간대</label>
              <select
                value={newTimeZone.timezone}
                onChange={(e) => setNewTimeZone(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Seoul">Asia/Seoul</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">UTC 시차</label>
              <input
                type="number"
                min="-12"
                max="14"
                step="0.5"
                value={newTimeZone.offset}
                onChange={(e) => setNewTimeZone(prev => ({ ...prev, offset: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
          </div>

          <button
            onClick={addTimeZone}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            시간대 저장
          </button>
        </div>
      )}

      {/* Current Time Zones */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900">설정된 시간대</h4>
        
        {timeZones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 설정된 시간대가 없습니다
          </div>
        ) : (
          timeZones.map(timezone => (
            <div key={timezone.id} className={`bg-white border border-gray-200 rounded-lg p-4 ${
              !timezone.isActive ? 'opacity-50' : ''
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {timezone.name}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        timezone.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {timezone.isActive ? '표시' : '숨김'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {timezone.city} • {getTimeDifference(timezone.offset)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {timezone.timezone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrentTime(timezone.offset)}
                    </div>
                    <div className="text-xs text-gray-500">
                      현재 시간
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleTimeZone(timezone.id)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      timezone.isActive 
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                        : 'bg-green-200 hover:bg-green-300 text-green-700'
                    }`}
                  >
                    {timezone.isActive ? '숨기기' : '표시'}
                  </button>
                  <button
                    onClick={() => deleteTimeZone(timezone.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Time Zone Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">시간대 정보</h4>
            <p className="text-sm text-blue-700">
              시간대는 실시간으로 업데이트되며, 서머타임은 자동으로 적용되지 않습니다.
              정확한 시간은 해당 지역의 공식 시간을 확인해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}