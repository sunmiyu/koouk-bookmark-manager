'use client'

import { useState, useEffect } from 'react'

interface StudySession {
  id: string
  date: string
  wordsStudied: number
  timeSpent: number // minutes
  level: string
  completedLessons: string[]
}

interface Vocabulary {
  id: string
  word: string
  meaning: string
  pronunciation?: string
  example?: string
  level: string
  masteryLevel: number // 0-5
  lastReviewed: string
  reviewCount: number
}

export default function EnglishStudyFunction() {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([])
  const [currentLevel, setCurrentLevel] = useState('A1')

  useEffect(() => {
    const savedSessions = localStorage.getItem('miniFunction_englishSessions')
    const savedVocab = localStorage.getItem('miniFunction_englishVocab')
    const savedLevel = localStorage.getItem('miniFunction_englishLevel')
    
    if (savedSessions) setSessions(JSON.parse(savedSessions))
    if (savedVocab) setVocabulary(JSON.parse(savedVocab))
    if (savedLevel) setCurrentLevel(savedLevel)
  }, [])

  const getTodaySession = () => {
    const today = new Date().toISOString().split('T')[0]
    return sessions.find(session => session.date === today)
  }

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const weekSessions = sessions.filter(session => 
      new Date(session.date) >= oneWeekAgo
    )
    
    const totalWords = weekSessions.reduce((sum, session) => sum + session.wordsStudied, 0)
    const totalTime = weekSessions.reduce((sum, session) => sum + session.timeSpent, 0)
    const studyDays = weekSessions.length
    
    return { totalWords, totalTime, studyDays }
  }

  const getStreakDays = () => {
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    let streak = 0
    let currentDate = new Date()
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date)
      const dayDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayDiff === streak) {
        streak++
        currentDate = sessionDate
      } else if (dayDiff > streak) {
        break
      }
    }
    
    return streak
  }

  const getVocabularyStats = () => {
    const total = vocabulary.length
    const mastered = vocabulary.filter(word => word.masteryLevel >= 4).length
    const learning = vocabulary.filter(word => word.masteryLevel >= 2 && word.masteryLevel < 4).length
    const new_ = vocabulary.filter(word => word.masteryLevel < 2).length
    
    return { total, mastered, learning, new: new_ }
  }

  const getLevelProgress = () => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const currentIndex = levels.indexOf(currentLevel)
    const progress = (currentIndex / (levels.length - 1)) * 100
    
    return { currentIndex, progress, nextLevel: levels[currentIndex + 1] }
  }

  const getRecentWords = () => {
    return vocabulary
      .filter(word => {
        const lastReviewed = new Date(word.lastReviewed)
        const today = new Date()
        const dayDiff = Math.floor((today.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24))
        return dayDiff <= 7
      })
      .sort((a, b) => new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime())
      .slice(0, 5)
  }

  const todaySession = getTodaySession()
  const weeklyStats = getWeeklyStats()
  const streakDays = getStreakDays()
  const vocabStats = getVocabularyStats()
  const levelProgress = getLevelProgress()
  const recentWords = getRecentWords()

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'A1': return '🟢'
      case 'A2': return '🔵'
      case 'B1': return '🟡'
      case 'B2': return '🟠'
      case 'C1': return '🔴'
      case 'C2': return '🟣'
      default: return '📚'
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Level & Progress */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getLevelIcon(currentLevel)}</span>
            <span className="text-sm font-medium text-white">현재 레벨: {currentLevel}</span>
          </div>
          {levelProgress.nextLevel && (
            <span className="text-xs text-gray-400">다음: {levelProgress.nextLevel}</span>
          )}
        </div>
        <div className="w-full bg-gray-700/30 rounded-full h-2">
          <div 
            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${levelProgress.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Today's Study */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">오늘의 학습</div>
        {todaySession ? (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400">학습 단어: </span>
              <span className="text-white font-medium">{todaySession.wordsStudied}개</span>
            </div>
            <div>
              <span className="text-gray-400">학습 시간: </span>
              <span className="text-white font-medium">{todaySession.timeSpent}분</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-400">아직 오늘 학습을 시작하지 않았습니다</div>
        )}
      </div>

      {/* Weekly Stats */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">이번 주 통계</div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-gray-400">연속 학습: </span>
            <span className="text-white font-medium">{streakDays}일</span>
          </div>
          <div>
            <span className="text-gray-400">총 단어: </span>
            <span className="text-white font-medium">{weeklyStats.totalWords}개</span>
          </div>
          <div>
            <span className="text-gray-400">총 시간: </span>
            <span className="text-white font-medium">{weeklyStats.totalTime}분</span>
          </div>
        </div>
      </div>

      {/* Vocabulary Stats */}
      <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
        <div className="text-sm text-green-400 mb-2">단어장 현황</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">전체 단어: </span>
            <span className="text-white font-medium">{vocabStats.total}개</span>
          </div>
          <div>
            <span className="text-gray-400">암기 완료: </span>
            <span className="text-white font-medium">{vocabStats.mastered}개</span>
          </div>
          <div>
            <span className="text-gray-400">학습 중: </span>
            <span className="text-white font-medium">{vocabStats.learning}개</span>
          </div>
          <div>
            <span className="text-gray-400">신규 단어: </span>
            <span className="text-white font-medium">{vocabStats.new}개</span>
          </div>
        </div>
      </div>

      {/* Settings Info */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
        <div className="text-sm text-blue-400 mb-1">영어 학습 설정</div>
        <div className="text-xs text-gray-300">
          톱니바퀴 → Mini Function Control에서 학습 계획과 목표를 설정할 수 있습니다.
        </div>
      </div>

      {/* Recent Words */}
      {recentWords.length > 0 && (
        <div>
          <div className="text-sm font-medium text-white mb-2">최근 학습한 단어</div>
          <div className="space-y-2">
            {recentWords.map(word => (
              <div key={word.id} className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {word.word}
                    </div>
                    <div className="text-xs text-gray-400">
                      {word.meaning}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < word.masteryLevel ? 'bg-green-400' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Goal Progress */}
      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
        <div className="text-sm text-yellow-400 mb-2">일일 목표</div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">단어 학습 목표</span>
            <span className="text-white">{todaySession?.wordsStudied || 0} / 20개</span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-1.5">
            <div 
              className="bg-yellow-400 h-1.5 rounded-full"
              style={{ width: `${Math.min(((todaySession?.wordsStudied || 0) / 20) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {sessions.length === 0 && vocabulary.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          영어 학습을 시작해보세요
        </div>
      )}
    </div>
  )
}