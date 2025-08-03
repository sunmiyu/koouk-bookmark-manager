'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMiniFunctions } from '@/contexts/MiniFunctionsContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { MiniFunctionData } from '@/types/miniFunctions'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function MiniFunctionsSettings() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { currentPlan } = useUserPlan()
  const { 
    availableFunctions, 
    enabledFunctions, 
    enableFunction, 
    disableFunction, 
    canEnableMore, 
    maxEnabled 
  } = useMiniFunctions()

  // Get user session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to get session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setUser(session?.user ?? null)
      if (!loading) {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [loading])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading user session...</div>
      </div>
    )
  }

  // Debug logging
  console.log('Settings page - User state:', { 
    user: user ? { id: user.id, email: user.email } : null, 
    loading, 
    currentPlan 
  })

  // Redirect if not logged in
  if (!user) {
    console.log('Settings page - User not found, showing access denied')
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You must be logged in to access this page.</p>
          <p className="text-gray-500 text-sm mb-4">Debug: User state is null</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // Pricing plans data (from pricing page)
  const pricingPlans = [
    {
      id: 'free',
      name: "Free",
      price: "₩0",
      priceUnit: "/월",
      description: "개인 사용자를 위한 기본 플랜",
      features: [
        "12개 Basic Mini Functions",
        "각 콘텐츠 타입별 50개 제한",
        "Links, Videos, Images, Notes 50개씩",
        "Todos 무제한",
        "Gmail 로그인",
        "실시간 날씨",
        "웹 알림",
        "PWA 지원"
      ],
      miniFunctions: [
        "가계부", "일기", "알람", "D-Day", "노래 연습 List",
        "기념일 등록", "목표 세팅", "영어 공부", "단위변환",
        "세계시간", "운동기록", "동기부여 글귀"
      ],
      buttonText: "현재 플랜",
      buttonStyle: "bg-gray-600 text-gray-300 cursor-not-allowed",
      popular: false,
      cardStyle: "border-gray-600"
    },
    {
      id: 'pro',
      name: "Pro",
      price: "₩6,990",
      priceUnit: "/월",
      description: "파워 유저를 위한 프리미엄 플랜",
      features: [
        "All Functions + 2 API-Powered Mini Functions",
        "각 콘텐츠 타입별 500개",
        "모든 무료 플랜 기능",
        "실시간 뉴스 헤드라인",
        "기분별 음악 추천",
        "주식 시장 정보",
        "교통 상황 및 경로",
        "실시간 환율 정보",
        "24시간 주변 약국",
        "우선순위 고객지원"
      ],
      miniFunctions: [
        "모든 Free 플랜 기능", "뉴스", "음악 추천", "주식", 
        "출근길", "환율현황", "24시간 주변약국"
      ],
      buttonText: "업그레이드",
      buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
      popular: true,
      cardStyle: "border-blue-500 shadow-lg shadow-blue-500/20"
    },
    {
      id: 'unlimited',
      name: "Premium",
      price: "₩12,990",
      priceUnit: "/월",
      description: "무제한 기능을 원하는 사용자를 위한 최고 플랜",
      features: [
        "Unlimited + 4 API-Powered Mini Functions",
        "무제한 저장",
        "모든 Pro 플랜 기능",
        "근처 맛집 추천",
        "고급 API 기능",
        "전용 고객 지원",
        "사용량 통계 및 리포트",
        "데이터 내보내기/가져오기",
        "클라우드 백업",
        "다크모드 커스터마이징"
      ],
      miniFunctions: [
        "모든 Pro 플랜 기능", "맛집 추천", "고급 분석", "무제한 저장"
      ],
      buttonText: "문의하기",
      buttonStyle: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white",
      popular: false,
      cardStyle: "border-purple-500"
    }
  ]

  // Redirect free users to pricing
  if (currentPlan === 'free') {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto responsive-p-md py-8">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
            >
              ← Back
            </button>
            
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h1m0 0V3a2 2 0 112 0v1h1a2 2 0 011 1v1M9 7h6" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-4">✨ Mini Functions</h1>
              <p className="text-xl text-gray-300 mb-2">
                Your personal dashboard widgets
              </p>
              <p className="text-gray-400">
                Choose the perfect plan to unlock powerful Mini Functions
              </p>
            </div>

            {/* Pricing Plans - 3x1 Layout */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {pricingPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative bg-gray-900/50 backdrop-blur-sm rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl p-6 ${plan.cardStyle}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        🔥 Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {plan.id === 'free' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        )}
                        {plan.id === 'pro' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        )}
                        {plan.id === 'unlimited' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        )}
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 text-lg">{plan.priceUnit}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  {/* Mini Functions Preview */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h1m0 0V3a2 2 0 112 0v1h1a2 2 0 011 1v1M9 7h6" />
                      </svg>
                      Mini Functions
                    </h4>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {plan.miniFunctions.slice(0, 4).map((func, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md font-medium">
                          {func}
                        </span>
                      ))}
                      {plan.miniFunctions.length > 4 && (
                        <span className="px-2 py-1 bg-gray-600 text-gray-400 text-xs rounded-md font-medium">
                          +{plan.miniFunctions.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features List - Condensed */}
                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-gray-400 text-xs pl-6">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>

                  {/* Action Button */}
                  <button 
                    onClick={() => plan.id !== 'free' ? router.push('/pricing') : undefined}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${plan.buttonStyle}`}
                    disabled={plan.id === "free"}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-2">🔒 Unlock Mini Functions</h3>
                <p className="text-gray-300 mb-4">
                  Mini Functions are available in Pro and Premium plans
                </p>
                <button 
                  onClick={() => router.push('/pricing')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  View Full Pricing Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleToggleFunction = (func: MiniFunctionData) => {
    if (func.isEnabled) {
      disableFunction(func.type)
    } else if (canEnableMore) {
      enableFunction(func.type)
    }
  }

  const enableAllFunctions = () => {
    const availableSlots = maxEnabled - enabledFunctions.length
    const functionsToEnable = availableFunctions
      .filter(func => !func.isEnabled)
      .slice(0, availableSlots)
    
    functionsToEnable.forEach(func => enableFunction(func.type))
  }

  const disableAllFunctions = () => {
    enabledFunctions.forEach(func => disableFunction(func.type))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back
            </button>
            <h1 className="responsive-text-3xl font-bold">Mini Functions Settings</h1>
            <p className="text-gray-400 mt-2">
              Choose up to {maxEnabled} Mini Functions to display on your dashboard
            </p>
          </div>

          {/* Beta Testing Notice */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-400 text-lg">🧪</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Beta Testing Phase</h3>
                <p className="text-sm text-gray-300 mb-2">
                  Mini Functions are currently in testing mode with simulated data.
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• <strong>Stock Market:</strong> Real Yahoo Finance data</li>
                  <li>• <strong>Commute Time:</strong> Simulated traffic data (Real API integration planned)</li>
                  <li>• <strong>Other Functions:</strong> Sample data for UI/UX testing</li>
                </ul>
                <div className="mt-2 text-xs text-gray-400">
                  📈 Real-time data services will be available in the official release
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan Info */}
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg capitalize">{currentPlan} Plan</h3>
                <p className="text-gray-400 text-sm">
                  {enabledFunctions.length}/{maxEnabled} Mini Functions enabled
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(enabledFunctions.length / maxEnabled) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">
                  {enabledFunctions.length}/{maxEnabled}
                </span>
              </div>
            </div>
          </div>

          {/* Functions Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Available Functions</h2>
              <div className="flex items-center gap-3">
                {enabledFunctions.length > 0 && (
                  <button
                    onClick={disableAllFunctions}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Disable All
                  </button>
                )}
                {canEnableMore && (
                  <button
                    onClick={enableAllFunctions}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add All Available ({Math.min(maxEnabled - enabledFunctions.length, availableFunctions.filter(f => !f.isEnabled).length)})
                  </button>
                )}
                {!canEnableMore && (
                  <span className="text-yellow-400 text-sm">
                    Maximum functions reached
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableFunctions.map((func) => (
                <div
                  key={func.id}
                  className={`relative p-6 rounded-lg border transition-all cursor-pointer ${
                    func.isEnabled
                      ? 'bg-gray-700 border-blue-500'
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => handleToggleFunction(func)}
                >
                  {/* Enabled Badge */}
                  {func.isEnabled && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Disabled overlay */}
                  {!func.isEnabled && !canEnableMore && (
                    <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm font-medium">Limit Reached</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{func.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{func.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {getFunctionDescription(func.type)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFunction(func)
                          }}
                          disabled={!func.isEnabled && !canEnableMore}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            func.isEnabled
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : canEnableMore
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {func.isEnabled ? 'Remove' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Prompt */}
          {currentPlan === 'pro' && (
            <div className="mt-12 bg-gray-800 border border-gray-600 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Want more Mini Functions?</h3>
              <p className="text-gray-400 mb-4">
                Upgrade to Premium to unlock 4 Mini Functions (double your current limit!)
              </p>
              <button 
                onClick={() => router.push('/pricing')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <h3 className="font-semibold mb-4">About Mini Functions</h3>
            <div className="text-gray-400 text-sm space-y-2">
              <p>
                Mini Functions are compact widgets that display on your main dashboard, 
                giving you quick access to important information and tools.
              </p>
              <p>
                Choose the functions that matter most to your daily routine. 
                You can change your selection anytime from this settings page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getFunctionDescription(type: string): string {
  switch (type) {
    case 'news':
      return 'Stay updated with the latest news headlines and trending topics'
    case 'music':
      return 'Get personalized music recommendations based on time of day'
    case 'alarm':
      return 'View your next alarm and manage your daily wake-up schedule'
    case 'expense':
      return 'Track your daily expenses with quick input and running totals'
    case 'diary':
      return 'Write daily journal entries with mood tracking and quick notes'
    case 'stocks':
      return 'Monitor real-time stock prices and your watchlist with live market data'
    case 'commute':
      return 'Check real-time commute times and traffic conditions for your routes'
    case 'food':
      return 'Discover nearby restaurants with ratings, reviews, and opening hours'
    case 'dday':
      return 'Track important dates and countdown to special events and deadlines'
    default:
      return 'A useful mini function for your dashboard'
  }
}