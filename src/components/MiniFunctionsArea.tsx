'use client'

import { useMiniFunctions } from '@/contexts/MiniFunctionsContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { useLanguage } from '@/contexts/LanguageContext'
import MiniFunctionCard from './mini-functions/MiniFunctionCard'
import NewsHeadlines from './mini-functions/NewsHeadlines'
import MusicRecommendations from './mini-functions/MusicRecommendations'
import AlarmFunction from './mini-functions/AlarmFunction'
import ExpenseTracker from './mini-functions/ExpenseTracker'
import MiniDiary from './mini-functions/MiniDiary'

export default function MiniFunctionsArea() {
  const { enabledFunctions, availableFunctions, enableFunction, disableFunction, maxEnabled } = useMiniFunctions()
  const { currentPlan } = useUserPlan()
  const { t } = useLanguage()

  const renderMiniFunction = (functionData: any, isPreviewOnly = false) => {
    switch (functionData.type) {
      case 'news':
        return (
          <MiniFunctionCard 
            key={functionData.id} 
            functionData={functionData} 
            isPreviewOnly={isPreviewOnly}
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
          >
            <MiniDiary isPreviewOnly={isPreviewOnly} />
          </MiniFunctionCard>
        )
      default:
        return null
    }
  }

  // Hide Mini Functions for free users completely
  if (currentPlan === 'free') {
    return null
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="section-title">{t('mini_functions')}</h2>
        <div className="text-xs text-gray-400">
          {enabledFunctions.length}/{maxEnabled} {t('active')}
        </div>
        {enabledFunctions.length < maxEnabled && (
          <button 
            className="text-xs text-blue-400 hover:text-blue-300 underline"
            onClick={() => {/* TODO: Open function selector */}}
          >
            + Add Function
          </button>
        )}
      </div>
      
      {enabledFunctions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No Mini Functions enabled yet</p>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            onClick={() => {/* TODO: Open function selector */}}
          >
            Choose Your First Function
          </button>
        </div>
      ) : (
        <div className="flex overflow-x-auto responsive-gap-md pb-4">
          {enabledFunctions.map(func => renderMiniFunction(func, false))}
        </div>
      )}
    </div>
  )
}