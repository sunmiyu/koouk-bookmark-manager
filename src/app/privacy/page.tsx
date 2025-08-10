'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs">Back to Koouk</span>
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <h1 className="text-sm font-semibold text-gray-900">Privacy Policy</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-sm max-w-none">
          <div className="mb-6">
            <h1 className="text-lg font-bold text-gray-900 mb-2">개인정보 처리방침</h1>
            <p className="text-xs text-gray-600">최종 업데이트: 2024년 1월</p>
          </div>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">1. 개인정보의 처리목적</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>Koouk(&apos;https://koouk.im&apos; 이하 &apos;쿠욱&apos;)은(는) 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                <li>개인화된 서비스 제공</li>
                <li>서비스 부정이용 방지</li>
                <li>각종 고지·통지, 고충처리</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">2. 개인정보의 처리 및 보유기간</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① 쿠욱은 정보주체로부터 개인정보를 수집할 때 동의받은 개인정보 보유·이용기간 또는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
              <p>② 구체적인 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>회원가입 및 관리:</strong> 서비스 이용계약 또는 회원가입 해지시까지</li>
                <li><strong>서비스 제공:</strong> 서비스 이용계약 체결부터 서비스 이용계약 해지까지</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">3. 처리하는 개인정보의 항목</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① 쿠욱은 다음의 개인정보 항목을 처리하고 있습니다.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>필수항목:</strong> 이메일, 서비스 이용 기록</li>
                <li><strong>선택항목:</strong> 프로필 정보</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① 쿠욱은 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
              <p>② 쿠욱은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">5. 개인정보처리의 위탁</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① 쿠욱은 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>Supabase Inc.</strong></p>
                <p>위탁업무: 클라우드 서비스 및 데이터베이스 관리</p>
                <p>위탁기간: 서비스 이용계약 체결부터 해지까지</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">6. 정보주체의 권리·의무 및 행사방법</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① 정보주체는 쿠욱에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>개인정보 처리현황 통지요구</li>
                <li>개인정보 처리정지 요구</li>
                <li>개인정보의 정정·삭제 요구</li>
                <li>손해배상 청구</li>
              </ul>
              <p>② 권리 행사는 support@koouk.im으로 연락주시기 바랍니다.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">7. 개인정보의 안전성 확보조치</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>쿠욱은 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>개인정보 취급 직원의 최소화 및 교육</li>
                <li>개인정보에 대한 접근 제한</li>
                <li>개인정보의 암호화</li>
                <li>해킹 등에 대비한 기술적 대책</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">8. 개인정보 보호책임자</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① 쿠욱은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>개인정보 보호책임자</strong></p>
                <p>이메일: support@koouk.im</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">9. 개인정보 처리방침의 변경</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
            </div>
          </section>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              문의사항이 있으시면 <a href="mailto:support@koouk.im" className="text-blue-600 hover:underline">support@koouk.im</a>으로 연락주세요.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}