'use client'

import { useState, useEffect } from 'react'

interface Word {
  word: string
  meaning: string
  pronunciation?: string
  example?: string
}

interface EnglishStudyProps {
  isPreviewOnly?: boolean
}

// Sample word database
const SAMPLE_WORDS: Word[] = [
  { word: 'ambitious', meaning: '야심찬, 포부가 있는', pronunciation: '/æmˈbɪʃəs/', example: 'She is very ambitious about her career.' },
  { word: 'collaborate', meaning: '협력하다', pronunciation: '/kəˈlæbəreɪt/', example: 'We need to collaborate on this project.' },
  { word: 'inevitable', meaning: '피할 수 없는', pronunciation: '/ɪnˈevɪtəbl/', example: 'Change is inevitable in life.' },
  { word: 'sophisticated', meaning: '정교한, 세련된', pronunciation: '/səˈfɪstɪkeɪtɪd/', example: 'This is a sophisticated design.' },
  { word: 'perseverance', meaning: '인내, 끈기', pronunciation: '/ˌpɜːrsəˈvɪrəns/', example: 'Success requires perseverance.' },
  { word: 'eloquent', meaning: '웅변의, 설득력 있는', pronunciation: '/ˈeləkwənt/', example: 'She gave an eloquent speech.' },
  { word: 'diligent', meaning: '근면한, 성실한', pronunciation: '/ˈdɪlɪdʒənt/', example: 'He is a diligent student.' },
  { word: 'versatile', meaning: '다재다능한', pronunciation: '/ˈvɜːrsətl/', example: 'She is a versatile performer.' },
  { word: 'profound', meaning: '깊은, 심오한', pronunciation: '/prəˈfaʊnd/', example: 'He made a profound impact.' },
  { word: 'meticulous', meaning: '세심한, 꼼꼼한', pronunciation: '/məˈtɪkjələs/', example: 'She is meticulous about details.' }
]

export default function EnglishStudy({ isPreviewOnly = false }: EnglishStudyProps) {
  const [todayWords, setTodayWords] = useState<Word[]>([])
  const [studiedWords, setStudiedWords] = useState<string[]>([])
  const [showPronunciation, setShowPronunciation] = useState(false)

  useEffect(() => {
    // Get today's words based on settings
    const wordCount = isPreviewOnly ? 3 : 5 // Default to 5 words
    const shuffled = [...SAMPLE_WORDS].sort(() => 0.5 - Math.random())
    setTodayWords(shuffled.slice(0, wordCount))

    if (!isPreviewOnly) {
      // Load studied words from localStorage
      const saved = localStorage.getItem('koouk_english_studied')
      if (saved) {
        setStudiedWords(JSON.parse(saved))
      }

      // Load pronunciation setting
      const pronunciationSetting = localStorage.getItem('koouk_english_pronunciation')
      if (pronunciationSetting) {
        setShowPronunciation(JSON.parse(pronunciationSetting))
      }
    }
  }, [isPreviewOnly])

  const markAsStudied = (word: string) => {
    if (isPreviewOnly) return
    
    const updated = [...studiedWords, word]
    setStudiedWords(updated)
    localStorage.setItem('koouk_english_studied', JSON.stringify(updated))
  }

  const isWordStudied = (word: string) => {
    return studiedWords.includes(word)
  }

  return (
    <div className="space-y-2">
      {isPreviewOnly ? (
        <div className="text-gray-300 text-sm">
          <div className="mb-2">오늘의 영어 단어 {todayWords.length}개</div>
          {todayWords.map((wordData, index) => (
            <div key={index} className="text-xs text-gray-400 mb-1">
              <span className="font-medium text-white">{wordData.word}</span> - {wordData.meaning}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              오늘의 단어 ({studiedWords.filter(w => todayWords.some(tw => tw.word === w)).length}/{todayWords.length})
            </div>
            {!isPreviewOnly && (
              <button
                onClick={() => {
                  setShowPronunciation(!showPronunciation)
                  localStorage.setItem('koouk_english_pronunciation', JSON.stringify(!showPronunciation))
                }}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {showPronunciation ? '발음 숨기기' : '발음 보기'}
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {todayWords.map((wordData, index) => {
              const studied = isWordStudied(wordData.word)
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded border ${
                    studied 
                      ? 'bg-green-900 border-green-700' 
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-lg">
                          {wordData.word}
                        </span>
                        {showPronunciation && wordData.pronunciation && (
                          <span className="text-gray-400 text-sm">
                            {wordData.pronunciation}
                          </span>
                        )}
                      </div>
                      <div className="text-blue-300 mb-2">
                        {wordData.meaning}
                      </div>
                      {wordData.example && (
                        <div className="text-gray-400 text-sm italic">
                          "{wordData.example}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => markAsStudied(wordData.word)}
                      disabled={studied}
                      className={`ml-2 px-2 py-1 text-xs rounded transition-colors ${
                        studied
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {studied ? '완료' : '학습'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {todayWords.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              오늘의 영어 단어를 불러오는 중...
            </div>
          )}
        </div>
      )}
    </div>
  )
}