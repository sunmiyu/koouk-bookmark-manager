'use client'

import { useState, useEffect } from 'react'

interface StudyPlan {
  id: string
  dailyWordGoal: number
  dailyTimeGoal: number // minutes
  targetLevel: string
  studyDays: string[] // ['monday', 'tuesday', ...]
  reminderTime: string
  isActive: boolean
}

interface StudySession {
  id: string
  date: string
  wordsStudied: number
  timeSpent: number
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

export default function EnglishStudyControlPanel() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null)
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([])
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [showAddWord, setShowAddWord] = useState(false)
  const [currentLevel, setCurrentLevel] = useState('A1')

  const [newPlan, setNewPlan] = useState({
    dailyWordGoal: 20,
    dailyTimeGoal: 30,
    targetLevel: 'B2',
    studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    reminderTime: '19:00'
  })

  const [newWord, setNewWord] = useState({
    word: '',
    meaning: '',
    pronunciation: '',
    example: '',
    level: 'A1'
  })

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const dayLabels = {
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일',
    saturday: '토요일',
    sunday: '일요일'
  }

  useEffect(() => {
    const savedPlan = localStorage.getItem('miniFunction_englishPlan')
    const savedSessions = localStorage.getItem('miniFunction_englishSessions')
    const savedVocab = localStorage.getItem('miniFunction_englishVocab')
    const savedLevel = localStorage.getItem('miniFunction_englishLevel')
    
    if (savedPlan) setStudyPlan(JSON.parse(savedPlan))
    if (savedSessions) setSessions(JSON.parse(savedSessions))
    if (savedVocab) setVocabulary(JSON.parse(savedVocab))
    if (savedLevel) setCurrentLevel(savedLevel)
  }, [])

  const savePlan = () => {
    const plan: StudyPlan = {
      id: studyPlan?.id || Date.now().toString(),
      ...newPlan,
      isActive: true
    }
    
    localStorage.setItem('miniFunction_englishPlan', JSON.stringify(plan))
    setStudyPlan(plan)
    setShowPlanForm(false)
  }

  const addWord = () => {
    if (!newWord.word.trim() || !newWord.meaning.trim()) return

    const word: Vocabulary = {
      id: Date.now().toString(),
      word: newWord.word.trim(),
      meaning: newWord.meaning.trim(),
      pronunciation: newWord.pronunciation.trim(),
      example: newWord.example.trim(),
      level: newWord.level,
      masteryLevel: 0,
      lastReviewed: new Date().toISOString(),
      reviewCount: 0
    }

    const updated = [...vocabulary, word]
    localStorage.setItem('miniFunction_englishVocab', JSON.stringify(updated))
    setVocabulary(updated)
    
    setNewWord({
      word: '',
      meaning: '',
      pronunciation: '',
      example: '',
      level: 'A1'
    })
    setShowAddWord(false)
  }

  const updateWordMastery = (id: string, level: number) => {
    const updated = vocabulary.map(word =>
      word.id === id 
        ? { 
            ...word, 
            masteryLevel: level, 
            lastReviewed: new Date().toISOString(),
            reviewCount: word.reviewCount + 1
          }
        : word
    )
    localStorage.setItem('miniFunction_englishVocab', JSON.stringify(updated))
    setVocabulary(updated)
  }

  const deleteWord = (id: string) => {
    if (confirm('이 단어를 삭제하시겠습니까?')) {
      const updated = vocabulary.filter(word => word.id !== id)
      localStorage.setItem('miniFunction_englishVocab', JSON.stringify(updated))
      setVocabulary(updated)
    }
  }

  const updateLevel = (level: string) => {
    localStorage.setItem('miniFunction_englishLevel', level)
    setCurrentLevel(level)
  }

  const logStudySession = () => {
    const today = new Date().toISOString().split('T')[0]
    const existingSession = sessions.find(s => s.date === today)
    
    if (existingSession) {
      alert('오늘은 이미 학습을 기록했습니다.')
      return
    }

    const wordsToday = Math.floor(Math.random() * 15) + 10 // 10-25 random words
    const timeToday = Math.floor(Math.random() * 30) + 20 // 20-50 random minutes

    const session: StudySession = {
      id: Date.now().toString(),
      date: today,
      wordsStudied: wordsToday,
      timeSpent: timeToday,
      level: currentLevel,
      completedLessons: [`lesson-${Date.now()}`]
    }

    const updated = [...sessions, session]
    localStorage.setItem('miniFunction_englishSessions', JSON.stringify(updated))
    setSessions(updated)
  }

  const getDayToggle = (day: string) => {
    return newPlan.studyDays.includes(day)
  }

  const toggleDay = (day: string) => {
    const days = getDayToggle(day)
      ? newPlan.studyDays.filter(d => d !== day)
      : [...newPlan.studyDays, day]
    
    setNewPlan(prev => ({ ...prev, studyDays: days }))
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800'
      case 'A2': return 'bg-blue-100 text-blue-800'
      case 'B1': return 'bg-yellow-100 text-yellow-800'
      case 'B2': return 'bg-orange-100 text-orange-800'
      case 'C1': return 'bg-red-100 text-red-800'
      case 'C2': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">영어 학습 관리</h3>
          <p className="text-sm text-gray-600">학습 계획을 세우고 진행상황을 추적하세요</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddWord(!showAddWord)}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + 단어 추가
          </button>
          <button
            onClick={() => setShowPlanForm(!showPlanForm)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {studyPlan ? '계획 수정' : '계획 설정'}
          </button>
        </div>
      </div>

      {/* Current Level */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-900">현재 영어 레벨</h4>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(currentLevel)}`}>
            {currentLevel}
          </span>
        </div>
        <div className="flex gap-2">
          {levels.map(level => (
            <button
              key={level}
              onClick={() => updateLevel(level)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currentLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Study Plan Form */}
      {showPlanForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <h4 className="text-md font-medium text-gray-900">학습 계획 설정</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">일일 단어 목표</label>
              <input
                type="number"
                min="1"
                max="100"
                value={newPlan.dailyWordGoal}
                onChange={(e) => setNewPlan(prev => ({ ...prev, dailyWordGoal: parseInt(e.target.value) || 20 }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">일일 학습 시간 (분)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={newPlan.dailyTimeGoal}
                onChange={(e) => setNewPlan(prev => ({ ...prev, dailyTimeGoal: parseInt(e.target.value) || 30 }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">목표 레벨</label>
              <select
                value={newPlan.targetLevel}
                onChange={(e) => setNewPlan(prev => ({ ...prev, targetLevel: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">알림 시간</label>
              <input
                type="time"
                value={newPlan.reminderTime}
                onChange={(e) => setNewPlan(prev => ({ ...prev, reminderTime: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">학습 요일</label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {Object.entries(dayLabels).map(([day, label]) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    getDayToggle(day)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={savePlan}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            계획 저장
          </button>
        </div>
      )}

      {/* Add Word Form */}
      {showAddWord && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <h4 className="text-md font-medium text-gray-900">단어 추가</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">영어 단어</label>
              <input
                type="text"
                placeholder="예: achievement"
                value={newWord.word}
                onChange={(e) => setNewWord(prev => ({ ...prev, word: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">한글 뜻</label>
              <input
                type="text"
                placeholder="예: 성취, 달성"
                value={newWord.meaning}
                onChange={(e) => setNewWord(prev => ({ ...prev, meaning: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">발음 (선택사항)</label>
              <input
                type="text"
                placeholder="예: /əˈtʃiːvmənt/"
                value={newWord.pronunciation}
                onChange={(e) => setNewWord(prev => ({ ...prev, pronunciation: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">레벨</label>
              <select
                value={newWord.level}
                onChange={(e) => setNewWord(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">예문 (선택사항)</label>
            <textarea
              placeholder="예: His achievement in science was remarkable."
              value={newWord.example}
              onChange={(e) => setNewWord(prev => ({ ...prev, example: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm h-20 resize-none"
            />
          </div>

          <button
            onClick={addWord}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            단어 저장
          </button>
        </div>
      )}

      {/* Current Study Plan */}
      {studyPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">현재 학습 계획</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-600">일일 단어 목표:</span>
              <div className="font-medium text-gray-900">{studyPlan.dailyWordGoal}개</div>
            </div>
            <div>
              <span className="text-gray-600">일일 시간 목표:</span>
              <div className="font-medium text-gray-900">{studyPlan.dailyTimeGoal}분</div>
            </div>
            <div>
              <span className="text-gray-600">목표 레벨:</span>
              <div className="font-medium text-gray-900">{studyPlan.targetLevel}</div>
            </div>
            <div>
              <span className="text-gray-600">알림 시간:</span>
              <div className="font-medium text-gray-900">{studyPlan.reminderTime}</div>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-gray-600 text-sm">학습 요일: </span>
            <span className="font-medium text-gray-900 text-sm">
              {studyPlan.studyDays.map(day => dayLabels[day as keyof typeof dayLabels]).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Quick Study Log */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-900">오늘의 학습 기록</h4>
          <button
            onClick={logStudySession}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors"
          >
            학습 완료
          </button>
        </div>
        <p className="text-sm text-gray-600">
          학습을 완료하셨다면 &apos;학습 완료&apos; 버튼을 눌러 오늘의 학습을 기록하세요.
        </p>
      </div>

      {/* Vocabulary List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-900">나의 단어장 ({vocabulary.length}개)</h4>
        </div>
        
        {vocabulary.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 추가된 단어가 없습니다
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {vocabulary.map(word => (
              <div key={word.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-gray-900">{word.word}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getLevelColor(word.level)}`}>
                        {word.level}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{word.meaning}</div>
                    {word.pronunciation && (
                      <div className="text-sm text-gray-500 mb-1">{word.pronunciation}</div>
                    )}
                    {word.example && (
                      <div className="text-sm text-blue-600 italic">&quot;{word.example}&quot;</div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">암기 수준:</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => updateWordMastery(word.id, i + 1)}
                            className={`w-3 h-3 rounded-full ${
                              i < word.masteryLevel ? 'bg-green-400' : 'bg-gray-300'
                            } hover:bg-green-300 transition-colors`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">복습 {word.reviewCount}회</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteWord(word.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}