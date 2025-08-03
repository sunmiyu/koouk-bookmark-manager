'use client'

import { useState, useEffect } from 'react'

interface ExerciseRecord {
  id: string
  date: string
  type: string
  duration: number // minutes
  calories?: number
  notes?: string
}

export default function ExerciseFunction() {
  const [records, setRecords] = useState<ExerciseRecord[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRecord, setNewRecord] = useState({
    type: '',
    duration: '',
    calories: '',
    notes: ''
  })

  const exerciseTypes = [
    '러닝', '걷기', '헬스', '수영', '자전거', '요가', '필라테스', '농구', '축구', '테니스', '배드민턴', '등산', '기타'
  ]

  useEffect(() => {
    const saved = localStorage.getItem('miniFunction_exercise')
    if (saved) {
      setRecords(JSON.parse(saved))
    }
  }, [])

  const saveToStorage = (newRecords: ExerciseRecord[]) => {
    localStorage.setItem('miniFunction_exercise', JSON.stringify(newRecords))
    setRecords(newRecords)
  }

  const addRecord = () => {
    if (!newRecord.type.trim() || !newRecord.duration) return

    const record: ExerciseRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: newRecord.type.trim(),
      duration: parseInt(newRecord.duration),
      calories: newRecord.calories ? parseInt(newRecord.calories) : undefined,
      notes: newRecord.notes.trim() || undefined
    }

    const updated = [record, ...records]
    saveToStorage(updated)
    
    setNewRecord({
      type: '',
      duration: '',
      calories: '',
      notes: ''
    })
    setShowAddForm(false)
  }

  const deleteRecord = (id: string) => {
    const updated = records.filter(record => record.id !== id)
    saveToStorage(updated)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    return `${diffDays}일 전`
  }

  // Statistics
  const today = new Date().toISOString().split('T')[0]
  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)
  
  const todayRecords = records.filter(r => r.date === today)
  const weekRecords = records.filter(r => new Date(r.date) >= thisWeek)
  
  const todayDuration = todayRecords.reduce((sum, r) => sum + r.duration, 0)
  const weekCount = weekRecords.length
  const totalCalories = weekRecords.reduce((sum, r) => sum + (r.calories || 0), 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">운동 현황</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">오늘: </span>
            <span className="text-white font-medium">{todayDuration}분</span>
          </div>
          <div>
            <span className="text-gray-400">이번 주: </span>
            <span className="text-white font-medium">{weekCount}회</span>
          </div>
        </div>
        {totalCalories > 0 && (
          <div className="mt-2 text-xs">
            <span className="text-gray-400">주간 칼로리: </span>
            <span className="text-orange-400 font-medium">{totalCalories}kcal</span>
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {showAddForm ? '취소' : '+ 운동 기록 추가'}
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newRecord.type}
              onChange={(e) => setNewRecord(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="">운동 종류 선택</option>
              {exerciseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <input
              type="number"
              placeholder="시간(분)"
              value={newRecord.duration}
              onChange={(e) => setNewRecord(prev => ({ ...prev, duration: e.target.value }))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <input
            type="number"
            placeholder="칼로리 (선택)"
            value={newRecord.calories}
            onChange={(e) => setNewRecord(prev => ({ ...prev, calories: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          />
          
          <textarea
            placeholder="메모 (선택)"
            value={newRecord.notes}
            onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full h-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
          />
          
          <button
            onClick={addRecord}
            className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors"
          >
            저장
          </button>
        </div>
      )}

      {/* Records List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {records.slice(0, 10).map(record => (
          <div key={record.id} className="bg-gray-800/40 rounded border border-gray-700/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{record.type}</span>
                <span className="text-xs px-2 py-0.5 bg-orange-600/20 text-orange-400 rounded">
                  {record.duration}분
                </span>
                {record.calories && (
                  <span className="text-xs px-2 py-0.5 bg-red-600/20 text-red-400 rounded">
                    {record.calories}kcal
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteRecord(record.id)}
                className="text-gray-500 hover:text-red-400 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-gray-400">
              {record.date} ({formatDate(record.date)})
            </div>
            {record.notes && (
              <div className="text-xs text-gray-300 mt-1 line-clamp-2">
                {record.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}