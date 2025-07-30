'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMiniFunctions } from '@/contexts/MiniFunctionsContext'

// Mini Function 타입 정의
interface MiniFunctionType {
  id: string
  name: string
  description: string
  icon: string
}

// 사용 가능한 모든 Mini Function들
const AVAILABLE_FUNCTIONS: MiniFunctionType[] = [
  { id: 'expenses', name: '가계부', description: '일일 지출 및 수입 관리', icon: '💰' },
  { id: 'diary', name: '일기', description: '오늘의 감정과 기억 기록', icon: '📝' },
  { id: 'alarms', name: '알람', description: '일상 알람 및 리마인더', icon: '⏰' },
  { id: 'dday', name: 'D-Day', description: '중요한 날짜 카운트다운', icon: '📅' },
  { id: 'commute', name: '출근길', description: '교통 상황 및 경로 정보', icon: '🚗' },
  { id: 'music', name: '음악 추천', description: '기분별 음악 추천', icon: '🎵' },
  { id: 'news', name: '뉴스', description: '최신 뉴스 헤드라인', icon: '📰' },
  { id: 'stocks', name: '주식', description: '주요 주식 지수 및 정보', icon: '📈' },
  { id: 'restaurants', name: '맛집', description: '근처 맛집 추천', icon: '🍽️' }
]

export default function MiniFunctionsControlPage() {
  const { enabledFunctions, toggleFunction } = useMiniFunctions()
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null)

  const enabledFunctionIds = enabledFunctions.map(f => f.id)
  const availableFunctions = AVAILABLE_FUNCTIONS.filter(f => !enabledFunctionIds.includes(f.id))

  const handleAddFunction = (functionId: string) => {
    if (enabledFunctions.length >= 8) {
      alert('최대 8개의 Mini Function만 사용할 수 있습니다.')
      return
    }
    toggleFunction(functionId)
  }

  const handleRemoveFunction = (functionId: string) => {
    toggleFunction(functionId)
  }

  const selectedFunctionData = selectedFunction 
    ? enabledFunctions.find(f => f.id === selectedFunction) || AVAILABLE_FUNCTIONS.find(f => f.id === selectedFunction)
    : null

  // Function별 설정 화면 렌더링
  const renderFunctionConfig = (functionId: string) => {
    switch (functionId) {
      case 'news':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">뉴스 카테고리 설정</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'politics', name: '정치', icon: '🏛️' },
                  { id: 'economy', name: '경제', icon: '💼' },
                  { id: 'society', name: '사회', icon: '🏙️' },
                  { id: 'culture', name: '문화', icon: '🎨' },
                  { id: 'sports', name: '스포츠', icon: '⚽' },
                  { id: 'tech', name: '기술/IT', icon: '💻' },
                  { id: 'international', name: '국제', icon: '🌍' },
                  { id: 'entertainment', name: '연예', icon: '🎭' }
                ].map((category) => (
                  <label key={category.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    <input 
                      type="checkbox" 
                      defaultChecked={true}
                      className="rounded"
                    />
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-white">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">표시할 뉴스 개수</label>
              <select className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                <option value="3">3개</option>
                <option value="5">5개</option>
                <option value="10">10개</option>
              </select>
            </div>
          </div>
        )

      case 'music':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">음악 장르 선호도</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'kpop', name: 'K-POP', icon: '🎵' },
                  { id: 'pop', name: 'POP', icon: '🎤' },
                  { id: 'hiphop', name: 'Hip-Hop', icon: '🎧' },
                  { id: 'rock', name: 'Rock', icon: '🎸' },
                  { id: 'jazz', name: 'Jazz', icon: '🎺' },
                  { id: 'classical', name: 'Classical', icon: '🎼' },
                  { id: 'electronic', name: 'Electronic', icon: '🎛️' },
                  { id: 'indie', name: 'Indie', icon: '🎹' }
                ].map((genre) => (
                  <label key={genre.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    <input 
                      type="checkbox" 
                      defaultChecked={true}
                      className="rounded"
                    />
                    <span className="text-lg">{genre.icon}</span>
                    <span className="text-white">{genre.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">기본 추천 기분</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                <option value="morning">☀️ 상쾌한 아침</option>
                <option value="focus">🎯 집중 모드</option>
                <option value="relax">😌 휴식 시간</option>
                <option value="workout">💪 운동할 때</option>
                <option value="evening">🌅 저녁 감성</option>
                <option value="sleep">😴 잠들기 전</option>
              </select>
            </div>
          </div>
        )

      case 'expenses':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">가계부 설정</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">월 예산 목표</label>
                  <input
                    type="number"
                    placeholder="예: 1000000"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">기본 통화</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                    <option value="KRW">원 (KRW)</option>
                    <option value="USD">달러 (USD)</option>
                    <option value="EUR">유로 (EUR)</option>
                    <option value="JPY">엔 (JPY)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'diary':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">일기 설정</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">일기 알림 시간</label>
                  <input
                    type="time"
                    defaultValue="22:00"
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="diary-reminder"
                    defaultChecked={true}
                    className="rounded"
                  />
                  <label htmlFor="diary-reminder" className="text-sm text-gray-300">일기 작성 알림 받기</label>
                </div>
              </div>
            </div>
          </div>
        )

      case 'alarms':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">알람 설정</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">최대 알람 개수</label>
                  <select className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                    <option value="2">2개</option>
                    <option value="5">5개</option>
                    <option value="10">10개</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">기본 알람음</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                    <option value="bell">🔔 벨소리</option>
                    <option value="chime">🎵 차임벨</option>
                    <option value="buzz">📳 진동</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'dday':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">D-Day 설정</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">표시할 이벤트 개수</label>
                  <select className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                    <option value="1">1개 (다음 이벤트만)</option>
                    <option value="3">3개</option>
                    <option value="5">5개</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dday-notification"
                    defaultChecked={true}
                    className="rounded"
                  />
                  <label htmlFor="dday-notification" className="text-sm text-gray-300">D-Day 알림 받기</label>
                </div>
              </div>
            </div>
          </div>
        )

      case 'commute':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">출근길 설정</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">기본 출발지</label>
                  <input
                    type="text"
                    placeholder="예: 강남구 역삼동"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">기본 목적지</label>
                  <input
                    type="text"
                    placeholder="예: 서초구 서초동"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">업데이트 주기</label>
                  <select className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                    <option value="5">5분</option>
                    <option value="10">10분</option>
                    <option value="15">15분</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'stocks':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">주식 설정</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">관심 종목 추가</label>
                  <input
                    type="text"
                    placeholder="예: 삼성전자, AAPL, TSLA"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">표시 방식</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                    <option value="simple">간단 (현재가만)</option>
                    <option value="detailed">상세 (등락률 포함)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'restaurants':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">맛집 추천 설정</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">검색 반경</label>
                  <select className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                    <option value="500">500m</option>
                    <option value="1000">1km</option>
                    <option value="2000">2km</option>
                    <option value="5000">5km</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">선호 음식 종류</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['한식', '중식', '일식', '양식', '분식', '치킨', '피자', '카페'].map((food) => (
                      <label key={food} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={true} className="rounded" />
                        <span className="text-white text-sm">{food}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">이 Function의 설정을 준비 중입니다.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mini Function Control</h1>
            <p className="text-gray-400">Mini Function들을 추가, 삭제하고 편집하세요</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="flex gap-8">
          {/* Vertical Navigation Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Mini Functions</h3>
              <div className="space-y-2">
                {AVAILABLE_FUNCTIONS.map((func) => {
                  const isEnabled = enabledFunctionIds.includes(func.id)
                  return (
                    <div
                      key={func.id}
                      onClick={() => setSelectedFunction(func.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFunction === func.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{func.icon}</span>
                          <span className="font-medium">{func.name}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Function Configuration Panel */}
            <div className="bg-gray-900 rounded-lg p-8">
              {selectedFunction ? (
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{AVAILABLE_FUNCTIONS.find(f => f.id === selectedFunction)?.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{AVAILABLE_FUNCTIONS.find(f => f.id === selectedFunction)?.name}</h3>
                        <p className="text-gray-400">{AVAILABLE_FUNCTIONS.find(f => f.id === selectedFunction)?.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="function-enabled"
                          checked={enabledFunctionIds.includes(selectedFunction)}
                          onChange={() => toggleFunction(selectedFunction)}
                          className="rounded"
                        />
                        <label htmlFor="function-enabled" className="text-sm text-gray-300">활성화</label>
                      </div>
                    </div>
                  </div>

                  {/* Function-specific Configuration */}
                  <div className="space-y-6">
                    {renderFunctionConfig(selectedFunction)}
                    
                    {/* Save Button */}
                    <div className="pt-6 border-t border-gray-700">
                      <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                        설정 저장
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">Mini Function을 선택하세요</h3>
                  <p className="text-gray-500">왼쪽에서 편집할 Function을 클릭하세요</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}