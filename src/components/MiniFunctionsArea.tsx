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

  const renderMiniFunction = (functionData: MiniFunctionData, isPreviewOnly = false, onRemove?: () => void) => {
    switch (functionData.type) {
      case 'news':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            onRemove={onRemove}
          >
            <NewsHeadlines isPreviewOnly={isPreviewOnly} />
          </MiniFunctionCard>
        )
      case 'music':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            onRemove={onRemove}
          >
            <MusicRecommendations isPreviewOnly={isPreviewOnly} />
          </MiniFunctionCard>
        )
      case 'alarm':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            onRemove={onRemove}
          >
            <AlarmFunction isPreviewOnly={isPreviewOnly} />
          </MiniFunctionCard>
        )
      case 'expense':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            onRemove={onRemove}
          >
            <ExpenseTracker isPreviewOnly={isPreviewOnly} />
          </MiniFunctionCard>
        )
      case 'diary':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            onRemove={onRemove}
          >
            <MiniDiary isPreviewOnly={isPreviewOnly} />
          </MiniFunctionCard>
        )
      case 'stocks':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            onRemove={onRemove}
          >
            <StockMarket isPreviewOnly={isPreviewOnly} />
          </MiniFunctionCard>
        )
      case 'commute':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            onRemove={onRemove}
          >
            <CommuteTime isPreviewOnly={isPreviewOnly} />
          </MiniFunctionCard>
        )
      case 'food':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            onRemove={onRemove}
          >
            <NearbyRestaurants isPreviewOnly={isPreviewOnly} />
          </MiniFunctionCard>
        )
      case 'dday':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
            onRemove={onRemove}
          >
            <DDayCounter isPreviewOnly={isPreviewOnly} />
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
          <div className="text-lg font-medium text-gray-300 mb-2">서비스 준비중</div>
          <div className="text-sm text-gray-400 mb-4">
            Mini Functions are currently available only in Korea
          </div>
          <div className="text-xs text-gray-500">
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
        <div className="text-xs text-gray-400">
          {enabledFunctions.length}/{maxEnabled} {t('active')}
        </div>
        <div className="flex items-center gap-2">
          {enabledFunctions.length < maxEnabled && (
            <button 
              className="text-xs text-blue-400 hover:text-blue-300 underline"
              onClick={() => router.push('/settings/mini-functions')}
            >
              + Add Function
            </button>
          )}
          {enabledFunctions.length > 0 && (
            <button 
              className="text-xs text-gray-400 hover:text-gray-300 underline"
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
            {enabledFunctions.map(func => renderMiniFunction(func, false, () => disableFunction(func.type)))}
          </div>
          
          {/* Desktop: 가로 스크롤 */}
          <div className="hidden sm:flex overflow-x-auto responsive-gap-md pb-4">
            {enabledFunctions.map(func => renderMiniFunction(func, false, () => disableFunction(func.type)))}
          </div>
        </>
      )}
    </div>
  )
}