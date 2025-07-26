'use client'

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "무료",
      description: "개인 사용자를 위한 기본 플랜",
      features: [
        "각 콘텐츠 타입별 50개 제한",
        "Links, Videos, Images, Notes 50개씩",
        "Todos 무제한",
        "Gmail 로그인",
        "실시간 날씨",
        "웹 알림",
        "PWA 지원"
      ],
      buttonText: "현재 플랜",
      buttonStyle: "bg-gray-600 cursor-not-allowed",
      popular: false
    },
    {
      name: "Pro Premium",
      price: "$4.99",
      priceUnit: "/월",
      description: "파워 유저를 위한 프리미엄 플랜",
      features: [
        "각 콘텐츠 타입별 500개",
        "모든 무료 플랜 기능",
        "카카오톡 알림 연동",
        "데이터 내보내기/가져오기",
        "우선순위 고객지원",
        "다크모드 커스터마이징",
        "클라우드 백업"
      ],
      buttonText: "업그레이드",
      buttonStyle: "bg-blue-600 hover:bg-blue-700",
      popular: true
    },
    {
      name: "Unlimited",
      price: "$9.99",
      priceUnit: "/월",
      description: "팀과 기업을 위한 무제한 플랜",
      features: [
        "무제한 저장",
        "모든 Pro 플랜 기능",
        "팀 공유 기능",
        "API 접근 권한",
        "전용 고객 지원",
        "사용량 통계 및 리포트",
        "외부 툴 연동 (Slack, Notion 등)"
      ],
      buttonText: "문의하기",
      buttonStyle: "bg-purple-600 hover:bg-purple-700",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
            요금제 선택
          </h1>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto">
            당신의 북마크 관리 스타일에 맞는 플랜을 선택하세요
          </p>
        </div>

        {/* 요금제 카드들 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-gray-900 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* 인기 배지 */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    🔥 가장 인기
                  </span>
                </div>
              )}

              {/* 플랜 이름 */}
              <div className="text-center mb-4">
                <h3 className="text-lg md:text-2xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl md:text-4xl font-bold">{plan.price}</span>
                  {plan.priceUnit && (
                    <span className="text-gray-400 text-sm md:text-base">{plan.priceUnit}</span>
                  )}
                </div>
                <p className="text-gray-400 mt-1 text-sm md:text-base">{plan.description}</p>
              </div>

              {/* 기능 목록 */}
              <ul className="space-y-2 md:space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300 text-sm md:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* 버튼 */}
              <button 
                className={`w-full py-2 md:py-3 px-4 md:px-6 rounded-xl font-semibold transition-colors text-sm md:text-base ${plan.buttonStyle}`}
                disabled={plan.name === "Free"}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ 섹션 */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-8">자주 묻는 질문</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h3 className="text-base md:text-xl font-semibold mb-2">💾 무료 플랜에서 50개 제한은 어떻게 작동하나요?</h3>
              <p className="text-gray-400 text-sm md:text-base">
                각 콘텐츠 타입별로 50개까지 저장할 수 있습니다. 50개에 도달하면 새로운 항목을 추가하기 전에 기존 항목을 직접 삭제해야 합니다. 시스템이 임의로 삭제하지 않으므로 안심하세요.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h3 className="text-base md:text-xl font-semibold mb-2">💳 결제는 언제 이루어지나요?</h3>
              <p className="text-gray-400 text-sm md:text-base">
                Pro 플랜은 월 단위로 자동 결제됩니다. 언제든지 취소할 수 있으며, 취소 시 현재 결제 주기가 끝날 때까지 서비스를 이용할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h3 className="text-base md:text-xl font-semibold mb-2">📱 카카오톡 알림은 어떻게 설정하나요?</h3>
              <p className="text-gray-400 text-sm md:text-base">
                Pro 플랜 업그레이드 후 설정 페이지에서 카카오 계정을 연동하고 알림 시간을 설정할 수 있습니다. 매일 지정된 시간에 할 일을 카카오톡으로 받아보세요.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h3 className="text-base md:text-xl font-semibold mb-2">🔄 데이터는 안전하게 백업되나요?</h3>
              <p className="text-gray-400 text-sm md:text-base">
                모든 데이터는 Google Firebase의 안전한 클라우드 서버에 실시간으로 백업됩니다. 기기를 바꿔도 Gmail 계정으로 로그인하면 모든 데이터를 그대로 사용할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h3 className="text-base md:text-xl font-semibold mb-2">↩️ 무료 플랜으로 다운그레이드할 수 있나요?</h3>
              <p className="text-gray-400 text-sm md:text-base">
                언제든 무료 플랜으로 변경할 수 있습니다. 50개 제한을 초과한 경우, 새로운 항목을 추가하려면 기존 항목을 직접 삭제해야 합니다. 모든 데이터는 안전하게 보관됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
            <h2 className="text-xl md:text-3xl font-bold mb-3">지금 시작해보세요!</h2>
            <p className="text-base md:text-xl mb-4 md:mb-6 opacity-90">
              모든 북마크를 한 곳에서 스마트하게 관리하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-white text-blue-600 px-6 md:px-8 py-2 md:py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base">
                무료로 시작하기
              </button>
              <button className="bg-blue-800 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors border border-blue-400 text-sm md:text-base">
                Pro 플랜 체험하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}