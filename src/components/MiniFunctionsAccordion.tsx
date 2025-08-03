'use client'

import { useState } from 'react'
import { useMiniFunctions } from '@/contexts/MiniFunctionsContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import Link from 'next/link'

type AccordionItemType = {
  id: string
  title: string
  icon: string
  summary: string
  enabled: boolean
  details: string[]
  needsUpgrade?: boolean
}

export default function MiniFunctionsAccordion() {
  const { enabledFunctions } = useMiniFunctions()
  const { currentPlan } = useUserPlan()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  // Generate accordion items based on enabled functions and mock data - All 20 functions from control page
  const accordionItems: AccordionItemType[] = [
    // Free Plan Functions (12)
    {
      id: 'expenses',
      title: '가계부',
      icon: '💰',
      summary: '오늘 ₩34,500 | 이번달 ₩567,800',
      enabled: enabledFunctions.some(f => f.id === 'expenses'),
      details: [
        '오늘 지출: ₩34,500',
        '- 점심: ₩12,000',
        '- 커피: ₩4,500',
        '- 교통비: ₩8,000',
        '- 편의점: ₩10,000',
        '이번달 총 지출: ₩567,800',
        '예산 대비: 76.2% 사용',
        '남은 예산: ₩177,200'
      ]
    },
    {
      id: 'diary',
      title: '일기',
      icon: '📝',
      summary: '오늘 작성완료 | 이번주 5일 | 연속 12일',
      enabled: enabledFunctions.some(f => f.id === 'diary'),
      details: [
        '오늘: "좋은 하루였다..." (작성완료)',
        '어제: "새로운 도전을 시작했다"',
        '그제: "친구들과 즐거운 시간"',
        '이번 주 작성: 5일 / 7일',
        '연속 작성: 12일',
        '총 일기 수: 187개',
        '평균 작성 길이: 85단어'
      ]
    },
    {
      id: 'alarms',
      title: '알람',
      icon: '⏰',
      summary: '다음 7:30 기상 | 활성 5개 | 오늘 3회',
      enabled: enabledFunctions.some(f => f.id === 'alarms'),
      details: [
        '기상 알람: 7:30 AM (매일)',
        '점심 알람: 12:00 PM (평일)',
        '운동 알람: 6:00 PM (월,수,금)',
        '약 복용: 9:00 PM (매일)',
        '수면 알람: 11:00 PM (매일)',
        '오늘 울린 알람: 3회',
        '다음 알람: 내일 7:30 AM'
      ]
    },
    {
      id: 'dday',
      title: 'D-Day',
      icon: '📅',
      summary: '생일 D-12 | 휴가 D-45 | 프로젝트 D-3',
      enabled: enabledFunctions.some(f => f.id === 'dday'),
      details: [
        '친구 생일: D-12 (3월 15일)',
        '여름 휴가: D-45 (4월 20일)',
        '프로젝트 마감: D-3 (3월 6일)',
        '시험: D-28 (3월 31일)',
        '결혼기념일: D-67 (5월 12일)',
        '회사 창립일: D-89 (6월 3일)'
      ]
    },
    {
      id: 'song-practice',
      title: '노래 연습',
      icon: '🎤',
      summary: '연습곡 8개 | 완료 3곡 | 이번주 목표 5곡',
      enabled: enabledFunctions.some(f => f.id === 'song-practice'),
      details: [
        '완료: "Spring Day" - BTS',
        '완료: "Hotel California" - Eagles',
        '완료: "Someone Like You" - Adele',
        '연습중: "Bohemian Rhapsody" - Queen',
        '연습중: "Shape of You" - Ed Sheeran',
        '대기: "Perfect" - Ed Sheeran',
        '대기: "Thinking Out Loud" - Ed Sheeran',
        '이번 주 목표: 5곡 → 3곡 완료'
      ]
    },
    {
      id: 'anniversaries',
      title: '기념일',
      icon: '🎉',
      summary: '이번달 3개 | 다가오는 생일 D-12',
      enabled: enabledFunctions.some(f => f.id === 'anniversaries'),
      details: [
        '친구 생일: 3월 15일 (D-12)',
        '부모님 결혼기념일: 3월 25일 (D-22)',
        '첫 만남 기념일: 4월 3일 (D-31)',
        '졸업 기념일: 4월 20일 (D-48)',
        '입사 기념일: 5월 12일 (D-70)',
        '이번 달 기념일: 3개',
        '준비해야 할 선물: 2개'
      ]
    },
    {
      id: 'goals',
      title: '목표',
      icon: '🎯',
      summary: '진행중 3개 | 완료 2개 | 달성률 68%',
      enabled: enabledFunctions.some(f => f.id === 'goals'),
      details: [
        '독서: 월 2권 → 1.5권 (75%)',
        '운동: 주 3회 → 달성 (100%)',
        '영어: 매일 30분 → 20일 (67%)',
        '부업: 월 50만원 → 32만원 (64%)',
        '저축: 월 100만원 → 달성 (100%)',
        '전체 달성률: 68%'
      ]
    },
    {
      id: 'english-study',
      title: '영어 공부',
      icon: '📚',
      summary: '오늘 단어 20개 | 연속 15일 | 레벨 B2',
      enabled: enabledFunctions.some(f => f.id === 'english-study'),
      details: [
        '오늘 학습: achievement, dedication, fundamental',
        '복습 단어: 20개',
        '신규 단어: 5개',
        '연속 학습: 15일',
        '총 학습 단어: 847개',
        '현재 레벨: B2 (Upper-Intermediate)',
        '다음 목표: C1 레벨 (12% 진행)'
      ]
    },
    {
      id: 'unit-converter',
      title: '단위변환',
      icon: '📐',
      summary: '최근 길이변환 | 1m = 3.3ft | 즐겨찾기 5개',
      enabled: enabledFunctions.some(f => f.id === 'unit-converter'),
      details: [
        '최근 변환: 1m = 3.3ft',
        '자주 사용: cm ↔ inch',
        '즐겨찾기: kg ↔ lb',
        '즐겨찾기: °C ↔ °F',
        '즐겨찾기: km ↔ mile',
        '오늘 변환 횟수: 7회',
        '가장 많이 사용: 길이 단위'
      ]
    },
    {
      id: 'world-time',
      title: '세계시간',
      icon: '🌍',
      summary: 'NYC 08:30 | 도쿄 22:30 | 런던 13:30',
      enabled: enabledFunctions.some(f => f.id === 'world-time'),
      details: [
        '서울: 22:30 (기준)',
        '뉴욕: 08:30 (-14시간)',
        '도쿄: 22:30 (+0시간)',
        '런던: 13:30 (-9시간)',
        '파리: 14:30 (-8시간)',
        'LA: 05:30 (-17시간)',
        '시드니: 00:30 (+2시간)'
      ]
    },
    {
      id: 'exercise-tracker',
      title: '운동기록',
      icon: '💪',
      summary: '오늘 30분 | 주 3회 달성 | 목표 80%',
      enabled: enabledFunctions.some(f => f.id === 'exercise-tracker'),
      details: [
        '오늘: 러닝 30분 (완료)',
        '어제: 헬스 45분 (완료)',
        '월요일: 요가 25분 (완료)',
        '이번 주 목표: 3회 → 달성!',
        '이번 달 운동: 12일 / 15일',
        '칼로리 소모: 2,340kcal',
        '다음 목표: 주 4회 운동'
      ]
    },
    {
      id: 'motivation-quotes',
      title: '동기부여',
      icon: '✨',
      summary: '"Success is..." | 오늘의 글귀 | 즐겨찾기 12개',
      enabled: enabledFunctions.some(f => f.id === 'motivation-quotes'),
      details: [
        '오늘: "Success is not final, failure is not fatal"',
        '어제: "The only way to do great work is to love what you do"',
        '인기: "Be yourself; everyone else is already taken"',
        '즐겨찾기: 12개 저장됨',
        '카테고리: 성공, 동기부여, 인생',
        '매일 새로운 글귀 업데이트',
        '공유한 글귀: 8개'
      ]
    },

    // Pro Plan Functions (6)
    {
      id: 'news',
      title: '뉴스',
      icon: '📰',
      summary: '속보 5건 | IT 3건 | 경제 2건',
      enabled: enabledFunctions.some(f => f.id === 'news'),
      needsUpgrade: currentPlan === 'free',
      details: [
        '[속보] 정부, 새로운 경제정책 발표',
        '[IT] AI 기술 발전으로 산업 변화 가속화',
        '[경제] 코스피 상승세 지속, 외국인 순매수',
        '[IT] 새로운 스마트폰 출시 예정',
        '[사회] 기후변화 대응 정책 논의',
        '[IT] 클라우드 서비스 시장 성장',
        '[경제] 반도체 수출 증가세'
      ]
    },
    {
      id: 'music',
      title: '음악 추천',
      icon: '🎵',
      summary: '오늘 추천 5곡 | 새 플레이리스트 | 장르 Pop',
      enabled: enabledFunctions.some(f => f.id === 'music'),
      needsUpgrade: currentPlan === 'free',
      details: [
        '오늘 추천: "Flowers" - Miley Cyrus',
        '트렌딩: "Anti-Hero" - Taylor Swift',
        '새 발견: "As It Was" - Harry Styles',
        '클래식: "Bohemian Rhapsody" - Queen',
        '차트: "Unholy" - Sam Smith',
        '새 플레이리스트: "2024 Hits"',
        '선호 장르: Pop, Rock, R&B'
      ]
    },
    {
      id: 'stocks',
      title: '주식',
      icon: '📈',
      summary: 'KOSPI 2,456 (+1.2%) | 삼성전자 71,200 (-0.5%)',
      enabled: enabledFunctions.some(f => f.id === 'stocks'),
      needsUpgrade: currentPlan === 'free',
      details: [
        'KOSPI: 2,456.78 (+1.2%)',
        '삼성전자: 71,200 (-0.5%)',
        'LG에너지솔루션: 401,000 (+1.2%)',
        'SK하이닉스: 128,500 (+2.1%)',
        'NAVER: 185,000 (-0.8%)',
        '카카오: 52,400 (+0.3%)',
        '현대차: 198,500 (+1.8%)',
        'LG화학: 342,000 (-0.2%)',
        '포스코홀딩스: 267,000 (+0.9%)',
        '삼성바이오로직스: 756,000 (+1.5%)'
      ]
    },
    {
      id: 'commute',
      title: '출근길',
      icon: '🚗',
      summary: '평소보다 5분 늦음 | 지하철 정상 | 우회로 추천',
      enabled: enabledFunctions.some(f => f.id === 'commute'),
      needsUpgrade: currentPlan === 'free',
      details: [
        '현재 소요시간: 35분 (+5분)',
        '지하철 2호선: 정상 운행',
        '지하철 9호선: 5분 지연',
        '버스 472번: 평소대로',
        '추천 경로: 지하철 → 도보',
        '우회 경로: 버스 + 지하철',
        '도착 예정: 9:05 AM'
      ]
    },
    {
      id: 'currency-rates',
      title: '환율현황',
      icon: '📊',
      summary: 'USD 1,340원 (+0.8%) | EUR 1,450원 | JPY 9.2원',
      enabled: enabledFunctions.some(f => f.id === 'currency-rates'),
      needsUpgrade: currentPlan === 'free',
      details: [
        'USD/KRW: 1,340원 (+0.8%)',
        'EUR/KRW: 1,450원 (-0.3%)',
        'JPY/KRW: 9.2원 (+1.1%)',
        'CNY/KRW: 185원 (+0.2%)',
        'GBP/KRW: 1,680원 (-0.1%)',
        '오늘 변동: USD 상승세',
        '주간 트렌드: 달러 강세'
      ]
    },
    {
      id: 'pharmacy-24h',
      title: '24시간 약국',
      icon: '🏥',
      summary: '근처 3곳 영업중 | 가장 가까운 350m | 24시간',
      enabled: enabledFunctions.some(f => f.id === 'pharmacy-24h'),
      needsUpgrade: currentPlan === 'free',
      details: [
        '온누리약국: 350m (24시간)',
        '메디팜약국: 580m (24시간)',
        '건강약국: 720m (24시간)',
        '현재 영업중: 3곳',
        '도보 시간: 4분 (가장 가까운)',
        '전화번호: 02-123-4567',
        '주차 가능: 온누리약국'
      ]
    },

    // Unlimited Plan Functions (2)
    {
      id: 'restaurants',
      title: '맛집',
      icon: '🍽️',
      summary: '주변 맛집 12곳 | 별점 4.5+ | 예약가능 8곳',
      enabled: enabledFunctions.some(f => f.id === 'restaurants'),
      needsUpgrade: currentPlan !== 'unlimited',
      details: [
        '이탈리안: "파스타 하우스" (4.8★)',
        '한식: "고향집" (4.7★)',
        '일식: "스시 장인" (4.9★)',
        '중식: "차이나타운" (4.6★)',
        '카페: "원두 이야기" (4.5★)',
        '예약 가능: 8곳',
        '도보 5분 내: 4곳'
      ]
    },
    {
      id: 'currency-converter',
      title: '환율변환',
      icon: '💱',
      summary: '100 USD = 134,000원 | 즐겨찾기 5개 | 실시간',
      enabled: enabledFunctions.some(f => f.id === 'currency-converter'),
      needsUpgrade: currentPlan !== 'unlimited',
      details: [
        '최근 변환: 100 USD = 134,000원',
        '즐겨찾기: USD, EUR, JPY, CNY',
        '실시간 업데이트: 매 5분',
        '수수료 계산: 자동',
        '히스토리: 최근 20건',
        '알림 설정: 환율 변동 5% 이상',
        '오늘 변환: 8회'
      ]
    },

    // System functions (always available)
    {
      id: 'weather',
      title: '날씨',
      icon: '🌤️',
      summary: '서울 28°C 맑음 | 내일 30°C',
      enabled: true,
      details: [
        '현재: 28°C 맑음',
        '체감온도: 31°C',
        '습도: 65%',
        '바람: 서남서 2.3m/s',
        '내일: 30°C 구름많음',
        '모레: 26°C 비',
        '주말: 24°C 맑음'
      ]
    },
    {
      id: 'todos',
      title: '할일',
      icon: '✅',
      summary: '오늘 3건 | 완료 1건 | 미완료 2건',
      enabled: true,
      details: [
        '완료: 회의 준비',
        '진행중: 프로젝트 리뷰',
        '진행중: 문서 작성',
        '예정: 개발자 미팅 (15:00)',
        '예정: 운동 (18:00)'
      ]
    }
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-black rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Mini Functions</h2>
            <p className="text-sm text-gray-400">빠른 정보 확인</p>
          </div>
          <Link href="/mini-functions">
            <button 
              className="w-12 h-12 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              title="Mini Functions 관리"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </Link>
        </div>

        {/* Accordion List */}
        <div className="space-y-2">
          {accordionItems.map((item) => {
            const isExpanded = expandedItems.has(item.id)
            const showPremiumOverlay = item.needsUpgrade && !item.enabled

            return (
              <div 
                key={item.id} 
                className={`relative bg-gray-800/30 rounded-lg border transition-all duration-200 ${
                  showPremiumOverlay 
                    ? 'border-yellow-600/30 bg-yellow-900/10' 
                    : isExpanded
                    ? 'border-blue-500/50 bg-blue-900/10'
                    : 'border-gray-700/30 hover:border-gray-600/50'
                }`}
              >
                {/* Summary Row */}
                <button
                  onClick={() => !showPremiumOverlay && toggleItem(item.id)}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                    showPremiumOverlay ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-800/20'
                  }`}
                  disabled={showPremiumOverlay}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{item.title}</span>
                        {showPremiumOverlay && (
                          <span className="px-1.5 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded border border-yellow-600/30">
                            Pro
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-300 truncate">
                        {item.summary}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!showPremiumOverlay && (
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && item.enabled && !showPremiumOverlay && (
                  <div className="px-4 pb-4">
                    <div className="border-t border-gray-700/30 pt-3">
                      <div className="space-y-2">
                        {item.details.map((detail, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-2 text-sm py-1.5 px-3 bg-gray-800/40 rounded border border-gray-700/20"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-200">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Premium Upgrade Overlay */}
                {showPremiumOverlay && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-yellow-400 text-2xl mb-2">🔒</div>
                      <div className="text-sm font-semibold text-yellow-400 mb-2">Pro 기능</div>
                      <Link href="/pricing">
                        <button className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-lg font-semibold transition-colors">
                          업그레이드
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 pt-4 border-t border-gray-700/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium">{enabledFunctions.length}</span>
                <span className="text-gray-400">활성</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium">{accordionItems.length}</span>
                <span className="text-gray-400">전체</span>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs ${
              currentPlan === 'unlimited' ? 'bg-purple-600/10 text-purple-400' :
              currentPlan === 'pro' ? 'bg-blue-600/10 text-blue-400' :
              'bg-gray-600/10 text-gray-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                currentPlan === 'unlimited' ? 'bg-purple-400' :
                currentPlan === 'pro' ? 'bg-blue-400' :
                'bg-gray-400'
              }`}></div>
              <span className="font-medium capitalize">{currentPlan}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}