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
        "고급 분석 도구",
        "커스텀 통합"
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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            요금제 선택
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
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
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.priceUnit && (
                    <span className="text-gray-400">{plan.priceUnit}</span>
                  )}
                </div>
                <p className="text-gray-400 mt-2">{plan.description}</p>
              </div>

              {/* 기능 목록 */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* 버튼 */}
              <button 
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${plan.buttonStyle}`}
                disabled={plan.name === "Free"}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ 섹션 */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">💳 결제는 언제 이루어지나요?</h3>
              <p className="text-gray-400">
                Pro 플랜은 월 단위로 자동 결제됩니다. 언제든지 취소할 수 있으며, 취소 시 현재 결제 주기가 끝날 때까지 서비스를 이용할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">📱 카카오톡 알림은 어떻게 설정하나요?</h3>
              <p className="text-gray-400">
                Pro 플랜 업그레이드 후 설정 페이지에서 카카오 계정을 연동하고 알림 시간을 설정할 수 있습니다. 매일 지정된 시간에 할 일을 카카오톡으로 받아보세요.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🔄 데이터는 안전하게 백업되나요?</h3>
              <p className="text-gray-400">
                모든 데이터는 Google Firebase의 안전한 클라우드 서버에 실시간으로 백업됩니다. 기기를 바꿔도 Gmail 계정으로 로그인하면 모든 데이터를 그대로 사용할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">↩️ 무료 플랜으로 다운그레이드할 수 있나요?</h3>
              <p className="text-gray-400">
                언제든 무료 플랜으로 변경할 수 있습니다. 단, 저장된 항목이 50개를 초과하는 경우 가장 오래된 항목부터 자동으로 숨겨집니다. (삭제되지는 않음)
              </p>
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">지금 시작해보세요!</h2>
            <p className="text-xl mb-6 opacity-90">
              모든 북마크를 한 곳에서 스마트하게 관리하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                무료로 시작하기
              </button>
              <button className="bg-blue-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors border border-blue-400">
                Pro 플랜 체험하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}