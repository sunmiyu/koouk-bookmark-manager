'use client'

import Link from 'next/link'

export default function PricingPage() {
  const plans = [
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
      features_list: [
        "가계부", "일기", "알람", "D-Day", "노래 연습 List",
        "기념일 등록", "목표 세팅", "영어 공부", "단위변환",
        "세계시간", "운동기록", "동기부여 글귀"
      ],
      buttonText: "현재 플랜",
      buttonStyle: "bg-gray-200 text-gray-700 cursor-not-allowed",
      popular: false,
      cardStyle: "border-gray-200"
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
      features_list: [
        "모든 Free 플랜 기능", "뉴스", "음악 추천", "주식", 
        "출근길", "환율현황", "24시간 주변약국"
      ],
      buttonText: "업그레이드",
      buttonStyle: "bg-black hover:bg-gray-800 text-white",
      popular: true,
      cardStyle: "border-gray-400 shadow-lg"
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
      features_list: [
        "모든 Pro 플랜 기능", "맛집 추천", "고급 분석", "무제한 저장"
      ],
      buttonText: "문의하기",
      buttonStyle: "bg-gray-800 hover:bg-gray-900 text-white",
      popular: false,
      cardStyle: "border-gray-300"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Professional Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-medium text-gray-900 mb-1">Subscription Plans</h1>
              <p className="text-sm text-gray-600">Choose the perfect plan for your needs</p>
            </div>
          </div>
        </div>

        {/* Plan Selection Cards */}
        <div className="max-w-sm mx-auto space-y-4 mb-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-gray-50 rounded-md border transition-all duration-200 hover:shadow-sm p-4 ${plan.cardStyle}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-black text-white px-3 py-1 rounded-md text-xs font-medium">
                    🔥 Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <h3 className="text-sm font-medium text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-base font-medium text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 text-sm">{plan.priceUnit}</span>
                </div>
                <p className="text-gray-600 text-xs">{plan.description}</p>
              </div>

              {/* Mini Functions Preview */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h1m0 0V3a2 2 0 112 0v1h1a2 2 0 011 1v1M9 7h6" />
                  </svg>
                  Mini Functions
                </h4>
                <div className="flex flex-wrap gap-1 mb-4">
                  {plan.features_list.slice(0, 6).map((func, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                      {func}
                    </span>
                  ))}
                  {plan.features_list.length > 6 && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-md font-medium">
                      +{plan.features_list.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button 
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${plan.buttonStyle}`}
                disabled={plan.id === "free"}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison Section */}
        <div className="bg-gray-50 rounded-md border border-gray-200 p-4 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-sm font-medium text-gray-900 mb-1">Plan Comparison</h2>
            <p className="text-xs text-gray-600">Compare features across all plans</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-900">Features</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-900">Free</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-900">Pro</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 px-3 font-medium text-gray-900">Mini Functions</td>
                  <td className="py-2 px-3 text-center text-gray-600">12 Basic</td>
                  <td className="py-2 px-3 text-center text-gray-900 font-medium">All + 2 API</td>
                  <td className="py-2 px-3 text-center text-gray-900 font-medium">All + 4 API</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-gray-900">Content Storage</td>
                  <td className="py-2 px-3 text-center text-gray-600">50 each type</td>
                  <td className="py-2 px-3 text-center text-gray-900 font-medium">500 each type</td>
                  <td className="py-2 px-3 text-center text-gray-900 font-medium">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">API Features</td>
                  <td className="py-4 px-6 text-center">
                    <svg className="w-5 h-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Priority Support</td>
                  <td className="py-4 px-6 text-center">
                    <svg className="w-5 h-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        {/* CTA Section */}
        <div className="bg-gray-100 rounded-md p-4 text-center border border-gray-200">
          <div className="max-w-sm mx-auto">
            <h2 className="text-sm font-medium mb-2">Ready to get started?</h2>
            <p className="text-xs mb-4 text-gray-600">
              Manage your digital life in one place
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full bg-black text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-gray-800 transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}