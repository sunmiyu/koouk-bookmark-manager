import Link from 'next/link'

export default function TermsOfServiceKo() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="responsive-text-3xl font-bold mb-8">이용약관</h1>
          <div className="text-gray-400 text-sm mb-6">최근 업데이트: 2025년 1월 28일</div>
          
          <div className="space-y-8 responsive-text-base leading-relaxed">
            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">1. 약관 동의</h2>
              <p className="text-gray-300">
                Koouk (&quot;서비스&quot;)에 접속하고 이용함으로써, 
                본 약관의 조건에 동의하고 구속받는 것에 동의합니다. 위 사항에 동의하지 않으시면 
                본 서비스를 이용하지 마세요.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">2. 서비스 설명</h2>
              <p className="text-gray-300 mb-4">
                Koouk은 다음을 제공하는 개인 라이프 허브입니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>동영상, 링크, 이미지, 메모의 북마크 관리</li>
                <li>할 일 및 작업 관리</li>
                <li>일상 생활 지원을 위한 미니 기능들</li>
                <li>실시간 날씨 및 개인 대시보드</li>
                <li>기기 간 동기화</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">3. 사용자 계정</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">계정 생성</h3>
                  <p className="text-gray-300">
                    Koouk을 사용하려면 Google OAuth를 통해 계정을 생성해야 합니다. 
                    계정 보안 유지에 대한 책임은 사용자에게 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">계정 책임</h3>
                  <p className="text-gray-300">
                    계정에서 발생하는 모든 활동에 대한 책임은 사용자에게 있습니다. 
                    계정의 무단 사용을 발견하면 즉시 알려주세요.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">4. 사용 규칙</h2>
              <p className="text-gray-300 mb-4">다음과 같은 행위를 하지 않기로 동의합니다:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>불법적이거나 승인되지 않은 목적으로 서비스 사용</li>
                <li>유해하거나 공격적이거나 부적절한 콘텐츠 저장 또는 공유</li>
                <li>서비스나 다른 사용자 계정에 무단 접근 시도</li>
                <li>서비스나 서버를 방해하거나 중단시키는 행위</li>
                <li>허가 없이 자동화 도구를 사용하여 서비스에 접근</li>
                <li>관할 지역의 법률 위반</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">5. 구독 플랜</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">플랜 유형</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li><strong>무료:</strong> 각 유형별 50개 항목 제한, 미니 기능 없음</li>
                    <li><strong>프로:</strong> 각 유형별 1,000개 항목, 3개 미니 기능</li>
                    <li><strong>프리미엄:</strong> 무제한 항목, 모든 미니 기능</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">결제 및 환불</h3>
                  <p className="text-gray-300">
                    유료 구독은 월별 또는 연별로 청구됩니다. 환불 정책은 
                    결제 처리업체의 약관에 따릅니다.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">6. 지적재산권</h2>
              <p className="text-gray-300">
                Koouk 서비스, 소프트웨어, 브랜드, 로고는 저희의 지적재산입니다. 
                사용자가 생성한 콘텐츠의 소유권은 사용자에게 있으며, 서비스 제공을 위해 
                필요한 라이선스를 저희에게 부여합니다.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">7. 면책조항</h2>
              <p className="text-gray-300 mb-4">
                Koouk은 &quot;있는 그대로&quot; 제공되며, 다음에 대해 책임지지 않습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>서비스 중단 또는 데이터 손실</li>
                <li>제3자 서비스와의 호환성 문제</li>
                <li>사용자가 저장한 콘텐츠의 정확성</li>
                <li>외부 링크나 서비스로 인한 피해</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">8. 계정 종료</h2>
              <p className="text-gray-300">
                언제든지 계정을 삭제할 수 있으며, 약관 위반 시 계정을 정지하거나 
                종료할 수 있습니다. 종료 시 모든 데이터가 삭제됩니다.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">9. 약관 변경</h2>
              <p className="text-gray-300">
                이용약관을 수시로 업데이트할 수 있습니다. 중요한 변경사항은 
                이메일이나 서비스 내 알림을 통해 사전에 알려드립니다.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">10. 준거법</h2>
              <p className="text-gray-300">
                본 약관은 대한민국 법률에 따라 해석되며, 분쟁 발생 시 
                대한민국 법원이 관할권을 가집니다.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">11. 문의</h2>
              <p className="text-gray-300">
                이용약관에 대한 질문이 있으시면 연락주세요:
              </p>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <p className="text-blue-400">이메일: support@koouk.com</p>
                <p className="text-gray-400">Koouk 개발팀</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex gap-4 text-sm">
              <a href="/ko/privacy" className="text-blue-400 hover:text-blue-300">개인정보처리방침</a>
              <a href="/ko/cookies" className="text-blue-400 hover:text-blue-300">쿠키 정책</a>
              <Link href="/" className="text-blue-400 hover:text-blue-300">Koouk으로 돌아가기</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}