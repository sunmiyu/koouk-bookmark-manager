'use client'

import { useState, useEffect } from 'react'
import { useMiniFunctions } from '@/contexts/MiniFunctionsContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { MiniFunctionData } from '@/types/miniFunctions'
import { useRouter } from 'next/navigation'
import { detectUserLocation, getCachedLocation, setCachedLocation } from '@/lib/geolocation'
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
  const { enabledFunctions, maxEnabled } = useMiniFunctions()
  const { t } = useLanguage()
  const router = useRouter()
  const [isKorea, setIsKorea] = useState<boolean | null>(null)
  const [trafficStatus, setTrafficStatus] = useState({ color: 'green', text: '교통 원활' })

  // 지역 감지
  useEffect(() => {
    const checkLocation = async () => {
      try {
        const cached = getCachedLocation()
        if (cached) {
          console.log('Using cached location:', cached)
          setIsKorea(cached.isKorea)
          return
        }

        console.log('Detecting user location...')
        const location = await detectUserLocation()
        console.log('Location detected:', location)
        
        // 위치 정보 캐시 저장
        setCachedLocation(location)
        setIsKorea(location.isKorea)
      } catch (error) {
        console.error('Location detection failed:', error)
        // 개발 환경에서는 한국으로 기본 설정, 배포 환경에서는 타임존으로 판별
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const fallbackIsKorea = timezone === 'Asia/Seoul' || process.env.NODE_ENV === 'development'
        console.log('Using fallback location detection:', { timezone, fallbackIsKorea })
        setIsKorea(fallbackIsKorea)
      }
    }

    checkLocation()
  }, [])

  // 신호등 색상 가져오기
  const getTrafficLight = (color: string) => {
    switch (color) {
      case 'red': return '🔴'
      case 'yellow': return '🟡'
      case 'green': return '🟢'
      default: return '🟢'
    }
  }

  const renderMiniFunction = (functionData: MiniFunctionData, isPreviewOnly = false) => {
    switch (functionData.type) {
      case 'news':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="뉴스헤드라인"
            expandedContent={isPreviewOnly ? undefined : <NewsHeadlines isPreviewOnly={false} />}
          >
            <NewsHeadlines isPreviewOnly={true} />
          </MiniFunctionCard>
        )
      case 'music':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="음악추천"
            summary="오후 추천 List"
            expandedContent={isPreviewOnly ? undefined : <MusicRecommendations isPreviewOnly={false} />}
          >
            <MusicRecommendations isPreviewOnly={true} />
          </MiniFunctionCard>
        )
      case 'alarm':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="알람"
            summary="2건"
            expandedContent={isPreviewOnly ? undefined : <AlarmFunction isPreviewOnly={false} />}
          >
            <AlarmFunction isPreviewOnly={true} />
          </MiniFunctionCard>
        )
      case 'expense':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="가계부"
            summary="지출 ₩34,500 | 수입 ₩2,500,000"
            expandedContent={isPreviewOnly ? undefined : <ExpenseTracker isPreviewOnly={false} />}
          >
            <ExpenseTracker isPreviewOnly={true} />
          </MiniFunctionCard>
        )
      case 'diary':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="일기"
            expandedContent={isPreviewOnly ? undefined : <MiniDiary showHistoryOnly={true} />}
          >
            <MiniDiary isPreviewOnly={true} />
          </MiniFunctionCard>
        )
      case 'stocks':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="주식(국내)"
            summary={
              <div>
                <div>코스피 ▲ | 코스닥 △</div>
                <div className="text-xs text-gray-400">09:00~15:30 지수 반영</div>
              </div>
            }
            expandedContent={isPreviewOnly ? undefined : <StockMarket isPreviewOnly={false} />}
          >
            <StockMarket isPreviewOnly={true} />
          </MiniFunctionCard>
        )
      case 'commute':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="출근"
            summary={
              <div className="flex items-center gap-2">
                <span>집→회사 35분 | 회사→집 42분</span>
                <span>{getTrafficLight(trafficStatus.color)}</span>
              </div>
            }
            expandedContent={isPreviewOnly ? undefined : <CommuteTime isPreviewOnly={false} onTrafficStatusChange={setTrafficStatus} />}
          >
            <CommuteTime isPreviewOnly={true} onTrafficStatusChange={setTrafficStatus} />
          </MiniFunctionCard>
        )
      case 'food':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="맛집"
            expandedContent={isPreviewOnly ? undefined : <NearbyRestaurants />}
          >
            <NearbyRestaurants />
          </MiniFunctionCard>
        )
      case 'dday':
        // D-day 아이콘 변경
        const ddayFunctionData = { ...functionData, icon: '📅' }
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={ddayFunctionData} 
            isPreviewOnly={isPreviewOnly}
            title="D-day"
            summary="신년 (&apos;26.1/1) D-156"
            expandedContent={isPreviewOnly ? undefined : <DDayCounter isPreviewOnly={false} />}
          >
            <DDayCounter isPreviewOnly={true} />
          </MiniFunctionCard>
        )
      default:
        return null
    }
  }

  // 한국이 아닌 지역에서는 서비스 준비중 메시지 표시
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
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
      {/* Professional Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h1m0 0V3a2 2 0 112 0v1h1a2 2 0 011 1v1M9 7h6" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{t('mini_functions')}</h2>
            <p className="text-sm text-gray-400">Quick access to your tools</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <span className="text-sm font-medium text-gray-300">
              {enabledFunctions.length}/{maxEnabled} {t('active')}
            </span>
          </div>
          <button 
            className="w-9 h-9 flex items-center justify-center bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg transition-all cursor-pointer"
            onClick={() => router.push('/mini-functions')}
            title="Mini Functions 관리"
          >
            ⚙️
          </button>
        </div>
      </div>
      
      {enabledFunctions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Mini Functions Active</h3>
          <p className="text-gray-400 mb-6">Choose your first function to get started</p>
          <button 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer shadow-lg shadow-blue-600/25 transition-all"
            onClick={() => router.push('/mini-functions')}
          >
            Choose Your First Function
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {enabledFunctions.map(func => (
            <div key={func.id} className="min-h-0">
              {renderMiniFunction(func, false)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}