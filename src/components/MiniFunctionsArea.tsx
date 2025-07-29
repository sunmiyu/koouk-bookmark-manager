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

  const renderMiniFunction = (functionData: MiniFunctionData, isPreviewOnly = false) => {
    switch (functionData.type) {
      case 'news':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="뉴스 헤드라인"
            firstLine="한국 경제 성장률 전망 발표"
            secondLine="정부 새로운 정책 발표 예정"
            expandedContent={<NewsHeadlines isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'music':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="음악 추천"
            firstLine="아침에 일어나면 듣는 Jazz"
            secondLine="신나는 아침에 듣는 Kpop"
            expandedContent={<MusicRecommendations isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'alarm':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="알람"
            firstLine="내일 07:00 • 5시간 12분 남음"
            secondLine="매일 19:00"
            expandedContent={<AlarmFunction isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'expense':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="가계부"
            firstLine="총 지출 25,000원"
            secondLine="총 수입 2,000,000원"
            expandedContent={<ExpenseTracker isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'diary':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="일기"
            firstLine="오늘은 정말 좋은 하루였다..."
            secondLine="기분이 좋고 앞으로 어떤 일들이..."
            expandedContent={<MiniDiary isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'stocks':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="주식"
            firstLine="삼성전자 72,500 (+1.2%)"
            secondLine="SK하이닉스 128,000 (-0.8%)"
            expandedContent={<StockMarket isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'commute':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="출근"
            firstLine="집 → 회사"
            secondLine="45분 예상, 도로 원활"
            expandedContent={<CommuteTime isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'food':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            title="맛집"
            firstLine="맛나감자탕 • 한식 • 150m"
            secondLine="스타벅스 강남점 • 카페 • 230m"
            expandedContent={<NearbyRestaurants isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'dday':
        // D-day 아이콘 변경
        const ddayFunctionData = { ...functionData, icon: '📅' }
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={ddayFunctionData} 
            isPreviewOnly={isPreviewOnly}
            title="D-Day"
            firstLine="연말 휴가까지 D-45"
            secondLine="아들 생일 D-256"
            expandedContent={<DDayCounter isPreviewOnly={isPreviewOnly} />}
          />
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
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="section-title">{t('mini_functions')}</h2>
        <div className="flex items-center gap-1">
          <div className="text-sm text-gray-400">
            {enabledFunctions.length}/{maxEnabled} {t('active')}
          </div>
          <button 
            className="text-sm text-gray-400 hover:text-gray-300"
            onClick={() => router.push('/settings/mini-functions')}
            title="Mini Functions 관리"
          >
            ⚙️
          </button>
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
          <div className="block sm:hidden">
            {enabledFunctions.map((func, index) => (
              <div key={func.id} className={index > 0 ? 'mt-3.5' : ''}>
                {renderMiniFunction(func, false)}
              </div>
            ))}
          </div>
          
          {/* Desktop: 그리드 레이아웃 (한 줄에 최대 4개) */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {enabledFunctions.map(func => renderMiniFunction(func, false))}
          </div>
        </>
      )}
    </div>
  )
}