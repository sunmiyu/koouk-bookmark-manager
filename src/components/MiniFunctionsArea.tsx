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
            firstLine={
              <>
                <span className="truncate">한국 경제 성장률 전망 발표</span>
                <span className="text-xs">한국경제 7월 29일</span>
              </>
            }
            secondLine={
              <>
                <span className="truncate">정부 새로운 정책 발표 예정</span>
                <span className="text-xs">중앙일보 7월 29일</span>
              </>
            }
            expandedContent={<NewsHeadlines isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'music':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            firstLine={
              <>
                <span className="truncate">아침에 일어나면 듣는 Jazz</span>
                <span className="text-xs">Youtube</span>
              </>
            }
            secondLine={
              <>
                <span className="truncate">신나는 아침에 듣는 Kpop</span>
                <span className="text-xs">Youtube</span>
              </>
            }
            expandedContent={<MusicRecommendations isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'alarm':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            firstLine={
              <>
                <span>내일 07:00</span>
                <span className="text-xs">5시간 12분 남음</span>
              </>
            }
            secondLine={
              <>
                <span>매일 19:00</span>
                <span className="text-xs">-</span>
              </>
            }
            expandedContent={<AlarmFunction isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'expense':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            firstLine={
              <>
                <span>총 지출</span>
                <span className="text-xs">25,000원</span>
              </>
            }
            secondLine={
              <>
                <span>총 수입</span>
                <span className="text-xs">2,000,000원</span>
              </>
            }
            expandedContent={<ExpenseTracker isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'diary':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            firstLine={
              <span className="truncate">오늘은 정말 좋은 하루였다. 새로운 프로젝트를 시작하게 되어서...</span>
            }
            secondLine={
              <span className="truncate">기분이 좋고 앞으로 어떤 일들이 펼쳐질지 기대된다.</span>
            }
            expandedContent={<MiniDiary isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'stocks':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            firstLine={
              <>
                <span>삼성전자</span>
                <span className="text-xs">72,500 (+1.2%) 7월 29일</span>
              </>
            }
            secondLine={
              <>
                <span>SK하이닉스</span>
                <span className="text-xs">128,000 (-0.8%) 7월 29일</span>
              </>
            }
            expandedContent={<StockMarket isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'commute':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            firstLine={
              <>
                <span>집 → 회사</span>
                <span className="text-xs">45분 예상, 도로 원활</span>
              </>
            }
            secondLine={
              <span></span>
            }
            expandedContent={<CommuteTime isPreviewOnly={isPreviewOnly} />}
          />
        )
      case 'food':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            firstLine={
              <>
                <span className="truncate">맛나감자탕 (한식, 150m)</span>
                <span className="text-xs">4.3 (2847) 열림</span>
              </>
            }
            secondLine={
              <>
                <span className="truncate">스타벅스 강남점 (카페, 230m)</span>
                <span className="text-xs">4.1 (1523) 열림</span>
              </>
            }
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
            firstLine={
              <>
                <span>연말 휴가까지</span>
                <span className="text-xs">D-45 12/30</span>
              </>
            }
            secondLine={
              <>
                <span>아들 생일</span>
                <span className="text-xs">D-256 4/12</span>
              </>
            }
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
          <div className="block sm:hidden space-y-4">
            {enabledFunctions.map(func => renderMiniFunction(func, false))}
          </div>
          
          {/* Desktop: 가로 스크롤 */}
          <div className="hidden sm:flex overflow-x-auto responsive-gap-md pb-4">
            {enabledFunctions.map(func => renderMiniFunction(func, false))}
          </div>
        </>
      )}
    </div>
  )
}