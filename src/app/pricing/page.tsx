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
      miniFunctions: [
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
      miniFunctions: [
        "모든 Free 플랜 기능", "뉴스", "음악 추천", "주식", 
        "출근길", "환율현황", "24시간 주변약국"
      ],
      buttonText: "업그레이드",
      buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
      popular: true,
      cardStyle: "border-blue-500 shadow-xl shadow-blue-500/20"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Professional Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-200/50">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">Subscription Plans</h1>
              <p className="text-gray-600">Choose the perfect plan for your lifestyle management needs</p>
            </div>
          </div>
          <Link
            href="/mini-functions"
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-all flex items-center gap-2 shadow-sm hover:shadow-md font-medium whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            View Mini Functions
          </Link>
        </div>

        {/* Plan Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white/70 backdrop-blur-sm rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl p-8 ${plan.cardStyle}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    🔥 Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 text-lg">{plan.priceUnit}</span>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
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
                  {plan.miniFunctions.slice(0, 6).map((func, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                      {func}
                    </span>
                  ))}
                  {plan.miniFunctions.length > 6 && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-md font-medium">
                      +{plan.miniFunctions.length - 6} more
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
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Plan Comparison</h2>
            <p className="text-gray-600">Compare features across all subscription plans</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-blue-600">Pro</th>
                  <th className="text-center py-4 px-6 font-semibold text-purple-600">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Mini Functions</td>
                  <td className="py-4 px-6 text-center text-gray-600">12 Basic</td>
                  <td className="py-4 px-6 text-center text-blue-600 font-semibold">All + 2 API</td>
                  <td className="py-4 px-6 text-center text-purple-600 font-semibold">All + 4 API</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Content Storage</td>
                  <td className="py-4 px-6 text-center text-gray-600">50 each type</td>
                  <td className="py-4 px-6 text-center text-blue-600 font-semibold">500 each type</td>
                  <td className="py-4 px-6 text-center text-purple-600 font-semibold">Unlimited</td>
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

        {/* FAQ Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about our pricing plans</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                💾 <span>How does the 50-item limit work in the Free plan?</span>
              </h3>
              <p className="text-gray-600 text-sm">
                You can store up to 50 items per content type (Links, Videos, Images, Notes). When you reach the limit, you&apos;ll need to manually delete existing items before adding new ones. The system never deletes your data automatically.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                💳 <span>When am I charged?</span>
              </h3>
              <p className="text-gray-600 text-sm">
                Pro and Premium plans are billed monthly. You can cancel anytime and continue using the service until the end of your current billing period.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🔄 <span>Is my data safely backed up?</span>
              </h3>
              <p className="text-gray-600 text-sm">
                All data is securely backed up in real-time to Supabase&apos;s cloud servers. You can access your data from any device by signing in with your Google account.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                ↩️ <span>Can I downgrade to the Free plan?</span>
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, you can downgrade anytime. If you exceed the 50-item limit, you&apos;ll need to manually delete excess items to add new ones. All your data remains safe.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white shadow-2xl">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Manage all your digital life in one smart, beautiful place
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                Start Free
              </Link>
              <Link
                href="/mini-functions"
                className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-all border border-blue-400 shadow-lg"
              >
                Explore Functions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}