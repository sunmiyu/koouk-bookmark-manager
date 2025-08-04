'use client'

import { useState, useEffect } from 'react'

interface DiaryEntry {
  id: string
  content: string
  date: string
  createdAt: string
  updatedAt: string
}

interface DayData {
  date: Date
  label: string
  isToday: boolean
}

export default function ScrollableDiaryCards() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const MAX_CHARS = 500

  // 오늘을 중심으로 ±3일 범위의 날짜 생성 (Todo와 동일)
  const generateDays = (): DayData[] => {
    const days: DayData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      let label = ''
      if (i === 0) {
        label = "Today's"
      } else {
        const month = date.getMonth() + 1
        const day = date.getDate()
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
        label = `${month}/${day} ${dayOfWeek}`
      }
      
      days.push({
        date: new Date(date),
        label,
        isToday: i === 0
      })
    }
    
    return days
  }

  const days = generateDays()

  // 로컬 스토리지에서 일기 데이터 로드
  useEffect(() => {
    const savedEntries = localStorage.getItem('diaryEntries')
    if (savedEntries) {
      try {
        setDiaryEntries(JSON.parse(savedEntries))
      } catch (error) {
        console.error('Failed to load diary entries:', error)
      }
    }
  }, [])

  // 일기 데이터 저장
  const saveDiaryEntries = (entries: DiaryEntry[]) => {
    setDiaryEntries(entries)
    localStorage.setItem('diaryEntries', JSON.stringify(entries))
  }

  // 선택된 날짜의 일기 가져오기
  const getSelectedDateEntry = (): DiaryEntry | null => {
    const selectedDateStr = selectedDate.toDateString()
    return diaryEntries.find(entry => entry.date === selectedDateStr) || null
  }

  // 일기 저장
  const saveDiary = () => {
    if (currentEntry.trim() === '') {
      // 빈 내용이면 기존 엔트리 삭제
      const selectedDateStr = selectedDate.toDateString()
      const updatedEntries = diaryEntries.filter(entry => entry.date !== selectedDateStr)
      saveDiaryEntries(updatedEntries)
    } else {
      const selectedDateStr = selectedDate.toDateString()
      const existingEntryIndex = diaryEntries.findIndex(entry => entry.date === selectedDateStr)
      
      if (existingEntryIndex >= 0) {
        // 기존 엔트리 업데이트
        const updatedEntries = [...diaryEntries]
        updatedEntries[existingEntryIndex] = {
          ...updatedEntries[existingEntryIndex],
          content: currentEntry.trim(),
          updatedAt: new Date().toISOString()
        }
        saveDiaryEntries(updatedEntries)
      } else {
        // 새 엔트리 생성
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          content: currentEntry.trim(),
          date: selectedDateStr,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        saveDiaryEntries([...diaryEntries, newEntry])
      }
    }
    
    setIsEditing(false)
  }

  // 날짜 변경 시 현재 일기 내용 로드
  useEffect(() => {
    const entry = getSelectedDateEntry()
    setCurrentEntry(entry?.content || '')
    setCharCount(entry?.content?.length || 0)
    setIsEditing(false)
  }, [selectedDate, diaryEntries])

  // 텍스트 변경 핸들러
  const handleTextChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setCurrentEntry(value)
      setCharCount(value.length)
    }
  }

  const selectedEntry = getSelectedDateEntry()
  const isToday = selectedDate.toDateString() === new Date().toDateString()

  return (
    <div className="mb-4">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800/50">
        
        {/* 좌우 스크롤 날짜 선택 (Todo와 동일) */}
        <div className="mb-6">
          <div className="flex overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`flex-shrink-0 px-4 py-2 mx-1 rounded-lg text-sm font-medium transition-all ${
                  selectedDate.toDateString() === day.date.toDateString()
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Diary 내용 */}
        <div className="space-y-4">
          {/* 편집 모드 또는 내용 표시 */}
          {isEditing || (!selectedEntry && isToday) ? (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={currentEntry}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full h-40 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  placeholder={`Write your thoughts for ${selectedDate.toDateString() === new Date().toDateString() ? 'today' : 'this day'}...`}
                  autoFocus
                />
                <div className={`absolute bottom-2 right-2 text-xs ${
                  charCount > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-gray-500'
                }`}>
                  {charCount}/{MAX_CHARS}
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    const entry = getSelectedDateEntry()
                    setCurrentEntry(entry?.content || '')
                    setCharCount(entry?.content?.length || 0)
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDiary}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedEntry ? (
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <div className="text-white whitespace-pre-wrap leading-relaxed">
                    {selectedEntry.content}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-600/30">
                    <div className="text-xs text-gray-500">
                      {selectedEntry.updatedAt !== selectedEntry.createdAt ? 'Updated' : 'Created'}: {' '}
                      {new Date(selectedEntry.updatedAt).toLocaleString()}
                    </div>
                    {isToday && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  {isToday ? (
                    <div className="space-y-3">
                      <div>No diary entry for today.</div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/30 transition-colors"
                      >
                        Start Writing
                      </button>
                    </div>
                  ) : (
                    <div>No diary entry for this date.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}