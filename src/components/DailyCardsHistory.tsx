'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTodayTodos } from '@/contexts/TodayTodosContext'

interface HistoryEntry {
  date: Date
  content: string
  hasContent: boolean
}

interface MonthGroup {
  monthLabel: string
  year: number
  month: number
  entries: HistoryEntry[]
  weeks: HistoryEntry[][]
}

interface DailyCardsHistoryProps {
  onClose: () => void
  onSelectDate: (date: Date) => void
}

export default function DailyCardsHistory({ onClose, onSelectDate }: DailyCardsHistoryProps) {
  const { diaryEntries, getSelectedDateEntry } = useTodayTodos()
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [viewType, setViewType] = useState<'month' | 'week'>('month')

  // 과거 12개월의 데이터 생성
  const historyData = useMemo(() => {
    const months: MonthGroup[] = []
    const today = new Date()
    
    for (let monthsBack = 0; monthsBack < 12; monthsBack++) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1)
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth()
      
      const monthLabel = targetDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
      
      const entries: HistoryEntry[] = []
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      
      // 해당 월의 모든 날짜에 대한 엔트리 생성
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        
        // 미래 날짜는 제외
        if (date > today) continue
        
        const content = getSelectedDateEntry(date)
        entries.push({
          date: new Date(date),
          content,
          hasContent: content.length > 0
        })
      }
      
      // 주 단위로 그룹핑
      const weeks: HistoryEntry[][] = []
      let currentWeek: HistoryEntry[] = []
      
      entries.forEach((entry, index) => {
        currentWeek.push(entry)
        
        // 일요일이거나 마지막 날이면 주 완성
        if (entry.date.getDay() === 0 || index === entries.length - 1) {
          weeks.push([...currentWeek])
          currentWeek = []
        }
      })
      
      months.push({
        monthLabel,
        year,
        month,
        entries: entries.reverse(), // 최신 순으로
        weeks
      })
    }
    
    return months
  }, [diaryEntries, getSelectedDateEntry])

  // 월 확장/축소 토글
  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey)
    } else {
      newExpanded.add(monthKey)
    }
    setExpandedMonths(newExpanded)
  }

  // 날짜 선택 핸들러
  const handleDateSelect = (date: Date) => {
    onSelectDate(date)
    onClose()
  }

  // 통계 계산
  const stats = useMemo(() => {
    const totalDays = historyData.reduce((sum, month) => sum + month.entries.length, 0)
    const daysWithContent = historyData.reduce((sum, month) => 
      sum + month.entries.filter(entry => entry.hasContent).length, 0
    )
    
    return {
      totalDays,
      daysWithContent,
      completionRate: totalDays > 0 ? Math.round((daysWithContent / totalDays) * 100) : 0
    }
  }, [historyData])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Daily Cards History</h2>
              <p className="text-gray-400">
                {stats.daysWithContent} days with entries out of {stats.totalDays} days 
                ({stats.completionRate}% completion rate)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* View Type Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewType === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewType === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Week View
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            {historyData.map((monthGroup) => {
              const monthKey = `${monthGroup.year}-${monthGroup.month}`
              const isExpanded = expandedMonths.has(monthKey)
              const entriesWithContent = monthGroup.entries.filter(e => e.hasContent)

              return (
                <div key={monthKey} className="bg-gray-800/50 rounded-xl overflow-hidden">
                  {/* Month Header */}
                  <button
                    onClick={() => toggleMonth(monthKey)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-800/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white">{monthGroup.monthLabel}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{entriesWithContent.length} entries</span>
                      <span>
                        {monthGroup.entries.length > 0 
                          ? Math.round((entriesWithContent.length / monthGroup.entries.length) * 100)
                          : 0}% completed
                      </span>
                    </div>
                  </button>

                  {/* Month Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      {viewType === 'month' ? (
                        /* Month Grid View */
                        <div className="grid grid-cols-7 gap-2">
                          {/* Day Headers */}
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                            <div key={day} className="p-2 text-xs text-gray-500 text-center font-medium">
                              {day}
                            </div>
                          ))}
                          
                          {/* Days */}
                          {monthGroup.entries.map((entry) => (
                            <button
                              key={entry.date.toISOString()}
                              onClick={() => handleDateSelect(entry.date)}
                              className={`p-2 text-sm rounded-lg transition-all hover:scale-105 ${
                                entry.hasContent
                                  ? 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30'
                                  : 'bg-gray-700/50 text-gray-500 hover:bg-gray-700'
                              }`}
                              title={entry.hasContent ? 'Has entry' : 'No entry'}
                            >
                              {entry.date.getDate()}
                              {entry.hasContent && (
                                <div className="w-1 h-1 bg-green-400 rounded-full mx-auto mt-1" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        /* Week List View */
                        <div className="space-y-3">
                          {monthGroup.weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex gap-2">
                              {week.map((entry) => (
                                <button
                                  key={entry.date.toISOString()}
                                  onClick={() => handleDateSelect(entry.date)}
                                  className={`flex-1 p-3 rounded-lg transition-all text-left ${
                                    entry.hasContent
                                      ? 'bg-green-600/20 border border-green-600/30 hover:bg-green-600/30'
                                      : 'bg-gray-700/50 hover:bg-gray-700'
                                  }`}
                                >
                                  <div className="text-sm font-medium text-white">
                                    {entry.date.getDate()}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {entry.date.toLocaleDateString('en-US', { weekday: 'short' })}
                                  </div>
                                  {entry.hasContent && (
                                    <div className="text-xs text-green-400 mt-1 truncate">
                                      {entry.content.substring(0, 30)}...
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}