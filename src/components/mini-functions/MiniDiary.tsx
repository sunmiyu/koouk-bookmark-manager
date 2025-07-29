'use client'

import { useState, useEffect } from 'react'
import { DiaryEntry, DiaryData } from '@/types/miniFunctions'
import { diaryService } from '@/lib/supabase-services'
import { supabase } from '@/lib/supabase'

interface MiniDiaryProps {
  isPreviewOnly?: boolean
  showHistoryOnly?: boolean
}

export default function MiniDiary({ isPreviewOnly = false, showHistoryOnly = false }: MiniDiaryProps) {
  const [diaryData, setDiaryData] = useState<DiaryData>({
    recentEntries: []
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load diary data from Supabase
  useEffect(() => {
    if (isPreviewOnly) {
      // Sample data for preview
      setDiaryData({
        todayEntry: {
          id: 'sample',
          date: new Date().toISOString().split('T')[0],
          content: '새 프로젝트 회의에서 좋은 아이디어가 나왔다! 내일 구현해보자',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        recentEntries: [
          {
            id: 'sample1',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            content: '팀 회의에서 좋은 피드백을 받았다',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      })
      return
    }

    loadDiaryData()
  }, [isPreviewOnly])

  const loadDiaryData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Fallback to localStorage if not authenticated
        const today = new Date().toISOString().split('T')[0]
        const saved = localStorage.getItem('koouk_diary')
        if (saved) {
          const allEntries = JSON.parse(saved) as DiaryEntry[]
          const todayEntry = allEntries.find(entry => entry.date === today)
          const recentEntries = allEntries
            .filter(entry => entry.date !== today)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7)

          setDiaryData({ todayEntry, recentEntries })
          
          if (todayEntry) {
            setCurrentText(todayEntry.content)
          }
        }
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const entries = await diaryService.getAll(user.id)
      
      const diaryEntries: DiaryEntry[] = entries.map(entry => ({
        id: entry.id,
        date: entry.date || today,
        content: entry.content,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      }))

      const todayEntry = diaryEntries.find(entry => entry.date === today)
      const recentEntries = diaryEntries
        .filter(entry => entry.date !== today)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)

      setDiaryData({ todayEntry, recentEntries })

      if (todayEntry) {
        setCurrentText(todayEntry.content)
      } else {
        setCurrentText('')
      }
    } catch (error) {
      console.error('Failed to load diary:', error)
      // Fallback to localStorage
      const today = new Date().toISOString().split('T')[0]
      const saved = localStorage.getItem('koouk_diary')
      if (saved) {
        const allEntries = JSON.parse(saved) as DiaryEntry[]
        const todayEntry = allEntries.find(entry => entry.date === today)
        const recentEntries = allEntries
          .filter(entry => entry.date !== today)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 7)

        setDiaryData({ todayEntry, recentEntries })
        
        if (todayEntry) {
          setCurrentText(todayEntry.content)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const saveDiaryEntry = async () => {
    if (isPreviewOnly || !currentText.trim() || loading) return

    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()

      if (user) {
        // Save to Supabase
        let savedEntry
        
        if (diaryData.todayEntry) {
          // Update existing entry
          savedEntry = await diaryService.update(diaryData.todayEntry.id, {
            content: currentText.trim(),
            date: today
          })
        } else {
          // Create new entry
          savedEntry = await diaryService.create({
            user_id: user.id,
            content: currentText.trim(),
            date: today
          })
        }

        const newEntry: DiaryEntry = {
          id: savedEntry.id,
          date: savedEntry.date || today,
          content: savedEntry.content,
          createdAt: savedEntry.created_at,
          updatedAt: savedEntry.updated_at
        }

        // Update state
        setDiaryData(prev => ({
          todayEntry: newEntry,
          recentEntries: prev.recentEntries
        }))

        setCurrentText(newEntry.content)
      } else {
        // Fallback to localStorage
        const newEntry: DiaryEntry = {
          id: diaryData.todayEntry?.id || Date.now().toString(),
          date: today,
          content: currentText.trim(),
          createdAt: diaryData.todayEntry?.createdAt || now,
          updatedAt: now
        }

        const saved = localStorage.getItem('koouk_diary')
        let allEntries: DiaryEntry[] = []
        
        if (saved) {
          try {
            allEntries = JSON.parse(saved)
          } catch (error) {
            console.error('Failed to parse diary entries:', error)
          }
        }

        const existingIndex = allEntries.findIndex(entry => entry.date === today)
        if (existingIndex >= 0) {
          allEntries[existingIndex] = newEntry
        } else {
          allEntries.push(newEntry)
        }

        localStorage.setItem('koouk_diary', JSON.stringify(allEntries))

        const recentEntries = allEntries
          .filter(entry => entry.date !== today)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 7)

        setDiaryData({
          todayEntry: newEntry,
          recentEntries
        })

        setCurrentText(newEntry.content)
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save diary entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = () => {
    if (isPreviewOnly) return
    setIsEditing(true)
  }

  const cancelEditing = () => {
    if (diaryData.todayEntry) {
      setCurrentText(diaryData.todayEntry.content)
    } else {
      setCurrentText('')
    }
    setIsEditing(false)
  }

  const toggleExpanded = (entryId: string) => {
    if (isPreviewOnly) return
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 86400000)
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return '오늘'
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '어제'
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    }
  }

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Show only history if requested
  if (showHistoryOnly) {
    return (
      <div className="space-y-2">
        <div className="text-gray-400 text-sm">일기 기록</div>
        {diaryData.recentEntries.length > 0 ? (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {diaryData.recentEntries.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer"
                  onClick={() => toggleExpanded(entry.id)}
                >
                  <span className="text-gray-400 text-sm w-12">
                    {formatDate(entry.date)}
                  </span>
                  <span className="text-gray-300 text-sm flex-1">
                    {expandedEntryId === entry.id ? entry.content : truncateText(entry.content, 50)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {expandedEntryId === entry.id ? '⌃' : '⌄'}
                  </span>
                </div>
                {expandedEntryId === entry.id && (
                  <div className="p-3 bg-gray-800 rounded text-sm text-gray-300 leading-relaxed ml-2">
                    {entry.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            아직 일기가 없습니다
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Today's Entry */}
      <div className="space-y-2">

        {isEditing && !isPreviewOnly ? (
          <div className="space-y-2">
            {/* Text input */}
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="오늘의 감정, 기억하고싶은일을 기록하세요"
              className="w-full px-2 py-2 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 resize-none"
              rows={3}
              maxLength={200}
            />

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={saveDiaryEntry}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:opacity-50 cursor-pointer"
              >
                저장
              </button>
              <button
                onClick={cancelEditing}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={startEditing}
            className={`min-h-[60px] p-2 rounded border ${
              isPreviewOnly
                ? 'bg-gray-800 border-gray-600 cursor-not-allowed'
                : diaryData.todayEntry
                  ? 'bg-gray-800 border-gray-600 cursor-pointer hover:bg-gray-700'
                  : 'bg-gray-800 border-dashed border-gray-500 cursor-pointer hover:border-gray-400'
            }`}
          >
            {diaryData.todayEntry ? (
              <div className="space-y-1">
                <p className="text-white text-sm leading-relaxed">
                  {diaryData.todayEntry.content}
                </p>
                <div className="flex items-center justify-end">
                  <span className="text-gray-500 text-sm">
                    {new Date(diaryData.todayEntry.updatedAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-500 text-sm">
                  {isPreviewOnly ? '📝 Write your daily diary' : '오늘의 감정, 기억하고싶은일을 기록하세요'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}