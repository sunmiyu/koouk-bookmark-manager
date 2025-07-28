'use client'

import { useState, useEffect } from 'react'
import { useMiniFunctions } from '@/contexts/MiniFunctionsContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { MiniFunctionData } from '@/types/miniFunctions'
import { useRouter } from 'next/navigation'
import { detectUserLocation, getCachedLocation } from '@/lib/geolocation'
import MiniFunctionCard from './mini-functions/MiniFunctionCard'
import NewsHeadlines from './mini-functions/NewsHeadlines'
import MusicRecommendations from './mini-functions/MusicRecommendations'
import AlarmFunction from './mini-functions/AlarmFunction'
import ExpenseTracker from './mini-functions/ExpenseTracker'
import MiniDiary from './mini-functions/MiniDiary'
import StockMarket from './mini-functions/StockMarket'
import CommuteTime from './mini-functions/CommuteTime'
import NearbyRestaurants from './mini-functions/NearbyRestaurants'
import DDayCounter from './mini-functions/DDayCounter'

export default function MiniFunctionsArea() {
  const { enabledFunctions, maxEnabled, disableFunction } = useMiniFunctions()
  const { t } = useLanguage()
  const router = useRouter()
  const [isKorea, setIsKorea] = useState<boolean | null>(null)

  // 지역 감지
  useEffect(() => {
    const checkLocation = async () => {
      try {
        const cached = getCachedLocation()
        if (cached) {
          setIsKorea(cached.isKorea)
          return
        }

        const location = await detectUserLocation()
        setIsKorea(location.isKorea)
      } catch (error) {
        console.error('Location check failed:', error)
        setIsKorea(false)
      }
    }

    checkLocation()
  }, [])

  const renderMiniFunction = (functionData: MiniFunctionData, isPreviewOnly = false) => {
    switch (functionData.type) {
      case 'news':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            secondLine="최신 뉴스 헤드라인"
            expandedContent={<NewsHeadlines isPreviewOnly={isPreviewOnly} />}
          >
            오늘 주요 뉴스 5건
          </MiniFunctionCard>
        )
      case 'music':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            secondLine="맞춤 음악 추천"
            expandedContent={<MusicRecommendations isPreviewOnly={isPreviewOnly} />}
          >
            추천 음악 장르: K-pop, Jazz
          </MiniFunctionCard>
        )
      case 'alarm':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            secondLine="다음 알람 시간"
            expandedContent={<AlarmFunction isPreviewOnly={isPreviewOnly} />}
          >
            다음 알람: 내일 07:00
          </MiniFunctionCard>
        )
      case 'expense':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            secondLine="오늘의 지출 현황"
            expandedContent={<ExpenseTracker isPreviewOnly={isPreviewOnly} />}
          >
            오늘 지출: 35,000원
          </MiniFunctionCard>
        )
      case 'diary':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            secondLine="오늘의 기록 작성"
            expandedContent={<MiniDiary isPreviewOnly={isPreviewOnly} />}
          >
            오늘의 기분: 행복 하루 시작!
          </MiniFunctionCard>
        )
      case 'stocks':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            secondLine="관심 종목 시세"
            expandedContent={<StockMarket isPreviewOnly={isPreviewOnly} />}
          >
            삼성전자 72,500 (+1.2%)
          </MiniFunctionCard>
        )
      case 'commute':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            secondLine="실시간 교통 정보"
            expandedContent={<CommuteTime isPreviewOnly={isPreviewOnly} />}
          >
            출근: 35분, 퇴근: 42분
          </MiniFunctionCard>
        )
      case 'food':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            secondLine="근처 맛집 정보"
            expandedContent={<NearbyRestaurants isPreviewOnly={isPreviewOnly} />}
          >
            주변 맛집 12곳 발견
          </MiniFunctionCard>
        )
      case 'dday':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            secondLine="다가오는 일정"
            expandedContent={<DDayCounter isPreviewOnly={isPreviewOnly} />}
          >
            연말 휴가까지 D-45
          </MiniFunctionCard>
        )
      default:
        return null
    }
  }

  // TEMPORARY: Allow free users to see Mini Functions for testing
  // TODO: Re-enable this restriction after OAuth is working
  /*
  // Hide Mini Functions for free users completely
  if (currentPlan === 'free') {
    return null
  }
  */

  // 해외 접속자를 위한 서비스 준비중 메시지
  if (isKorea === false) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="section-title">{t('mini_functions')}</h2>
        </div>
        <div className="text-center py-8 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-4xl mb-4">🚧</div>
          <div className="text-sm font-medium text-gray-300 mb-2">서비스 준비중</div>
          <div className="text-sm text-gray-400 mb-4">
            Mini Functions are currently available only in Korea
          </div>
          <div className="text-sm text-gray-500">
            We&apos;re working to expand our services globally. Stay tuned!
          </div>
        </div>
      </div>
    )
  }

  // 지역 감지 중일 때 로딩 표시
  if (isKorea === null) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="section-title">{t('mini_functions')}</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-pulse text-gray-400">Loading Mini Functions...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="section-title">{t('mini_functions')}</h2>
        <div className="text-sm text-gray-400">
          {enabledFunctions.length}/{maxEnabled} {t('active')}
        </div>
        <div className="flex items-center gap-2">
          {enabledFunctions.length < maxEnabled && (
            <button 
              className="text-sm text-blue-400 hover:text-blue-300 underline"
              onClick={() => router.push('/settings/mini-functions')}
            >
              + Add Function
            </button>
          )}
          {enabledFunctions.length > 0 && (
            <button 
              className="text-sm text-gray-400 hover:text-gray-300 underline"
              onClick={() => router.push('/settings/mini-functions')}
            >
              ⚙️ Manage
            </button>
          )}
        </div>
      </div>
      
      {enabledFunctions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No Mini Functions enabled yet</p>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            onClick={() => router.push('/settings/mini-functions')}
          >
            Choose Your First Function
          </button>
        </div>
      ) : (
        <>
          {/* Mobile: 세로 스택 */}
          <div className="block sm:hidden space-y-4">
            {enabledFunctions.map(func => renderMiniFunction(func, false))}
          </div>
          
          {/* Desktop: 그리드 레이아웃 (최대 4개씩 한 줄) */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 responsive-gap-md">
            {enabledFunctions.map(func => renderMiniFunction(func, false))}
          </div>
        </>
      )}
    </div>
  )
}